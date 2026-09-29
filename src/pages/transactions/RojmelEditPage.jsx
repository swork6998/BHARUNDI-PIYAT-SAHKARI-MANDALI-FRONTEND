import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, Tooltip, Typography, Alert,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Lock as LockIcon,
  Today as TodayIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function RojmelEditPage() {
  const { vouchers, receipts, fetchVouchers, fetchReceipts, updateReceipt, deleteReceipt, updateVoucher, deleteVoucher } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  useEffect(() => {
    fetchReceipts(activeYear);
    fetchVouchers(activeYear);
  }, [fetchReceipts, fetchVouchers, activeYear]);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Combined list of editable entries
  const allEntries = useMemo(() => [
    ...(receipts || []).map((r) => ({
      id: `rcpt-${r.id}`,
      originalId: r.id,
      entryType: 'receipt',
      raw: r,
      kind: 'રસીદ (જમા)',
      doc_no: r.receipt_no,
      date: r.date ? (typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0]) : '',
      account_name: `${r.member_name || ''} (${r.member_no || ''})`,
      amount: Number(r.amount),
      narration: r.narration
    })),
    ...(vouchers || []).map((v) => ({
      id: `vchr-${v.id}`,
      originalId: v.id,
      entryType: 'voucher',
      raw: v,
      kind: `વાઉચર (${v.type || 'ખર્ચ'})`,
      doc_no: v.voucher_no,
      date: v.date ? (typeof v.date === 'string' ? v.date.split('T')[0] : new Date(v.date).toISOString().split('T')[0]) : '',
      account_name: `${v.debit_account || ''} / ${v.credit_account || ''}`,
      amount: Number(v.amount),
      narration: v.narration || v.paid_to
    }))
  ], [receipts, vouchers]);

  const filtered = useMemo(() => {
    return allEntries.filter((e) => {
      const matchesSearch =
        !searchTerm.trim() ||
        e.doc_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.account_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFromDate = !fromDate || e.date >= fromDate;
      const matchesToDate = !toDate || e.date <= toDate;
      return matchesSearch && matchesFromDate && matchesToDate;
    });
  }, [allEntries, searchTerm, fromDate, toDate]);

  const pagedEntries = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleEditClick = (item) => {
    if (!checkCanModify('સુધારો')) return;
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!checkCanModify('સુધારો સાચવો')) return;
    if (!editingItem) return;
    try {
      if (editingItem.entryType === 'receipt') {
        const payload = {
          ...editingItem.raw,
          date: editingItem.date,
          amount: Number(editingItem.amount),
          narration: editingItem.narration
        };
        const res = await updateReceipt(editingItem.originalId, payload);
        if (res && res.success) {
          showToast(`રસીદ ${editingItem.doc_no} ની વિગતો સફળતાપૂર્વક સુધારાઈ!`, 'success');
          setEditingItem(null);
          fetchReceipts(activeYear);
        } else {
          showToast(res?.message || 'રસીદ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const payload = {
          ...editingItem.raw,
          date: editingItem.date,
          amount: Number(editingItem.amount),
          narration: editingItem.narration
        };
        const res = await updateVoucher(editingItem.originalId, payload);
        if (res && res.success) {
          showToast(`વાઉચર ${editingItem.doc_no} ની વિગતો સફળતાપૂર્વક સુધારાઈ!`, 'success');
          setEditingItem(null);
          fetchVouchers(activeYear);
        } else {
          showToast(res?.message || 'વાઉચર સુધારવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!checkCanModify('રદ કરો')) return;
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.entryType === 'receipt') {
        const res = await deleteReceipt(deleteConfirm.originalId);
        if (res && res.success) {
          showToast(`રસીદ ${deleteConfirm.doc_no} સફળતાપૂર્વક રદ કરવામાં આવી!`, 'info');
          setDeleteConfirm(null);
          fetchReceipts(activeYear);
        } else {
          showToast(res?.message || 'રસીદ રદ કરવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await deleteVoucher(deleteConfirm.originalId);
        if (res && res.success) {
          showToast(`વાઉચર ${deleteConfirm.doc_no} સફળતાપૂર્વક રદ કરવામાં આવ્યું!`, 'info');
          setDeleteConfirm(null);
          fetchVouchers(activeYear);
        } else {
          showToast(res?.message || 'વાઉચર રદ કરવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="રોજમેળ સુધારો અને રદ્દીકરણ"
        subtitle="દૈનિક રોજમેળમાં નોંધાયેલ રસીદો અને વાઉચરોમાં ભૂલ સુધારણા અથવા રદ કરવાની પ્રક્રિયા"
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. રોજમેળમાં કોઈ પણ ફેરફાર કે રદ્દીકરણ શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="તારીખથી (From Date)"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="તારીખ સુધી (To Date)"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="દસ્તાવેજ નંબર અથવા ખાતાનું નામ શોધો..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<TodayIcon />}
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFromDate(today);
                setToDate(today);
                setPage(0);
              }}
            >
              આજ
            </Button>
            {(fromDate || toDate || searchTerm) && (
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setSearchTerm('');
                  setPage(0);
                }}
              >
                રીસેટ
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={110}>નંબર</TableCell>
                <TableCell width={120}>પ્રકાર</TableCell>
                <TableCell width={110}>તારીખ</TableCell>
                <TableCell>ખાતાનું નામ / પક્ષકાર</TableCell>
                <TableCell>વિગત</TableCell>
                <TableCell align="right">રકમ (₹)</TableCell>
                <TableCell align="center" width={120} className="no-print">ક્રિયા</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedEntries.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {item.doc_no}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.kind}
                      color={item.kind.includes('જમા') ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.account_name}</TableCell>
                  <TableCell>{item.narration}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ₹ {item.amount.toLocaleString('gu-IN')}
                  </TableCell>
                  <TableCell align="center" className="no-print">
                    <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી સુધારો અમાન્ય છે" : "સુધારો કરો"}>
                      <span>
                        <IconButton
                          color="primary"
                          disabled={isYearLocked}
                          onClick={() => handleEditClick(item)}
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી રદ કરવું અમાન્ય છે" : "રદ કરો"}>
                      <span>
                        <IconButton
                          color="error"
                          disabled={isYearLocked}
                          onClick={() => setDeleteConfirm(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ એન્ટ્રી મળી નથી.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="પ્રતિ પેજ નોંધો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open onClose={() => setEditingItem(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            સુધારો: {editingItem.doc_no} ({editingItem.kind})
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="તારીખ"
                  type="date"
                  value={editingItem.date}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="રકમ (₹)"
                  value={editingItem.amount}
                  onChange={(e) => setEditingItem({ ...editingItem, amount: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  disabled
                  label="ખાતું / સભાસદ"
                  value={editingItem.account_name}
                  helperText="ખાતામાં સંપૂર્ણ ફેરફાર માટે સંબંધિત રસીદ અથવા વાઉચર પેજનો ઉપયોગ કરવો"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="સ્પષ્ટીકરણ / નોંધ"
                  value={editingItem.narration}
                  onChange={(e) => setEditingItem({ ...editingItem, narration: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditingItem(null)} color="inherit">
              રદ કરો
            </Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary" startIcon={<SaveIcon />}>
              સુધારો સાચવો
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          open={Boolean(deleteConfirm)}
          title="દસ્તાવેજ રદ કરવાની ખાતરી"
          message={`શું તમે ખરેખર ${deleteConfirm.kind} નં. ${deleteConfirm.doc_no} રકમ ₹ ${deleteConfirm.amount} રદ કરવા માંગો છો? આ ક્રિયા પાછી વાળી શકાશે નહીં.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          confirmColor="error"
        />
      )}
    </Box>
  );
}
