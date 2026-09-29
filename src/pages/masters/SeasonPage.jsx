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
  CircularProgress,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const SeasonPage = () => {
  const { addSeason, updateSeason, deleteSeason, fetchSeasons } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [seasonsList, setSeasonsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    fromMonth: '',
    toMonth: '',
  });

  const loadSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSeasons({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setSeasonsList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching seasons:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchSeasons, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadSeasons();
  }, [loadSeasons]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવી ઋતુ ઉમેરો')) return;
    setEditingId(null);
    setFormData({
      code: `S-0${(totalCount || 0) + 1}`,
      name: '',
      fromMonth: '',
      toMonth: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (season) => {
    if (!checkCanModify('ઋતુ સુધારો')) return;
    setEditingId(season.id);
    setFormData({
      code: season.code || '',
      name: season.name || '',
      fromMonth: season.fromMonth || season.start_month || '',
      toMonth: season.toMonth || season.end_month || '',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('ઋતુ સાચવો')) return;
    if (!formData.name) {
      showToast('કૃપા કરીને ઋતુનું નામ દાખલ કરો.', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateSeason(editingId, formData);
        if (res && res.success) {
          showToast('ઋતુ વિગત સફળતાપૂર્વક સુધારી લેવાઈ!');
        } else {
          showToast(res?.message || 'ઋતુ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addSeason(formData);
        if (res && res.success) {
          showToast('નવી ઋતુ સફળતાપૂર્વક ઉમેરાઈ!');
        } else {
          showToast(res?.message || 'ઋતુ ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadSeasons();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('ઋતુ ડિલીટ')) return;
    try {
      const res = await deleteSeason(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('ઋતુ સફળતાપૂર્વક ડિલીટ કરાઈ.', 'success');
      } else {
        showToast(res?.message || 'ઋતુ ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadSeasons();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="ઋતુ (સીઝન) માસ્ટર"
        subtitle="ખરીફ, રવિ અને જાયદ સિંચાઈ ઋતુઓની સમયગાળા સાથેની વિગત"
        breadcrumb="માસ્ટર / ઋતુ માસ્ટર"
        icon={<WbSunnyIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવી ઋતુ ઉમેરી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવી ઋતુ ઉમેરો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. ઋતુ માસ્ટરમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="ઋતુનું નામ અથવા કોડ શોધો..."
          value={searchTerm}
          onChange={handleSearchChange}
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
                <TableCell>ઋતુ કોડ</TableCell>
                <TableCell>ઋતુનું નામ</TableCell>
                <TableCell>શરૂઆત મહિનો</TableCell>
                <TableCell>આખર મહિનો</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : seasonsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ ઋતુ મળી નથી.
                  </TableCell>
                </TableRow>
              ) : (
                seasonsList.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{s.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</TableCell>
                    <TableCell>{s.fromMonth || s.start_month || 'જુલાઈ'}</TableCell>
                    <TableCell>{s.toMonth || s.end_month || 'ઓક્ટોબર'}</TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "વર્ષ લૉક હોવાથી ફેરફાર શક્ય નથી" : "સુધારો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isYearLocked}
                            onClick={() => handleOpenEdit(s)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isYearLocked ? "વર્ષ લૉક હોવાથી ડિલીટ શક્ય નથી" : "ડિલીટ કરો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isYearLocked}
                            onClick={() => setDeleteId(s.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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
          labelRowsPerPage="પ્રતિ પેજ ઋતુઓ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="ઋતુ ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ ઋતુ ડિલીટ કરવા માંગો છો? જો આ ઋતુમાં ભાવપત્રક કે અન્ય માહિતી હશે તો ડિલીટ થશે નહીં."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* મોડલ ફોર્મ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'ઋતુ વિગત સુધારો' : 'નવી ઋતુ ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ઋતુ કોડ"
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <TextField
            label="ઋતુનું નામ (ગુજરાતીમાં)"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <TextField
            label="શરૂઆત મહિનો"
            fullWidth
            value={formData.fromMonth}
            onChange={(e) => setFormData({ ...formData, fromMonth: e.target.value })}
          />
          <TextField
            label="આખર મહિનો"
            fullWidth
            value={formData.toMonth}
            onChange={(e) => setFormData({ ...formData, toMonth: e.target.value })}
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

export default SeasonPage;
