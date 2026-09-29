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
  AccountBalance as AccountBalanceIcon,
  ReceiptLong as ReceiptLongIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function GeneralAccountsPage() {
  const { accountGroups, addGeneralAccount, updateGeneralAccount, deleteGeneralAccount, fetchGeneralAccounts, fetchAccountGroups } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [accounts, setAccounts] = useState([]);
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
    group_id: '',
    opening_debit: 0,
    opening_credit: 0
  });

  useEffect(() => {
    fetchAccountGroups();
  }, [fetchAccountGroups]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGeneralAccounts({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setAccounts(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching general accounts:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchGeneralAccounts, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવું ખાતું ઉમેરો')) return;
    setEditingId(null);
    const nextCode = `HD${String((totalCount || 0) + 1).padStart(3, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      group_id: accountGroups[0]?.id || 1,
      opening_debit: 0,
      opening_credit: 0
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    if (!checkCanModify('ખાતું સુધારો')) return;
    setEditingId(item.id);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      group_id: item.group_id || accountGroups[0]?.id || 1,
      opening_debit: item.opening_debit || 0,
      opening_credit: item.opening_credit || 0
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'ખાતું સુધારો' : 'જનરલ ખાતું સાચવો')) return;
    if (!formData.name.trim()) {
      showToast('કૃપા કરીને ખાતાનું નામ દાખલ કરો', 'warning');
      return;
    }
    const group = accountGroups.find((g) => g.id === Number(formData.group_id));
    const payload = {
      ...formData,
      group_name: group?.name || 'સામાન્ય',
      group_type: group?.type || 'દેવા (Liabilities)'
    };

    try {
      if (editingId) {
        const res = await updateGeneralAccount(editingId, payload);
        if (res && res.success) {
          showToast('જનરલ ખાતું સફળતાપૂર્વક સુધારી લેવાયું!', 'success');
        } else {
          showToast(res?.message || 'ખાતું સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addGeneralAccount(payload);
        if (res && res.success) {
          showToast('જનરલ ખાતું સફળતાપૂર્વક સાચવાયું!', 'success');
        } else {
          showToast(res?.message || 'ખાતું ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadAccounts();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('ખાતું ડિલીટ')) return;
    try {
      const res = await deleteGeneralAccount(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('જનરલ ખાતું સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
      } else {
        showToast(res?.message || 'ખાતું ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadAccounts();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="જનરલ ખાતાવહી માસ્ટર (Hdmst)"
        subtitle="મંડળીના મુખ્ય સામાન્ય ખાતાઓ (રોકડ, બેંક, આવક, ખર્ચ, મૂડી અને જવાબદારીઓ)"
        actionLabel={isYearLocked ? undefined : "નવું ખાતું ઉમેરો"}
        actionIcon={<AddIcon />}
        onAction={handleOpenAdd}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નવું ખાતું ઉમેરવું શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="ખાતાનું નામ, કોડ અથવા ગ્રુપ શોધો..."
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

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={100}>ખાતા કોડ</TableCell>
                <TableCell>જનરલ ખાતાનું નામ</TableCell>
                <TableCell>ખાતા ગ્રુપ</TableCell>
                <TableCell align="right">શરૂઆત ઉધાર (₹)</TableCell>
                <TableCell align="right">શરૂઆત જમા (₹)</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ જનરલ ખાતું મળ્યું નથી.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((item, index) => (
                  <TableRow key={item.id || index} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {item.code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip size="small" label={item.group_name || 'સામાન્ય'} variant="outlined" />
                      </span>
                      <span className="print-only">
                        {item.group_name || 'સામાન્ય'}
                      </span>
                    </TableCell>
                    <TableCell align="right" sx={{ color: Number(item.opening_debit) > 0 ? 'error.main' : 'inherit' }}>
                      {Number(item.opening_debit || 0).toLocaleString('gu-IN')}
                    </TableCell>
                    <TableCell align="right" sx={{ color: Number(item.opening_credit) > 0 ? 'success.main' : 'inherit' }}>
                      {Number(item.opening_credit || 0).toLocaleString('gu-IN')}
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <Chip size="small" label="ચાલુ" color="success" />
                      </span>
                      <span className="print-only">
                        ચાલુ
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
          labelRowsPerPage="પ્રતિ પેજ ખાતાઓ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="જનરલ ખાતું ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ જનરલ ખાતું ડિલીટ કરવા માંગો છો? જો આ ખાતા હેઠળ પેટા ખાતાઓ (Famst) કે હિસાબી વાઉચરો હશે તો ડિલીટ થશે નહીં."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* Add / Edit General Account Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'જનરલ ખાતું સુધારો' : 'નવું જનરલ ખાતું ઉમેરો'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ખાતા કોડ"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="જનરલ ખાતાનું નામ (ગુજરાતીમાં)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="ખાતા ગ્રુપ પસંદ કરો"
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              >
                {accountGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name} ({g.type})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="શરૂઆત ઉધાર રકમ (₹)"
                value={formData.opening_debit}
                onChange={(e) => setFormData({ ...formData, opening_debit: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="શરૂઆત જમા રકમ (₹)"
                value={formData.opening_credit}
                onChange={(e) => setFormData({ ...formData, opening_credit: Number(e.target.value) })}
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
