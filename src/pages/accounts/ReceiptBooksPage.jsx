import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, IconButton, Tooltip, InputAdornment, LinearProgress, Grid, Typography, Alert,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function ReceiptBooksPage() {
  const { addReceiptBook, updateReceiptBook, deleteReceiptBook, fetchReceiptBooks } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [receiptBooksList, setReceiptBooksList] = useState([]);
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
    start_no: 1,
    end_no: 500,
    current_no: 1
  });

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReceiptBooks({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setReceiptBooksList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching receipt books:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchReceiptBooks, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવી રસીદ બુક ઉમેરો')) return;
    setEditingId(null);
    const nextCode = `RB${String((totalCount || 0) + 1).padStart(2, '0')}`;
    setFormData({
      code: nextCode,
      name: `પિયાત ઉઘરાણી રસીદ બુક નં - ${(totalCount || 0) + 1}`,
      start_no: (totalCount || 0) * 500 + 1,
      end_no: ((totalCount || 0) + 1) * 500,
      current_no: (totalCount || 0) * 500 + 1
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    if (!checkCanModify('રસીદ બુક સુધારો')) return;
    setEditingId(item.id);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      start_no: item.start_no || 1,
      end_no: item.end_no || 500,
      current_no: item.current_no || 1
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'રસીદ બુક સુધારો' : 'રસીદ બુક સાચવો')) return;
    if (!formData.name.trim()) {
      showToast('કૃપા કરીને રસીદ બુકનું નામ દાખલ કરો', 'warning');
      return;
    }
    if (Number(formData.end_no) <= Number(formData.start_no)) {
      showToast('છેલ્લો નંબર શરૂઆત નંબર કરતા મોટો હોવો જોઈએ', 'warning');
      return;
    }

    try {
      if (editingId) {
        const res = await updateReceiptBook(editingId, {
          ...formData,
          status: 'ચાલુ'
        });
        if (res && res.success) {
          showToast('રસીદ બુક વિગત સફળતાપૂર્વક સુધારી લેવાઈ!', 'success');
        } else {
          showToast(res?.message || 'રસીદ બુક સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addReceiptBook({
          ...formData,
          status: 'ચાલુ'
        });
        if (res && res.success) {
          showToast('નવી રસીદ બુક સફળતાપૂર્વક ઉમેરાઈ ગઈ!', 'success');
        } else {
          showToast(res?.message || 'રસીદ બુક ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadBooks();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('રસીદ બુક ડિલીટ')) return;
    try {
      const res = await deleteReceiptBook(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('રસીદ બુક સફળતાપૂર્વક ડિલીટ કરાઈ.', 'success');
      } else {
        showToast(res?.message || 'રસીદ બુક ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadBooks();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="રસીદ બુક માસ્ટર"
        subtitle="પિયાત ઉઘરાણી, શેર મૂડી અને સામાન્ય આવક માટે અધિકૃત રસીદ બુકોનું સંચાલન"
        actionLabel={isYearLocked ? undefined : "નવી રસીદ બુક ઉમેરો"}
        actionIcon={<AddIcon />}
        onAction={handleOpenAdd}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નવી રસીદ બુક ઉમેરવી શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="રસીદ બુકનું નામ અથવા કોડ શોધો..."
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
                <TableCell width={100}>બુક કોડ</TableCell>
                <TableCell>રસીદ બુકનું નામ</TableCell>
                <TableCell align="center">શરૂઆત નંબર</TableCell>
                <TableCell align="center">છેલ્લો નંબર</TableCell>
                <TableCell align="center">ચાલુ નંબર</TableCell>
                <TableCell width={200}>વપરાશ પ્રગતિ</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : receiptBooksList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ રસીદ બુક મળી નથી.
                  </TableCell>
                </TableRow>
              ) : (
                receiptBooksList.map((item, index) => {
                  const total = Number(item.end_no) - Number(item.start_no) + 1;
                  const used = Number(item.current_no) - Number(item.start_no);
                  const progress = Math.min(100, Math.max(0, Math.round((used / total) * 100)));

                  return (
                    <TableRow key={item.id || index} hover>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {item.code}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                      <TableCell align="center">{item.start_no}</TableCell>
                      <TableCell align="center">{item.end_no}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        {item.current_no}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            color={progress > 80 ? 'error' : progress > 50 ? 'warning' : 'primary'}
                          />
                          <Typography variant="caption" sx={{ minWidth: 35 }}>{progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <span className="no-print">
                          <Chip
                            size="small"
                            label={progress >= 100 ? 'પૂર્ણ' : 'ચાલુ'}
                            color={progress >= 100 ? 'default' : 'success'}
                          />
                        </span>
                        <span className="print-only">
                          {progress >= 100 ? 'પૂર્ણ' : 'ચાલુ'}
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
                  );
                })
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
          labelRowsPerPage="પ્રતિ પેજ બુકો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="રસીદ બુક ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ રસીદ બુક ડિલીટ કરવા માંગો છો? જો આ બુકમાંથી રસીદો બનાવેલ હશે તો ડિલીટ થશે નહીં."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* Add / Edit Receipt Book Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'રસીદ બુક વિગત સુધારો' : 'નવી રસીદ બુક ઉમેરો'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="બુક કોડ"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="રસીદ બુકનું નામ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="શરૂઆત રસીદ નં."
                value={formData.start_no}
                onChange={(e) => setFormData({ ...formData, start_no: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="છેલ્લો રસીદ નં."
                value={formData.end_no}
                onChange={(e) => setFormData({ ...formData, end_no: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="પ્રારંભિક ચાલુ નં."
                value={formData.current_no}
                onChange={(e) => setFormData({ ...formData, current_no: Number(e.target.value) })}
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
