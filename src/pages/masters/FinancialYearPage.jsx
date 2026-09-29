import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Tooltip,
  Paper,
  InputAdornment,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const FinancialYearPage = () => {
  const { financialYears, fetchFinancialYears, updateFinancialYear, deleteFinancialYear, apiBase } = useData();
  const { activeYear, changeYear, showToast, isYearLocked, checkCanModify } = useApp();
  const currentApiBase = apiBase || 'http://localhost:5000/api';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    yearName: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchFinancialYears({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchFinancialYears, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    if (!checkCanModify('નવું વર્ષ ઉમેરો')) return;
    setEditingId(null);
    setFormData({
      yearName: '',
      startDate: '2027-04-01',
      endDate: '2028-03-31',
      isCurrent: false,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (y) => {
    if (!checkCanModify('વર્ષ સુધારો')) return;
    setEditingId(y.id);
    const sDate = y.start_date || y.startDate;
    const eDate = y.end_date || y.endDate;
    setFormData({
      yearName: y.year_name || y.name || '',
      startDate: sDate ? (typeof sDate === 'string' && sDate.includes('T') ? sDate.split('T')[0] : sDate) : '',
      endDate: eDate ? (typeof eDate === 'string' && eDate.includes('T') ? eDate.split('T')[0] : eDate) : '',
      isCurrent: Boolean(y.is_current || y.isCurrent),
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'વર્ષ સુધારો' : 'નવું વર્ષ ઉમેરો')) return;
    if (!formData.yearName) {
      showToast('કૃપા કરીને વર્ષનું નામ દાખલ કરો.', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateFinancialYear(editingId, {
          year_name: formData.yearName,
          start_date: formData.startDate,
          end_date: formData.endDate,
          is_current: formData.isCurrent
        });
        if (res && res.success) {
          showToast('નાણાકીય વર્ષ વિગત સફળતાપૂર્વક સુધારી લેવાઈ!');
          setOpenModal(false);
          loadData();
        } else {
          showToast(res?.message || 'વર્ષ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await fetch(`${currentApiBase}/masters/years`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year_name: formData.yearName,
            start_date: formData.startDate,
            end_date: formData.endDate,
            is_current: formData.isCurrent
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('નવું નાણાકીય વર્ષ સફળતાપૂર્વક ઉમેરાયું!');
          setOpenModal(false);
          loadData();
        } else {
          showToast(data.message || 'વર્ષ ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('સર્વર ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('વર્ષ ડિલીટ')) return;
    try {
      const res = await deleteFinancialYear(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('નાણાકીય વર્ષ સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
      } else {
        showToast(res?.message || 'વર્ષ ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadData();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const handleSetActive = (yearName) => {
    changeYear(yearName);
  };

  return (
    <Box>
      <PageHeader
        title="નાણાકીય વર્ષ માસ્ટર"
        subtitle="હિસાબી વર્ષોની યાદી, સક્રિય વર્ષ પસંદગી અને હિસાબ લૉક વ્યવસ્થા"
        breadcrumb="માસ્ટર / નાણાકીય વર્ષ"
        icon={<CalendarMonthIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવું વર્ષ ઉમેરી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવું વર્ષ ઉમેરો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. વર્ષ સંચાલનમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="નાણાકીય વર્ષ શોધો..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>વર્ષનું નામ</TableCell>
                <TableCell>શરૂઆત તારીખ</TableCell>
                <TableCell>આખર તારીખ</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center">હિસાબ લૉક સ્થિતિ</TableCell>
                <TableCell align="center">વર્ષ પ્રકાર</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(financialYears || []).map((y) => {
                const yName = y.year_name || y.name;
                const sDate = formatDate(y.start_date || y.startDate);
                const eDate = formatDate(y.end_date || y.endDate);
                const isLocked = Boolean(y.is_locked || y.isLocked || (yName !== '૨૦૨૬-૨૦૨૭' && yName !== '2026-2027'));
                const isCurrent = Boolean(y.is_current || y.isCurrent || yName === '૨૦૨૬-૨૦૨૭');

                return (
                  <TableRow key={y.id || yName} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.98rem' }}>
                      {yName}
                    </TableCell>
                    <TableCell>{sDate}</TableCell>
                    <TableCell>{eDate}</TableCell>
                    <TableCell align="center">
                      {activeYear === yName ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="ચાલુ સક્રિય વર્ષ"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSetActive(yName)}
                        >
                          આ વર્ષ જુઓ
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <Chip
                          icon={isLocked ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
                          label={isLocked ? 'લૉક થયેલ (ફક્ત વાંચવા/પ્રિન્ટ)' : 'ખુલ્લું (સંપૂર્ણ પ્રવેશ)'}
                          size="small"
                          color={isLocked ? 'error' : 'success'}
                          variant={isLocked ? 'filled' : 'outlined'}
                        />
                      </span>
                      <span className="print-only">
                        {isLocked ? 'લૉક થયેલ' : 'ખુલ્લું'}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <Chip
                          label={isCurrent ? 'ચાલુ નાણાકીય સાલ' : 'ગત નાણાકીય સાલ'}
                          size="small"
                          variant="outlined"
                        />
                      </span>
                      <span className="print-only">
                        {isCurrent ? 'ચાલુ સાલ' : 'ગત સાલ'}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "વર્ષ લૉક હોવાથી ફેરફાર શક્ય નથી" : "સુધારો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isYearLocked}
                            onClick={() => handleOpenEdit(y)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isYearLocked || isCurrent ? "ચાલુ અથવા લૉક વર્ષ ડિલીટ શક્ય નથી" : "ડિલીટ કરો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isYearLocked || isCurrent}
                            onClick={() => setDeleteId(y.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!financialYears || financialYears.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ વર્ષ મળ્યું નથી.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="પ્રતિ પેજ વર્ષો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="નાણાકીય વર્ષ ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ નાણાકીય વર્ષ ડિલીટ કરવા માંગો છો? જો આ વર્ષમાં પિયત નોંધણી કે હિસાબી એન્ટ્રીઓ હશે તો ડિલીટ થશે નહીં."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* નવું વર્ષ ઉમેરવા/સુધારવા માટે મોડલ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'નાણાકીય વર્ષ સુધારો' : 'નવું નાણાકીય વર્ષ ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="વર્ષનું નામ (દા.ત. ૨૦૨૭-૨૦૨૮)"
            fullWidth
            value={formData.yearName}
            onChange={(e) => setFormData({ ...formData, yearName: e.target.value })}
            autoFocus
          />
          <TextField
            label="શરૂઆત તારીખ"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <TextField
            label="આખર તારીખ"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            સાચવો (Save)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialYearPage;
