import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  FormControlLabel,
  Switch,
  Typography,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import StarIcon from '@mui/icons-material/Star';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const FinancialYearPage = () => {
  const {
    financialYears,
    fetchFinancialYears,
    updateFinancialYear,
    deleteFinancialYear,
    setCurrentFinancialYear,
    toggleLockFinancialYear,
    apiBase
  } = useData();

  const { activeYear, changeYear, showToast, isYearLocked, refreshYears } = useApp();
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
    isLocked: true,
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
    setEditingId(null);
    setFormData({
      yearName: '',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      isCurrent: true,
      isLocked: false,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (y) => {
    setEditingId(y.id);
    const sDate = y.start_date || y.startDate;
    const eDate = y.end_date || y.endDate;
    const isCurrentVal = Boolean(y.is_current === 1 || y.isCurrent);
    const isLockedVal = Boolean(y.is_locked === 1 || y.isLocked);

    setFormData({
      yearName: y.year_name || y.name || '',
      startDate: sDate ? (typeof sDate === 'string' && sDate.includes('T') ? sDate.split('T')[0] : sDate) : '',
      endDate: eDate ? (typeof eDate === 'string' && eDate.includes('T') ? eDate.split('T')[0] : eDate) : '',
      isCurrent: isCurrentVal,
      isLocked: isLockedVal,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
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
          is_current: formData.isCurrent ? 1 : 0,
          is_locked: formData.isLocked ? 1 : 0
        });
        if (res && res.success) {
          showToast('નાણાકીય વર્ષ વિગત સફળતાપૂર્વક સુધારી લેવાઈ!');
          setOpenModal(false);
          await refreshYears();
          if (formData.isCurrent) {
            changeYear(formData.yearName);
          }
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
            is_current: formData.isCurrent ? 1 : 0,
            is_locked: formData.isLocked ? 1 : 0
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'નવું નાણાકીય વર્ષ સફળતાપૂર્વક ઉમેરાયું!');
          setOpenModal(false);
          await refreshYears();
          if (formData.isCurrent) {
            changeYear(formData.yearName);
          }
          loadData();
        } else {
          showToast(data.message || 'વર્ષ ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('સર્વર ભૂલ: ' + e.message, 'error');
    }
  };

  const handleSetCurrent = async (y) => {
    const yName = y.year_name || y.name;
    try {
      const res = await setCurrentFinancialYear(y.id);
      if (res && res.success) {
        showToast(`${yName} સફળતાપૂર્વક ચાલુ સક્રિય વર્ષ બનાવવામાં આવ્યું! પાછલા વર્ષો લૉક કરવામાં આવ્યા.`, 'success');
        changeYear(yName);
        await refreshYears();
        loadData();
      } else {
        showToast(res?.message || 'ચાલુ વર્ષ બનાવવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const handleToggleLock = async (y) => {
    try {
      const res = await toggleLockFinancialYear(y.id);
      if (res && res.success) {
        showToast(res.message || 'વર્ષ લૉક સ્થિતિ બદલાઈ.', 'success');
        await refreshYears();
        loadData();
      } else {
        showToast(res?.message || 'લૉક સ્થિતિ બદલવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteFinancialYear(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('નાણાકીય વર્ષ સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
        await refreshYears();
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
        subtitle="હિસાબી વર્ષોની યાદી, ચાલુ સક્રિય વર્ષ નિર્ધારણ અને હિસાબ લૉક સુરક્ષા વ્યવસ્થા"
        breadcrumb="માસ્ટર / નાણાકીય વર્ષ"
        icon={<CalendarMonthIcon sx={{ fontSize: 28 }} />}
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            નવું નાણાકીય વર્ષ ઉમેરો
          </Button>
        }
      />

      {isYearLocked && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>હાલ જોવામાં આવતું વર્ષ ({activeYear}) લૉક છે:</b> આ વર્ષના બિલો અને હિસાબો ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) કરી શકાશે. તેમાં કોઈ ઉમેરો, ફેરફાર કે ડિલીટ શક્ય નથી.
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
                <TableCell align="center">દર્શાવેલું વર્ષ (View)</TableCell>
                <TableCell align="center">નાણાકીય સાલ પ્રકાર</TableCell>
                <TableCell align="center">હિસાબ લૉક સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(financialYears || []).map((y) => {
                const yName = y.year_name || y.name;
                const sDate = formatDate(y.start_date || y.startDate);
                const eDate = formatDate(y.end_date || y.endDate);
                const isCurrent = Boolean(y.is_current === 1 || y.isCurrent);
                const isLocked = Boolean(y.is_locked === 1 || y.isLocked);
                const isCurrentlyViewing = activeYear === yName;

                return (
                  <TableRow key={y.id || yName} hover selected={isCurrent}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.98rem' }}>
                      {yName}
                      {isCurrent && (
                        <Chip
                          label="ચાલુ વર્ષ"
                          color="primary"
                          size="small"
                          sx={{ ml: 1, fontSize: '0.72rem', height: 20 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{sDate}</TableCell>
                    <TableCell>{eDate}</TableCell>
                    <TableCell align="center">
                      {isCurrentlyViewing ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="હાલ પસંદિત"
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
                      {isCurrent ? (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 16 }} />}
                          label="ચાલુ સક્રિય સાલ"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Tooltip title="આ વર્ષને ચાલુ સક્રિય વર્ષ બનાવો (પાછલા વર્ષો લૉક થઈ જશે)">
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleSetCurrent(y)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            ચાલુ વર્ષ બનાવો
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Chip
                          icon={isLocked ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
                          label={isLocked ? 'લૉક થયેલ (ફક્ત વાંચવા/પ્રિન્ટ)' : 'ખુલ્લું (સંપૂર્ણ એન્ટ્રી/સુધારો)'}
                          size="small"
                          color={isLocked ? 'error' : 'success'}
                          variant={isLocked ? 'filled' : 'outlined'}
                        />
                        {!isCurrent && (
                          <Tooltip title={isLocked ? "આ વર્ષને અનલૉક કરો" : "આ વર્ષના હિસાબ લૉક કરો"}>
                            <IconButton
                              size="small"
                              color={isLocked ? 'error' : 'default'}
                              onClick={() => handleToggleLock(y)}
                            >
                              {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title="સુધારો">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(y)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isCurrent ? "ચાલુ વર્ષ ડિલીટ શક્ય નથી" : "ડિલીટ કરો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isCurrent}
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'નાણાકીય વર્ષ સુધારો' : 'નવું નાણાકીય વર્ષ ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="વર્ષનું નામ (દા.ત. ૨૦૨૫-૨૦૨૬ અથવા 2025-2026)"
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

          <Box sx={{ p: 2, bgcolor: '#f4f6f8', borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
              વર્ષ નિયંત્રણ અને લૉક સેટિંગ્સ:
            </Typography>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isCurrent}
                    onChange={(e) => {
                      const isNowCurrent = e.target.checked;
                      setFormData({
                        ...formData,
                        isCurrent: isNowCurrent,
                        isLocked: isNowCurrent ? false : formData.isLocked
                      });
                    }}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      આ વર્ષને ચાલુ સક્રિય વર્ષ બનાવો (Active Current Year)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      આ વિકલ્પ ચાલુ રાખવાથી પાછલા તમામ વર્ષો આપોઆપ લૉક (ફક્ત વાંચવા/પ્રિન્ટ માટે) થઈ જશે.
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isLocked}
                    disabled={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                    color="error"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: formData.isCurrent ? 'text.disabled' : 'error.main' }}>
                      આ વર્ષના હિસાબો લૉક કરો (Lock Accounts - Read Only)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      લૉક કર્યા પછી કોઈ પણ વપરાશકર્તા આ વર્ષના બિલો કે હિસાબમાં સુધારો/ડિલીટ કરી શકશે નહીં.
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>
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
