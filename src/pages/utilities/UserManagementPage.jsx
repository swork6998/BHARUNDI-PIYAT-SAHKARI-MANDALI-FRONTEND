import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Chip, IconButton, Tooltip, InputAdornment, Grid,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function UserManagementPage() {
  const { fetchUsers, addUser } = useData();
  const { showToast, isYearLocked, checkCanModify } = useApp();

  const [usersList, setUsersList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'ડેટા એન્ટ્રી ઓપરેટર'
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setUsersList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpen = () => {
    if (!checkCanModify('નવા વપરાશકર્તા ઉમેરવા')) return;
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'ડેટા એન્ટ્રી ઓપરેટર'
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('વપરાશકર્તા સાચવવા')) return;
    if (!formData.username.trim() || !formData.full_name.trim() || !formData.password.trim()) {
      showToast('કૃપા કરીને બધી વિગતો ભરો', 'warning');
      return;
    }

    try {
      const res = await addUser(formData);
      if (res.success) {
        showToast('નવા વપરાશકર્તા સફળતાપૂર્વક ઉમેરાયા!', 'success');
        setOpenModal(false);
        loadUsers();
      } else {
        showToast(res.message || 'વપરાશકર્તા ઉમેરવામાં ભૂલ થઈ', 'error');
      }
    } catch (e) {
      showToast('ક્ષતિ આવી: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="વપરાશકર્તા સંચાલન (User Management)"
        subtitle="મંડળીના સોફ્ટવેર ઑપરેટર્સ, મંત્રી અને પ્રમુખ શ્રીના લૉગિન એકાઉન્ટ્સ અને અધિકારો"
        actionLabel={isYearLocked ? 'લૉક વર્ષ (ઉમેરો અમાન્ય)' : 'નવા વપરાશકર્તા ઉમેરો'}
        actionIcon={<PersonAddIcon />}
        onAction={isYearLocked ? () => showToast('પસંદ કરેલ વર્ષ લૉક છે!', 'error') : handleOpen}
        disabledAction={isYearLocked}
      />

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="નામ, યૂઝરનેમ અથવા હોદ્દો શોધો..."
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={80}>અનુક્રમ</TableCell>
                <TableCell>વપરાશકર્તા નામ (Username)</TableCell>
                <TableCell>પૂરું નામ અને હોદ્દો</TableCell>
                <TableCell>સોંપેલ ભૂમિકા (Role)</TableCell>
                <TableCell>નોંધણી તારીખ</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયા</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : usersList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ વપરાશકર્તા મળ્યા નથી.
                  </TableCell>
                </TableRow>
              ) : (
                usersList.map((u, idx) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {u.username}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{u.full_name}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={u.role}
                        color={u.role === 'એડમિનિસ્ટ્રેટર' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{u.created_at ? formatDate(u.created_at) : 'ચાલુ'}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={u.is_active ? 'સક્રિય' : 'નિષ્ક્રિય'} color={u.is_active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? 'લૉક વર્ષ' : 'પાસવર્ડ રીસેટ કરો'}>
                        <span>
                          <IconButton
                            color="warning"
                            disabled={isYearLocked}
                            onClick={() => showToast(`પાસવર્ડ રીસેટ લિંક મોકલાઈ: ${u.username}`, 'info')}
                          >
                            <LockResetIcon />
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
          labelRowsPerPage="પ્રતિ પેજ વપરાશકર્તાઓ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      <Box sx={{ mt: 4 }} className="print-only">
        <PrintSignatures />
      </Box>

      {/* Add User Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>નવા વપરાશકર્તા ઉમેરો</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="વપરાશકર્તા લૉગિન આઈડી (Username)"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="પૂરું નામ (ગુજરાતીમાં)"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="પાસવર્ડ"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="ભૂમિકા (Role)"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <MenuItem value="એડમિનિસ્ટ્રેટર">એડમિનિસ્ટ્રેટર (સંપૂર્ણ અધિકાર)</MenuItem>
            <MenuItem value="ઓપરેટર / એકાઉન્ટન્ટ">ઓપરેટર / એકાઉન્ટન્ટ</MenuItem>
            <MenuItem value="ડેટા એન્ટ્રી ઓપરેટર">ડેટા એન્ટ્રી ઓપરેટર (માત્ર એન્ટ્રી)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            વપરાશકર્તા સાચવો
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
