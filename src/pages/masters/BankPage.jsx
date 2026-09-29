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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const BankPage = () => {
  const { addBank, updateBank, deleteBank, fetchBanks } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [banksList, setBanksList] = useState([]);
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
    acNo: '',
    branch: '',
    ifsc: '',
  });

  const loadBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBanks({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setBanksList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching banks:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchBanks, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવી બેંક ઉમેરો')) return;
    setEditingId(null);
    setFormData({
      code: `B-0${(totalCount || 0) + 1}`,
      name: '',
      acNo: '',
      branch: 'ઓલપાડ',
      ifsc: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (b) => {
    if (!checkCanModify('બેંક સુધારો')) return;
    setEditingId(b.id);
    setFormData({
      code: b.code,
      name: b.name,
      acNo: b.acNo || b.account_no,
      branch: b.branch,
      ifsc: b.ifsc,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('બેંક સાચવો')) return;
    if (!formData.name || !formData.acNo) {
      showToast('કૃપા કરીને બેંકનું નામ અને ખાતા નંબર દાખલ કરો.', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateBank(editingId, formData);
        if (res && res.success) {
          showToast('બેંક વિગત સફળતાપૂર્વક સુધારી લેવાઈ છે!', 'success');
        } else {
          showToast(res?.message || 'બેંક સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addBank(formData);
        if (res && res.success) {
          showToast('નવી બેંક સફળતાપૂર્વક ઉમેરાઈ!', 'success');
        } else {
          showToast(res?.message || 'બેંક ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadBanks();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('બેંક ડિલીટ')) return;
    try {
      const res = await deleteBank(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('બેંક ખાતું સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
      } else {
        showToast(res?.message || 'બેંક ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadBanks();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="બેંક માસ્ટર"
        subtitle="મંડળીના તમામ સહકારી અને રાષ્ટ્રીયકૃત બેંક ખાતાઓની વિગત"
        breadcrumb="માસ્ટર / બેંક માસ્ટર"
        icon={<AccountBalanceIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવી બેંક ઉમેરી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવી બેંક ઉમેરો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. બેંક માસ્ટરમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="બેંકનું નામ, ખાતા નંબર અથવા શાખા શોધો..."
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
                <TableCell>બેંક કોડ</TableCell>
                <TableCell>બેંકનું નામ</TableCell>
                <TableCell>ખાતા નંબર</TableCell>
                <TableCell>શાખા (Branch)</TableCell>
                <TableCell>IFSC કોડ</TableCell>
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
              ) : banksList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ બેંક મળી નથી.
                  </TableCell>
                </TableRow>
              ) : (
                banksList.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell sx={{ fontWeight: 700 }}>{b.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.name}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#00695C' }}>{b.acNo || b.account_no}</TableCell>
                    <TableCell>{b.branch}</TableCell>
                    <TableCell>{b.ifsc || '-'}</TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "લૉક વર્ષમાં સુધારો અમાન્ય છે" : "સુધારો કરો"}>
                        <span>
                          <IconButton size="small" color="primary" disabled={isYearLocked} onClick={() => handleOpenEdit(b)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isYearLocked ? "લૉક વર્ષમાં કાઢી નાખવું અમાન્ય છે" : "કાઢી નાખો"}>
                        <span>
                          <IconButton size="small" color="error" disabled={isYearLocked} onClick={() => setDeleteId(b.id)}>
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
          labelRowsPerPage="પ્રતિ પેજ બેંકો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* મોડલ ફોર્મ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'બેંક વિગત સુધારો' : 'નવી બેંક ઉમેરો'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="બેંક કોડ"
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <TextField
            label="બેંકનું નામ (ગુજરાતીમાં)"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <TextField
            label="ખાતા નંબર (A/C No)"
            fullWidth
            value={formData.acNo}
            onChange={(e) => setFormData({ ...formData, acNo: e.target.value })}
          />
          <TextField
            label="શાખા (Branch)"
            fullWidth
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          />
          <TextField
            label="IFSC કોડ"
            fullWidth
            value={formData.ifsc}
            onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
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
        title="બેંક ડિલીટ કરવાની ખાતરી"
        message="શું તમે ખરેખર આ બેંક ખાતાને માસ્ટરમાંથી દૂર કરવા માંગો છો?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default BankPage;
