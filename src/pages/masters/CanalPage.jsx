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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WaterIcon from '@mui/icons-material/Water';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const CanalPage = () => {
  const { addCanal, updateCanal, deleteCanal, fetchCanals } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [canalsList, setCanalsList] = useState([]);
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
    length: '',
    capacity: '',
    source: '',
  });

  const loadCanals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCanals({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.canals) {
        setCanalsList(res.canals);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching canals:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchCanals, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadCanals();
  }, [loadCanals]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવી નહેર ઉમેરો')) return;
    setEditingId(null);
    setFormData({
      code: `N-0${(totalCount || 0) + 1}`,
      name: '',
      length: '૧૦.૦ કિમી',
      capacity: '૧૦૦ ક્યુસેક',
      source: 'મુખ્ય નહેર',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (c) => {
    if (!checkCanModify('નહેર સુધારો')) return;
    setEditingId(c.id);
    setFormData({
      code: c.code,
      name: c.name,
      length: c.length_km || c.length,
      capacity: c.capacity,
      source: c.source,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('નહેર સાચવો')) return;
    if (!formData.name) {
      showToast('કૃપા કરીને નહેરનું નામ દાખલ કરો.', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateCanal(editingId, formData);
        if (res && res.success) {
          showToast('નહેર વિગત સફળતાપૂર્વક સુધારી લેવાઈ છે!', 'success');
        } else {
          showToast(res?.message || 'નહેર સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addCanal(formData);
        if (res && res.success) {
          showToast('નવી નહેર સફળતાપૂર્વક ઉમેરાઈ!', 'success');
        } else {
          showToast(res?.message || 'નહેર ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadCanals();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('નહેર ડિલીટ')) return;
    try {
      const res = await deleteCanal(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('નહેર સફળતાપૂર્વક ડિલીટ કરાઈ.', 'success');
      } else {
        showToast(res?.message || 'નહેર ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadCanals();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="નહેર (કેનાલ) માસ્ટર"
        subtitle="મુખ્ય સિંચાઈ નહેરો, લંબાઈ અને પાણી વહન ક્ષમતાની વિગત"
        breadcrumb="માસ્ટર / નહેર માસ્ટર"
        icon={<WaterIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવી નહેર ઉમેરી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવી નહેર ઉમેરો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નહેર માસ્ટરમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="નહેરનું નામ, કોડ અથવા સ્ત્રોત શોધો..."
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
                <TableCell>નહેર કોડ</TableCell>
                <TableCell>નહેરનું નામ</TableCell>
                <TableCell>કુલ લંબાઈ</TableCell>
                <TableCell>વહન ક્ષમતા</TableCell>
                <TableCell>પાણી સ્ત્રોત</TableCell>
                <TableCell align="center" className="no-print">ક્રિયા</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : canalsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ નહેર મળી નથી.
                  </TableCell>
                </TableRow>
              ) : (
                canalsList.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ fontWeight: 700 }}>{c.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</TableCell>
                    <TableCell>{c.length_km || c.length}</TableCell>
                    <TableCell>{c.capacity}</TableCell>
                    <TableCell>{c.source}</TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "લૉક વર્ષમાં સુધારો અમાન્ય છે" : "સુધારો કરો"}>
                        <span>
                          <IconButton size="small" color="primary" disabled={isYearLocked} onClick={() => handleOpenEdit(c)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isYearLocked ? "લૉક વર્ષમાં કાઢી નાખવું અમાન્ય છે" : "કાઢી નાખો"}>
                        <span>
                          <IconButton size="small" color="error" disabled={isYearLocked} onClick={() => setDeleteId(c.id)}>
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
          labelRowsPerPage="પ્રતિ પેજ નહેરો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* મોડલ ફોર્મ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'નહેર વિગત સુધારો' : 'નવી નહેર ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="નહેર કોડ"
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <TextField
            label="નહેરનું નામ (ગુજરાતીમાં)"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <TextField
            label="કુલ લંબાઈ"
            fullWidth
            value={formData.length}
            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
          />
          <TextField
            label="પાણી વહન ક્ષમતા"
            fullWidth
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          />
          <TextField
            label="પાણી સ્ત્રોત"
            fullWidth
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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

      {/* ડિલીટ ખાતરી મોડલ */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="નહેર ડિલીટ કરવાની ખાતરી"
        message="શું તમે ખરેખર આ નહેરને માસ્ટરમાંથી દૂર કરવા માંગો છો?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default CanalPage;
