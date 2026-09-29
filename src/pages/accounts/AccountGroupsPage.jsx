import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Chip, IconButton, Tooltip, InputAdornment, Alert,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FolderOpen as FolderIcon,
  AccountBalance as AccountBalanceIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function AccountGroupsPage() {
  const { addAccountGroup, updateAccountGroup, deleteAccountGroup, fetchAccountGroups } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  const [groupsList, setGroupsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'દેવા (Liabilities)'
  });

  const groupTypes = [
    'દેવા (Liabilities)',
    'મિલકત (Assets)',
    'આવક (Income)',
    'ખર્ચ (Expense)'
  ];

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAccountGroups({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setGroupsList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching account groups:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchAccountGroups, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenAdd = () => {
    if (!checkCanModify('નવું ખાતા ગ્રુપ ઉમેરો')) return;
    setEditingId(null);
    setFormData({ name: '', type: 'દેવા (Liabilities)' });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    if (!checkCanModify('ખાતા ગ્રુપ સુધારો')) return;
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      type: item.type || 'દેવા (Liabilities)'
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'ખાતા ગ્રુપ સુધારો' : 'ખાતા ગ્રુપ સાચવો')) return;
    if (!formData.name.trim()) {
      showToast('કૃપા કરીને ખાતા ગ્રુપનું નામ દાખલ કરો', 'warning');
      return;
    }
    try {
      if (editingId) {
        const res = await updateAccountGroup(editingId, formData);
        if (res && res.success) {
          showToast('ખાતા ગ્રુપ વિગત સફળતાપૂર્વક સુધારી લેવાઈ!', 'success');
        } else {
          showToast(res?.message || 'ખાતા ગ્રુપ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addAccountGroup(formData);
        if (res && res.success) {
          showToast('નવું ખાતા ગ્રુપ સફળતાપૂર્વક ઉમેરાયું!', 'success');
        } else {
          showToast(res?.message || 'ખાતા ગ્રુપ ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
      setOpenModal(false);
      loadGroups();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('ખાતા ગ્રુપ ડિલીટ')) return;
    try {
      const res = await deleteAccountGroup(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('ખાતા ગ્રુપ સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
      } else {
        showToast(res?.message || 'ખાતા ગ્રુપ ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadGroups();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const getTypeChipColor = (type) => {
    if (type?.includes('આવક')) return 'success';
    if (type?.includes('ખર્ચ')) return 'error';
    if (type?.includes('મિલકત')) return 'primary';
    return 'warning';
  };

  return (
    <Box>
      <PageHeader
        title="ખાતા ગ્રુપ માસ્ટર"
        subtitle="સહકારી મંડળીના હિસાબી વર્ગીકરણ (Assets, Liabilities, Income, Expense) માટેના મુખ્ય ગ્રુપો"
        actionLabel={isYearLocked ? undefined : "નવું ખાતા ગ્રુપ ઉમેરો"}
        actionIcon={<AddIcon />}
        onAction={handleOpenAdd}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નવું ખાતા ગ્રુપ ઉમેરવું શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="ખાતા ગ્રુપનું નામ અથવા પ્રકાર શોધો..."
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
                <TableCell width={80}>અનુક્રમ</TableCell>
                <TableCell>ખાતા ગ્રુપનું નામ</TableCell>
                <TableCell>મુખ્ય પ્રકાર (Account Classification)</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : groupsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ ખાતા ગ્રુપ મળ્યું નથી.
                  </TableCell>
                </TableRow>
              ) : (
                groupsList.map((item, index) => (
                  <TableRow key={item.id || index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.type}
                        color={getTypeChipColor(item.type)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="સક્રિય" color="success" />
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
          labelRowsPerPage="પ્રતિ પેજ ગ્રુપો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="ખાતા ગ્રુપ ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ ખાતા ગ્રુપ ડિલીટ કરવા માંગો છો? જો આ ગ્રુપ હેઠળ સામાન્ય ખાતાઓ (Hdmst) હશે તો ડિલીટ થશે નહીં."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* Add / Edit Account Group Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'ખાતા ગ્રુપ સુધારો' : 'નવું ખાતા ગ્રુપ ઉમેરો'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="ખાતા ગ્રુપનું નામ (ગુજરાતીમાં)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            fullWidth
            select
            label="હિસાબી પ્રકાર (Classification)"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            {groupTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
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
