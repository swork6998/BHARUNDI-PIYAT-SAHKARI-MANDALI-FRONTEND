import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Chip, IconButton, Tooltip, InputAdornment, Grid, Alert,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function SubAccountsPage() {
  const { subAccounts, addSubAccount, updateSubAccount, deleteSubAccount, generalAccounts, fetchSubAccounts, fetchGeneralAccounts } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async (p, l, s) => {
    setLoading(true);
    const res = await fetchSubAccounts({ page: p + 1, limit: l, search: s });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchSubAccounts]);

  useEffect(() => {
    fetchGeneralAccounts();
  }, [fetchGeneralAccounts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(page, rowsPerPage, searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [page, rowsPerPage, searchTerm, loadData]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    head_name: '',
    party_type: 'વેપારી/લેણદાર',
    phone: '',
    balance_type: 'ઉધાર',
    balance: 0
  });

  const handleOpenAdd = () => {
    if (!checkCanModify('નવું પેટા ખાતું ઉમેરો')) return;
    setEditingId(null);
    const nextCode = `FA${String((totalCount || 0) + 1).padStart(3, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      head_name: generalAccounts[0]?.name || 'સામાન્ય',
      party_type: 'વેપારી/લેણદાર',
      phone: '',
      balance_type: 'ઉધાર',
      balance: 0
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    if (!checkCanModify('પેટા ખાતું સુધારો')) return;
    setEditingId(item.id);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      head_name: item.head_name || generalAccounts[0]?.name || 'સામાન્ય',
      party_type: item.party_type || 'વેપારી/લેણદાર',
      phone: item.phone || '',
      balance_type: item.balance_type || 'ઉધાર',
      balance: item.balance || 0
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'પેટા ખાતું સુધારો' : 'પેટા ખાતું સાચવો')) return;
    if (!formData.name.trim()) {
      showToast('કૃપા કરીને પેટા ખાતાનું નામ દાખલ કરો', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateSubAccount(editingId, formData);
        if (res && res.success) {
          showToast('પેટા ખાતું સફળતાપૂર્વક સુધારી લેવાયું!', 'success');
        } else {
          showToast(res?.message || 'પેટા ખાતું સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addSubAccount(formData);
        if (res && res.success) {
          showToast('પેટા ખાતું સફળતાપૂર્વક સાચવાયું!', 'success');
        } else {
          showToast(res?.message || 'પેટા ખાતું ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadData(page, rowsPerPage, searchTerm);
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('પેટા ખાતું ડિલીટ')) return;
    try {
      const res = await deleteSubAccount(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('પેટા ખાતું સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
        loadData(page, rowsPerPage, searchTerm);
      } else {
        showToast(res?.message || 'પેટા ખાતું ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const filtered = (subAccounts || []).filter((a) =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.head_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="પેટા ખાતાવહી માસ્ટર (Famst)"
        subtitle="મંડળીના સહાયક પેટા ખાતાઓ (વેપારીઓ, પમ્પિંગ કોન્ટ્રાક્ટર, વીજ સપ્લાયર્સ અને અન્ય પેટા પાર્ટીઓ)"
        actionLabel={isYearLocked ? undefined : "નવું પેટા ખાતું ઉમેરો"}
        actionIcon={<AddIcon />}
        onAction={handleOpenAdd}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નવું પેટા ખાતું ઉમેરવું શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="પેટા ખાતાનું નામ, કોડ અથવા મુખ્ય ખાતું શોધો..."
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
            ),
            endAdornment: loading ? <CircularProgress size={20} /> : null
          }}
        />
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={100}>પેટા કોડ</TableCell>
                <TableCell>પેટા ખાતાનું નામ (પાર્ટી)</TableCell>
                <TableCell>જોડાયેલ મુખ્ય જનરલ ખાતું</TableCell>
                <TableCell>પાર્ટી પ્રકાર</TableCell>
                <TableCell>મોબાઈલ</TableCell>
                <TableCell align="right">બાકી રકમ (₹)</TableCell>
                <TableCell align="center">બાકી પ્રકાર</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : (subAccounts || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ પેટા ખાતું મળ્યું નથી.
                  </TableCell>
                </TableRow>
              ) : (
                (subAccounts || []).map((item, index) => (
                  <TableRow key={item.id || index} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {item.code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip size="small" label={item.head_name || 'જનરલ'} variant="outlined" />
                      </span>
                      <span className="print-only">
                        {item.head_name || 'જનરલ'}
                      </span>
                    </TableCell>
                    <TableCell>{item.party_type || 'વેપારી'}</TableCell>
                    <TableCell>{item.phone || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {Number(item.balance || 0).toLocaleString('gu-IN')}
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <Chip
                          size="small"
                          label={item.balance_type || 'ઉધાર'}
                          color={item.balance_type === 'જમા' ? 'success' : 'error'}
                        />
                      </span>
                      <span className="print-only">
                        {item.balance_type || 'ઉધાર'}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "વર્ષ લૉક હોવાથી સુધારો શક્ય નથી" : "સુધારો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isYearLocked}
                            onClick={() => handleOpenEdit(item)}
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
                            onClick={() => setDeleteId(item.id)}
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
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="પ્રતિ પૃષ્ઠ પંક્તિઓ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} કુલ ${count !== -1 ? count : `વધુ માંથી ${to}`}`}
          sx={{ borderTop: '1px solid #e2e8f0' }}
        />
      </Paper>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="પેટા ખાતું ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ પેટા ખાતું (પાર્ટી) ડિલીટ કરવા માંગો છો? જો આ ખાતામાં લેવડદેવડ હશે તો ડિલીટ થશે નહીં."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* Add / Edit Sub Account Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'પેટા ખાતું સુધારો' : 'નવું પેટા ખાતું ઉમેરો'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="પેટા કોડ"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="પેટા ખાતાનું નામ (વેપારી / પાર્ટીનું નામ)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="મુખ્ય જનરલ ખાતું પસંદ કરો"
                value={formData.head_name}
                onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
              >
                {(generalAccounts || []).map((h) => (
                  <MenuItem key={h.id} value={h.name}>
                    {h.code} - {h.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="પાર્ટીનો પ્રકાર"
                value={formData.party_type}
                onChange={(e) => setFormData({ ...formData, party_type: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="મોબાઈલ નંબર"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="શરૂઆત બાકી રકમ (₹)"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            સાચવો
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
