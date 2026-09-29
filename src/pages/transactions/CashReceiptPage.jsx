import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Typography, Card,
  CardContent, InputAdornment, IconButton, Tooltip, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TablePagination, CircularProgress, Alert
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ReceiptPrintModal from '../../components/print/ReceiptPrintModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export default function CashReceiptPage() {
  const { members, receiptBooks, receipts, addReceipt, updateReceipt, deleteReceipt, fetchReceipts, fetchMembers, fetchReceiptBooks } = useData();
  const { activeYear, showToast, isYearLocked, isRecordLocked, checkCanModify } = useApp();

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [printReceiptData, setPrintReceiptData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchReceipts({
      year: activeYear,
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchReceipts, activeYear, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchMembers();
    fetchReceiptBooks();
  }, [fetchMembers, fetchReceiptBooks]);

  const activeBook = receiptBooks.find((b) => b.status === 'ચાલુ') || receiptBooks[0] || { id: 1, name: 'પિયાત રસીદ બુક નં - ૧', current_no: 101 };

  const [formData, setFormData] = useState({
    receipt_no: `R-${activeBook.current_no || 101}`,
    date: new Date().toISOString().split('T')[0],
    book_id: activeBook.id || 1,
    member_id: '',
    amount: '',
    pay_mode: 'રોકડ',
    narration: 'પિયાત પાણી બિલ પેટે જમા',
    receiver: 'દિનેશભાઈ ચૌધરી (મંત્રી)'
  });

  const [selectedMember, setSelectedMember] = useState(null);

  const handleMemberChange = (memberId) => {
    const mem = members.find((m) => m.id === Number(memberId));
    setSelectedMember(mem || null);
    setFormData((prev) => ({
      ...prev,
      member_id: memberId,
      narration: mem ? `સભાસદ ${mem.member_name_guj || mem.name} (કોડ: ${mem.member_code || mem.memberNo}) તરફથી પિયાત પેટે રોકડ મળેલ` : prev.narration
    }));
  };

  const handleOpenAdd = () => {
    if (isRecordLocked && isRecordLocked(activeYear)) {
      showToast(`નાણાકીય વર્ષ (${activeYear}) લૉક હોવાથી નવી રસીદ ઉમેરી શકાય નહિ.`, 'warning');
      return;
    }
    if (!checkCanModify('નવી રસીદ ઉમેરો', activeYear)) return;
    setEditingId(null);
    const nextNo = `R-${(activeBook.current_no || 100) + 1}`;
    setFormData({
      receipt_no: nextNo,
      date: new Date().toISOString().split('T')[0],
      book_id: activeBook.id || 1,
      member_id: members[0]?.id || '',
      amount: '',
      pay_mode: 'રોકડ',
      narration: 'પિયાત પાણી બિલ પેટે જમા',
      receiver: 'દિનેશભાઈ ચૌધરી (મંત્રી)'
    });
    setSelectedMember(members[0] || null);
    setOpenModal(true);
  };

  const handleOpenEdit = (r) => {
    const rowYear = r.year_name || r.year || activeYear;
    if (isRecordLocked && isRecordLocked(rowYear)) {
      showToast(`નાણાકીય વર્ષ (${rowYear}) લૉક હોવાથી રસીદમાં ફેરફાર શક્ય નથી.`, 'warning');
      return;
    }
    if (!checkCanModify('રસીદ સુધારો', rowYear)) return;
    setEditingId(r.id);
    const mem = members.find((m) => m.id === Number(r.member_id)) || {
      id: r.member_id,
      name: r.member_name,
      member_name_guj: r.member_name,
      member_code: r.member_no
    };
    setSelectedMember(mem);
    const rDate = r.date;
    setFormData({
      receipt_no: r.receipt_no || '',
      date: rDate ? (typeof rDate === 'string' && rDate.includes('T') ? rDate.split('T')[0] : rDate) : '',
      book_id: r.book_id || activeBook.id || 1,
      member_id: r.member_id || '',
      amount: r.amount || '',
      pay_mode: r.pay_mode || 'રોકડ',
      narration: r.narration || '',
      receiver: r.receiver || 'દિનેશભાઈ ચૌધરી (મંત્રી)',
      year_name: rowYear
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    const targetYear = editingId ? (formData.year_name || activeYear) : activeYear;
    if (isRecordLocked && isRecordLocked(targetYear)) {
      showToast(`નાણાકીય વર્ષ (${targetYear}) લૉક હોવાથી સાચવી શકાશે નહીં.`, 'error');
      return;
    }
    if (!checkCanModify(editingId ? 'રસીદ સુધારો' : 'નવી રસીદ સાચવો', targetYear)) return;
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast('કૃપા કરીને માન્ય રકમ દાખલ કરો', 'warning');
      return;
    }
    if (!formData.member_id) {
      showToast('કૃપા કરીને સભાસદ પસંદ કરો', 'warning');
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      member_name: selectedMember?.member_name_guj || selectedMember?.name || 'સભાસદ',
      member_no: selectedMember?.member_code || selectedMember?.memberNo || '',
      village_name: selectedMember?.village_name_guj || selectedMember?.villageName || 'ભારૂંડી',
      book_name: activeBook.name
    };

    try {
      if (editingId) {
        const res = await updateReceipt(editingId, payload);
        if (res && res.success) {
          showToast(`રસીદ નં. ${formData.receipt_no} સફળતાપૂર્વક સુધારી લેવાઈ!`, 'success');
          setOpenModal(false);
          loadData();
        } else {
          showToast(res?.message || 'રસીદ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addReceipt(payload);
        if (res && res.success) {
          showToast(`રસીદ નં. ${formData.receipt_no} સફળતાપૂર્વક સાચવાઈ ગઈ!`, 'success');
          setOpenModal(false);
          setPrintReceiptData(payload);
          loadData();
        } else {
          showToast(res?.message || 'રસીદ સાચવવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    const target = (receipts || []).find(r => r.id === deleteId);
    const targetYear = target?.year_name || target?.year || activeYear;
    if (isRecordLocked && isRecordLocked(targetYear)) {
      showToast(`નાણાકીય વર્ષ (${targetYear}) લૉક હોવાથી રસીદ ડિલીટ કરી શકાય નહિ.`, 'error');
      setDeleteId(null);
      return;
    }
    if (!checkCanModify('રસીદ ડિલીટ', targetYear)) return;
    try {
      const res = await deleteReceipt(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('રોકડ રસીદ સફળતાપૂર્વક ડિલીટ કરાઈ.', 'success');
        loadData();
      } else {
        showToast(res?.message || 'રસીદ ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const isCurrentActiveYearLocked = Boolean(isRecordLocked ? isRecordLocked(activeYear) : isYearLocked);

  return (
    <Box>
      <PageHeader
        title="રોકડ રસીદ એન્ટ્રી અને પાવતી"
        subtitle={`નાણાકીય વર્ષ ${activeYear} અને અગાઉના તમામ વર્ષોની પિયત બિલિંગ પેટે જમા થયેલ રોકડ રસીદો (કુલ: ${totalCount})`}
        actions={
          <Tooltip title={isCurrentActiveYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી નવી રસીદ ઉમેરી શકાતી નથી` : ''}>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                disabled={isCurrentActiveYearLocked}
                onClick={handleOpenAdd}
              >
                {isCurrentActiveYearLocked ? 'લૉક વર્ષ (ઉમેરો અમાન્ય)' : 'નવી રોકડ રસીદ બનાવો'}
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isCurrentActiveYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>નાણાકીય વર્ષ {activeYear} લૉક છે:</b> રોકડ રસીદો ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) કરી શકાય છે. કોઈપણ ફેરફાર કે ડિલીટ પ્રતિબંધિત છે.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="રસીદ નંબર, સભાસદનું નામ અથવા કોડ શોધો..."
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={100}>રસીદ નં</TableCell>
                <TableCell width={110}>નાણાકીય વર્ષ</TableCell>
                <TableCell width={110}>તારીખ</TableCell>
                <TableCell>સભાસદ કોડ અને નામ</TableCell>
                <TableCell>ગામ</TableCell>
                <TableCell>રસીદ બુક</TableCell>
                <TableCell>વિગત</TableCell>
                <TableCell align="right">રકમ (₹)</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(receipts || []).map((r) => {
                const rowYear = r.year_name || r.year || activeYear;
                const isRowLocked = Boolean(isRecordLocked ? isRecordLocked(rowYear) : false);

                return (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {r.receipt_no}
                    </TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip
                          size="small"
                          label={rowYear}
                          color={rowYear === activeYear ? 'primary' : 'default'}
                          variant={rowYear === activeYear ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </span>
                      <span className="print-only">
                        {rowYear}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {r.member_no} - {r.member_name}
                    </TableCell>
                    <TableCell>{r.village_name || '-'}</TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip size="small" label={r.book_name || 'મુખ્ય બુક'} variant="outlined" />
                      </span>
                      <span className="print-only">
                        {r.book_name || 'મુખ્ય બુક'}
                      </span>
                    </TableCell>
                    <TableCell>{r.narration}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ₹ {Number(r.amount).toLocaleString('gu-IN')}
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title="રસીદ પહોંચ પ્રિન્ટ કરો">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => setPrintReceiptData(r)}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isRowLocked ? `નાણાકીય વર્ષ (${rowYear}) લૉક હોવાથી સુધારી શકાય નહિ` : 'રસીદ સુધારો'}>
                        <span>
                          <IconButton
                            color="primary"
                            size="small"
                            disabled={isRowLocked}
                            onClick={() => handleOpenEdit(r)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isRowLocked ? `નાણાકીય વર્ષ (${rowYear}) લૉક હોવાથી રદ કરી શકાય નહિ` : 'રસીદ રદ કરો'}>
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            disabled={isRowLocked}
                            onClick={() => setDeleteId(r.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!receipts || receipts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'લોડ થઈ રહ્યું છે...' : 'કોઈ રોકડ રસીદો મળી નથી.'}
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
          labelRowsPerPage="પ્રતિ પેજ રસીદો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : `વધુ`}`}
          className="no-print"
        />
      </Paper>

      <PrintSignatures />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="રોકડ રસીદ રદ કરવાની ખાતરી"
        message="શું તમે ખરેખર આ રોકડ રસીદ રદ (Delete) કરવા માંગો છો? આ પ્રક્રિયા પાછી વાળી શકાશે નહીં."
        confirmText="હા, રદ કરો"
        cancelText="ના, રદ ન કરો"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* New / Edit Cash Receipt Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'રોકડ રસીદ સુધારો' : 'નવી રોકડ રસીદ પાવતી'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="રસીદ નંબર"
                value={formData.receipt_no}
                onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="તારીખ"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="રસીદ બુક પસંદ કરો"
                value={formData.book_id}
                onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
              >
                {receiptBooks.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} (હાલનો નં: {b.current_no})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ચૂકવણી મોડ"
                value={formData.pay_mode}
                onChange={(e) => setFormData({ ...formData, pay_mode: e.target.value })}
              >
                <MenuItem value="રોકડ">રોકડ (Cash)</MenuItem>
                <MenuItem value="બેંક ચેક">બેંક ચેક (Cheque)</MenuItem>
                <MenuItem value="ઓનલાઇન / NEFT">ઓનલાઇન / NEFT</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="સભાસદ પસંદ કરો"
                value={formData.member_id}
                onChange={(e) => handleMemberChange(e.target.value)}
              >
                {members.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.member_code} - {m.member_name_guj} ({m.village_name_guj})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="જમા રકમ (₹)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                autoFocus
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="લખાણ / વિગત (Narration)"
                value={formData.narration}
                onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="સ્વીકારનાર અધિકારી / કર્મચારી"
                value={formData.receiver}
                onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" startIcon={<SaveIcon />}>
            {editingId ? 'સુધારો સાચવો' : 'સાચવો અને પહોંચ આપો'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Receipt Modal Component */}
      <ReceiptPrintModal
        open={Boolean(printReceiptData)}
        onClose={() => setPrintReceiptData(null)}
        receipt={printReceiptData}
      />
    </Box>
  );
}
