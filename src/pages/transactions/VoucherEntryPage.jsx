import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Typography, Card,
  CardContent, InputAdornment, IconButton, Tooltip, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TablePagination, CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export default function VoucherEntryPage() {
  const { generalAccounts, vouchers, addVoucher, updateVoucher, deleteVoucher, fetchVouchers, fetchGeneralAccounts } = useData();
  const { activeYear, showToast, isYearLocked, checkCanModify } = useApp();

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchVouchers({
      year: activeYear,
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      type: typeFilter
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchVouchers, activeYear, page, rowsPerPage, searchTerm, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchGeneralAccounts();
  }, [fetchGeneralAccounts]);

  const [formData, setFormData] = useState({
    voucher_no: `V-${vouchers.length + 101}`,
    date: new Date().toISOString().split('T')[0],
    type: 'ચૂકવણી વાઉચર (Payment)',
    debit_account: 'વીજળી ખર્ચ ખાતું',
    credit_account: 'રોકડ સિલક ખાતું',
    amount: '',
    narration: '',
    paid_to: ''
  });

  const voucherTypes = [
    'ચૂકવણી વાઉચર (Payment)',
    'આવક વાઉચર (Receipt)',
    'કોન્ટ્રા વાઉચર (Contra - Bank/Cash)',
    'હવાલા વાઉચર (Journal - Adjustment)'
  ];

  const handleOpenAdd = () => {
    if (!checkCanModify('નવું વાઉચર બનાવવું')) return;
    setEditingId(null);
    setFormData({
      voucher_no: `V-${(vouchers.length || 0) + 101}`,
      date: new Date().toISOString().split('T')[0],
      type: 'ચૂકવણી વાઉચર (Payment)',
      debit_account: generalAccounts[1]?.name || 'કેનાલ રીપેરીંગ ખર્ચ',
      credit_account: generalAccounts[0]?.name || 'રોકડ સિલક ખાતું',
      amount: '',
      narration: '',
      paid_to: ''
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (v) => {
    if (!checkCanModify('વાઉચર સુધારો')) return;
    setEditingId(v.id);
    const vDate = v.date;
    setFormData({
      voucher_no: v.voucher_no || '',
      date: vDate ? (typeof vDate === 'string' && vDate.includes('T') ? vDate.split('T')[0] : vDate) : '',
      type: v.type || 'ચૂકવણી વાઉચર (Payment)',
      debit_account: v.debit_account || '',
      credit_account: v.credit_account || '',
      amount: v.amount || '',
      narration: v.narration || '',
      paid_to: v.paid_to || ''
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'વાઉચર સુધારો' : 'નવું વાઉચર બનાવવું')) return;
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast('કૃપા કરીને માન્ય રકમ દાખલ કરો', 'warning');
      return;
    }
    if (formData.debit_account === formData.credit_account) {
      showToast('ઉધાર અને જમા ખાતું અલગ અલગ હોવું જોઈએ', 'warning');
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      year_name: activeYear
    };

    try {
      if (editingId) {
        const res = await updateVoucher(editingId, payload);
        if (res && res.success) {
          showToast(`વાઉચર નં. ${formData.voucher_no} સફળતાપૂર્વક સુધારી લેવાયું!`, 'success');
          setOpenModal(false);
          loadData();
        } else {
          showToast(res?.message || 'વાઉચર સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addVoucher(payload);
        if (res && res.success) {
          showToast(`વાઉચર નં. ${formData.voucher_no} સફળતાપૂર્વક સાચવાયું!`, 'success');
          setOpenModal(false);
          loadData();
        } else {
          showToast(res?.message || 'વાઉચર સાચવવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('વાઉચર ડિલીટ')) return;
    try {
      const res = await deleteVoucher(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('વાઉચર સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
        loadData();
      } else {
        showToast(res?.message || 'વાઉચર ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="વાઉચર એન્ટ્રી (Voucher Entry)"
        subtitle={`નાણાકીય વર્ષ ${activeYear} અને અગાઉના તમામ વર્ષોના હિસાબી વાઉચરો (કુલ: ${totalCount})`}
        actions={
          <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી નવું વાઉચર બનાવી શકાતું નથી` : ''}>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                disabled={isYearLocked}
                onClick={handleOpenAdd}
              >
                {isYearLocked ? 'લૉક વર્ષ (ઉમેરો અમાન્ય)' : 'નવું વાઉચર બનાવો'}
              </Button>
            </span>
          </Tooltip>
        }
      />

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="વાઉચર નંબર, ખાતાનું નામ, પ્રકાર અથવા સ્વીકારનાર શોધો..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ flexGrow: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading ? <CircularProgress size={20} /> : null
            }}
          />

          <TextField
            select
            label="વાઉચર પ્રકાર"
            size="small"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="all">તમામ પ્રકાર</MenuItem>
            <MenuItem value="ચૂકવણી વાઉચર (Payment)">ચૂકવણી વાઉચર (Payment)</MenuItem>
            <MenuItem value="આવક વાઉચર (Receipt)">આવક વાઉચર (Receipt)</MenuItem>
            <MenuItem value="કોન્ટ્રા વાઉચર (Contra)">કોન્ટ્રા વાઉચર (Contra)</MenuItem>
            <MenuItem value="હવાલા વાઉચર (Journal - Adjustment)">હવાલા વાઉચર (Journal)</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={100}>વાઉચર નં</TableCell>
                <TableCell width={110}>નાણાકીય વર્ષ</TableCell>
                <TableCell width={110}>તારીખ</TableCell>
                <TableCell>વાઉચર પ્રકાર</TableCell>
                <TableCell>ઉધાર ખાતું (Dr.)</TableCell>
                <TableCell>જમા ખાતું (Cr.)</TableCell>
                <TableCell>નાણાં સ્વીકારનાર</TableCell>
                <TableCell align="right">રકમ (₹)</TableCell>
                <TableCell>લખાણ / વિગત</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(vouchers || []).map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {v.voucher_no}
                  </TableCell>
                  <TableCell>
                    <span className="no-print">
                      <Chip
                        size="small"
                        label={v.year_name || activeYear}
                        color={v.year_name === activeYear ? 'primary' : 'default'}
                        variant={v.year_name === activeYear ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </span>
                    <span className="print-only">
                      {v.year_name || activeYear}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(v.date)}</TableCell>
                  <TableCell>
                    <span className="no-print">
                      <Chip size="small" label={v.type} color="primary" variant="outlined" />
                    </span>
                    <span className="print-only">
                      {v.type}
                    </span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                    {v.debit_account}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                    {v.credit_account}
                  </TableCell>
                  <TableCell>{v.paid_to || '-'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ₹ {Number(v.amount).toLocaleString('gu-IN')}
                  </TableCell>
                  <TableCell>{v.narration || '-'}</TableCell>
                  <TableCell align="center" className="no-print">
                    <Tooltip title="વાઉચર પ્રિન્ટ કરો">
                      <IconButton color="default" size="small" onClick={() => window.print()}>
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isYearLocked ? 'લૉક વર્ષ હોવાથી સુધારી શકાય નહિ' : 'વાઉચર સુધારો'}>
                      <span>
                        <IconButton
                          color="primary"
                          size="small"
                          disabled={isYearLocked}
                          onClick={() => handleOpenEdit(v)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={isYearLocked ? 'લૉક વર્ષ હોવાથી રદ કરી શકાય નહિ' : 'વાઉચર રદ કરો'}>
                      <span>
                        <IconButton
                          color="error"
                          size="small"
                          disabled={isYearLocked}
                          onClick={() => setDeleteId(v.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {(!vouchers || vouchers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'લોડ થઈ રહ્યું છે...' : 'કોઈ વાઉચર મળ્યા નથી.'}
                  </TableCell>
                </TableRow>
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
          labelRowsPerPage="પ્રતિ પેજ વાઉચરો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : `વધુ`}`}
          className="no-print"
        />
      </Paper>

      <PrintSignatures />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="વાઉચર રદ કરવાની ખાતરી"
        message="શું તમે ખરેખર આ વાઉચર રદ (Delete) કરવા માંગો છો? આ પ્રક્રિયા પાછી વાળી શકાશે નહીં."
        confirmText="હા, રદ કરો"
        cancelText="ના, રદ ન કરો"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* New / Edit Voucher Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'વાઉચર સુધારો' : 'નવું હિસાબી વાઉચર બનાવો'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="વાઉચર નંબર"
                value={formData.voucher_no}
                disabled
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="તારીખ"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="વાઉચર પ્રકાર"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                size="small"
              >
                {voucherTypes.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="ઉધાર ખાતું (Debit Dr.)"
                value={formData.debit_account}
                onChange={(e) => setFormData({ ...formData, debit_account: e.target.value })}
                size="small"
              >
                {generalAccounts.map((a) => (
                  <MenuItem key={a.id} value={a.name}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="જમા ખાતું (Credit Cr.)"
                value={formData.credit_account}
                onChange={(e) => setFormData({ ...formData, credit_account: e.target.value })}
                size="small"
              >
                {generalAccounts.map((a) => (
                  <MenuItem key={a.id} value={a.name}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="રકમ (₹)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="નાણાં સ્વીકારનાર / પેમેન્ટ ટુ"
                value={formData.paid_to}
                onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                size="small"
                placeholder="દા.ત. મહેશ પટેલ / જીઈબી"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="વિગત / લખાણ (Narration)"
                value={formData.narration}
                onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                size="small"
                multiline
                rows={2}
                placeholder="વાઉચર અંગેનું કારણ કે ટૂંકી વિગત..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isYearLocked}
          >
            {editingId ? 'સુધારો સાચવો' : 'વાઉચર સાચવો (Save Voucher)'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
