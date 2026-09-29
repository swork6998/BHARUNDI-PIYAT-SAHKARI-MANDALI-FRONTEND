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
  MenuItem,
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
import AltRouteIcon from '@mui/icons-material/AltRoute';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const SubCanalPage = () => {
  const { canals, subCanals, addSubCanal, updateSubCanal, deleteSubCanal, fetchCanals, fetchSubCanals } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchSubCanals({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchSubCanals, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchCanals();
  }, [fetchCanals]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    canalId: '',
    code: '',
    name: '',
    outlets: '',
  });

  const handleOpenAdd = () => {
    if (!checkCanModify('નવી શાખા નહેર ઉમેરો')) return;
    setEditingId(null);
    setFormData({
      canalId: canals[0]?.id || 1,
      code: `SN-0${(totalCount || (subCanals || []).length) + 1}`,
      name: '',
      outlets: '૧ થી ૨૦',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (sc) => {
    if (!checkCanModify('શાખા નહેર સુધારો')) return;
    setEditingId(sc.id);
    setFormData({
      canalId: sc.canalId || sc.canal_id || 1,
      code: sc.code,
      name: sc.name,
      outlets: sc.outlets,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('શાખા નહેર સાચવો')) return;
    if (!formData.name) {
      showToast('કૃપા કરીને શાખા નહેરનું નામ દાખલ કરો.', 'warning');
      return;
    }

    const payload = {
      canal_id: Number(formData.canalId),
      code: formData.code,
      name: formData.name,
      outlets: formData.outlets,
    };

    if (editingId) {
      await updateSubCanal(editingId, payload);
      showToast('શાખા નહેર સફળતાપૂર્વક સુધારી લેવાઈ છે!');
    } else {
      await addSubCanal(payload);
      showToast('નવી શાખા નહેર સફળતાપૂર્વક ઉમેરાઈ!');
    }
    setOpenModal(false);
    loadData();
  };

  const confirmDelete = async () => {
    if (!checkCanModify('શાખા નહેર ડિલીટ')) return;
    await deleteSubCanal(deleteId);
    setDeleteId(null);
    showToast('શાખા નહેર સફળતાપૂર્વક ડિલીટ કરાઈ.');
    loadData();
  };

  return (
    <Box>
      <PageHeader
        title="શાખા નહેર (સબ-કેનાલ) માસ્ટર"
        subtitle="મુખ્ય નહેર સાથે જોડાયેલી શાખા નહેરો, માઇનોર અને કુંડી નંબરોની વિગત"
        breadcrumb="માસ્ટર / શાખા નહેર"
        icon={<AltRouteIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવી શાખા નહેર ઉમેરી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવી શાખા નહેર ઉમેરો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. શાખા નહેર માસ્ટરમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="શાખા નહેરનું નામ, કોડ અથવા મુખ્ય નહેર શોધો..."
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
                <TableCell>શાખા કોડ</TableCell>
                <TableCell>મુખ્ય નહેર</TableCell>
                <TableCell>શાખા નહેરનું નામ</TableCell>
                <TableCell>કુંડી નંબરો (Outlets)</TableCell>
                <TableCell align="center" className="no-print">ક્રિયા</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(subCanals || []).map((sc) => (
                <TableRow key={sc.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{sc.code}</TableCell>
                  <TableCell sx={{ color: '#00695C', fontWeight: 600 }}>{sc.canalName || sc.canal_name || 'મુખ્ય નહેર'}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{sc.name}</TableCell>
                  <TableCell>{sc.outlets || '-'}</TableCell>
                  <TableCell align="center" className="no-print">
                    <Tooltip title={isYearLocked ? "લૉક વર્ષમાં સુધારો અમાન્ય છે" : "સુધારો કરો"}>
                      <span>
                        <IconButton size="small" color="primary" disabled={isYearLocked} onClick={() => handleOpenEdit(sc)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={isYearLocked ? "લૉક વર્ષમાં કાઢી નાખવું અમાન્ય છે" : "કાઢી નાખો"}>
                      <span>
                        <IconButton size="small" color="error" disabled={isYearLocked} onClick={() => setDeleteId(sc.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {(!subCanals || subCanals.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ શાખા નહેર મળી નથી.
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
          labelRowsPerPage="પ્રતિ પેજ શાખાઓ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* મોડલ ફોર્મ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'શાખા નહેર વિગત સુધારો' : 'નવી શાખા નહેર ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="મુખ્ય નહેર પસંદ કરો"
            fullWidth
            value={formData.canalId}
            onChange={(e) => setFormData({ ...formData, canalId: e.target.value })}
          >
            {(canals || []).map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="શાખા કોડ"
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <TextField
            label="શાખા નહેરનું નામ (ગુજરાતીમાં)"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <TextField
            label="કુંડી નંબરો (Outlets)"
            fullWidth
            value={formData.outlets}
            onChange={(e) => setFormData({ ...formData, outlets: e.target.value })}
            placeholder="દા.ત. ૧ થી ૨૫"
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
        title="શાખા નહેર ડિલીટ કરવાની ખાતરી"
        message="શું તમે ખરેખર આ શાખા નહેરને માસ્ટરમાંથી દૂર કરવા માંગો છો?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default SubCanalPage;
