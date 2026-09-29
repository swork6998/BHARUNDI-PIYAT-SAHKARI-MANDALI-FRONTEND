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
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const VillagePage = () => {
  const { addVillage, updateVillage, deleteVillage, fetchVillages } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [villagesList, setVillagesList] = useState([]);
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
    taluka: 'ઓલપાડ',
    district: 'સુરત',
  });

  const loadVillages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchVillages({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setVillagesList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching villages:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchVillages, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadVillages();
  }, [loadVillages]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવું ગામ ઉમેરો')) return;
    setEditingId(null);
    setFormData({
      code: ((totalCount || 0) + 101).toString(),
      name: '',
      taluka: 'ઓલપાડ',
      district: 'સુરત',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (v) => {
    if (!checkCanModify('ગામ સુધારો')) return;
    setEditingId(v.id);
    setFormData({
      code: v.code,
      name: v.name,
      taluka: v.taluka,
      district: v.district,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('ગામ સાચવો')) return;
    if (!formData.name) {
      showToast('કૃપા કરીને ગામનું નામ દાખલ કરો.', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateVillage(editingId, formData);
        if (res && res.success) {
          showToast('ગામ વિગત સફળતાપૂર્વક સુધારી લેવાઈ છે!', 'success');
        } else {
          showToast(res?.message || 'ગામ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addVillage(formData);
        if (res && res.success) {
          showToast('નવું ગામ સફળતાપૂર્વક ઉમેરાયું!', 'success');
        } else {
          showToast(res?.message || 'ગામ ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadVillages();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('ગામ ડિલીટ')) return;
    try {
      const res = await deleteVillage(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('ગામ સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
      } else {
        showToast(res?.message || 'ગામ ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadVillages();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="ગામ માસ્ટર"
        subtitle="મંડળીના કાર્યક્ષેત્રમાં આવતા તમામ ગામોની વિગત"
        breadcrumb="માસ્ટર / ગામ માસ્ટર"
        icon={<LocationCityIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવું ગામ ઉમેરી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવું ગામ ઉમેરો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. ગામ માસ્ટરમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="ગામનું નામ, કોડ, તાલુકો અથવા જિલ્લો શોધો..."
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
                <TableCell>ગામ કોડ</TableCell>
                <TableCell>ગામનું નામ</TableCell>
                <TableCell>તાલુકો</TableCell>
                <TableCell>જિલ્લો</TableCell>
                <TableCell align="center" className="no-print">ક્રિયા</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : villagesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ ગામ મળ્યું નથી.
                  </TableCell>
                </TableRow>
              ) : (
                villagesList.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell sx={{ fontWeight: 700 }}>{v.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{v.name}</TableCell>
                    <TableCell>{v.taluka}</TableCell>
                    <TableCell>{v.district}</TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "લૉક વર્ષમાં સુધારો અમાન્ય છે" : "સુધારો કરો"}>
                        <span>
                          <IconButton size="small" color="primary" disabled={isYearLocked} onClick={() => handleOpenEdit(v)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isYearLocked ? "લૉક વર્ષમાં કાઢી નાખવું અમાન્ય છે" : "કાઢી નાખો"}>
                        <span>
                          <IconButton size="small" color="error" disabled={isYearLocked} onClick={() => setDeleteId(v.id)}>
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
          labelRowsPerPage="પ્રતિ પેજ ગામો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* મોડલ ફોર્મ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'ગામ વિગત સુધારો' : 'નવું ગામ ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ગામ કોડ"
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <TextField
            label="ગામનું નામ (ગુજરાતીમાં)"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <TextField
            label="તાલુકો"
            fullWidth
            value={formData.taluka}
            onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
          />
          <TextField
            label="જિલ્લો"
            fullWidth
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
        title="ગામ ડિલીટ કરવાની ખાતરી"
        message="શું તમે ખરેખર આ ગામને માસ્ટરમાંથી દૂર કરવા માંગો છો?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default VillagePage;
