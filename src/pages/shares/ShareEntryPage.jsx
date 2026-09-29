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
  MenuItem,
  Box,
  Typography,
  Alert,
  Tooltip,
  TablePagination,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

const ShareEntryPage = () => {
  const { shares, addShare, updateShare, deleteShare, members, fetchShares, fetchMembers } = useData();
  const { showToast, activeYear, isYearLocked, isRecordLocked, checkCanModify } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    certiNo: '',
    memberId: '',
    fromNo: '૧',
    toNo: '૫૦',
    shareCount: 50,
    faceValue: 100,
    amount: 5000,
    issueDate: new Date().toISOString().split('T')[0],
    tharavDate: new Date().toISOString().split('T')[0],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchShares({
      year: activeYear,
      search: searchTerm,
      page: page + 1,
      limit: rowsPerPage
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchShares, activeYear, searchTerm, page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchMembers(activeYear);
  }, [fetchMembers, activeYear]);

  const isCurrentActiveYearLocked = Boolean(isRecordLocked ? isRecordLocked(activeYear) : isYearLocked);

  const handleOpenAdd = () => {
    if (isCurrentActiveYearLocked) {
      showToast('પાછલું વર્ષ લૉક હોવાથી નવા શેર ફાળવી શકાશે નહીં.', 'warning');
      return;
    }
    if (!checkCanModify('નવા શેર ફાળવો', activeYear)) return;
    setEditingId(null);
    setFormData({
      certiNo: `C-010${(shares?.length || 0) + 1}`,
      memberId: members[0]?.id || 1,
      fromNo: '૧',
      toNo: '૫૦',
      shareCount: 50,
      faceValue: 100,
      amount: 5000,
      issueDate: new Date().toISOString().split('T')[0],
      tharavDate: new Date().toISOString().split('T')[0],
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (s) => {
    const rowYear = s.year_name || s.year || activeYear;
    if (isRecordLocked && isRecordLocked(rowYear)) {
      showToast(`નાણાકીય વર્ષ (${rowYear}) લૉક હોવાથી શેર વિગતમાં સુધારો શક્ય નથી.`, 'warning');
      return;
    }
    if (!checkCanModify('શેર સુધારો', rowYear)) return;
    setEditingId(s.id);
    const iDate = s.issue_date || s.issueDate;
    const tDate = s.tharav_date || s.tharavDate;
    setFormData({
      certiNo: s.certi_no || s.certiNo || '',
      memberId: s.member_id || s.memberId || members[0]?.id || 1,
      fromNo: s.from_no || s.fromNo || '',
      toNo: s.to_no || s.toNo || '',
      shareCount: s.share_count || s.shareCount || 50,
      faceValue: s.face_value || s.faceValue || 100,
      amount: s.amount || 5000,
      issueDate: iDate ? (typeof iDate === 'string' && iDate.includes('T') ? iDate.split('T')[0] : iDate) : '',
      tharavDate: tDate ? (typeof tDate === 'string' && tDate.includes('T') ? tDate.split('T')[0] : tDate) : '',
    });
    setOpenModal(true);
  };

  const handleMemberChange = (memberId) => {
    setFormData({ ...formData, memberId });
  };

  const handleShareCountChange = (count) => {
    const cnt = Number(count) || 1;
    setFormData((prev) => ({
      ...prev,
      shareCount: cnt,
      amount: cnt * Number(prev.faceValue),
    }));
  };

  const handleSave = async () => {
    if (!checkCanModify(editingId ? 'શેર સુધારો' : 'શેર ફાળવણી')) return;
    const mem = members.find((m) => m.id === Number(formData.memberId));
    const payload = {
      ...formData,
      memberNo: mem ? (mem.member_code || mem.memberNo) : '૧',
      memberName: mem ? (mem.name || mem.member_name_guj) : '',
      status: 'ચાલુ',
    };

    try {
      if (editingId) {
        const res = await updateShare(editingId, payload);
        if (res && res.success) {
          showToast('શેર પ્રમાણપત્ર વિગત સફળતાપૂર્વક સુધારી લેવાઈ!');
          setOpenModal(false);
          loadData();
        } else {
          showToast(res?.message || 'શેર સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addShare(payload);
        if (res && res.success) {
          showToast('નવા શેર પ્રમાણપત્રની નોંધણી સફળતાપૂર્વક થઈ!');
          setOpenModal(false);
          loadData();
        } else {
          showToast(res?.message || 'શેર નોંધવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    const target = (shares || []).find(s => s.id === deleteId);
    const targetYear = target?.year_name || target?.year || activeYear;
    if (isRecordLocked && isRecordLocked(targetYear)) {
      showToast(`નાણાકીય વર્ષ (${targetYear}) લૉક હોવાથી ડિલીટ કરી શકાશે નહીં.`, 'error');
      setDeleteId(null);
      return;
    }
    if (!checkCanModify('શેર ડિલીટ', targetYear)) return;
    try {
      const res = await deleteShare(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('શેર પ્રમાણપત્ર સફળતાપૂર્વક ડિલીટ કરાયું.', 'success');
        loadData();
      } else {
        showToast(res?.message || 'શેર ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="શેર ફાળવણી એન્ટ્રી (શેર ઇશ્યુ)"
        subtitle={`સભાસદોને ફાળવવામાં આવેલ સહકારી ઇક્વિટી શેર અને પ્રમાણપત્રોની નોંધણી (કુલ: ${totalCount})`}
        breadcrumb="શેર / શેર ફાળવણી"
        icon={<CardMembershipIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isCurrentActiveYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવા શેર ફાળવી શકાશે નહીં" : ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={isCurrentActiveYearLocked}
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                નવા શેર ફાળવો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {isCurrentActiveYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>નાણાકીય વર્ષ {activeYear} લૉક છે:</b> શેર ફાળવણી વિગતો ફક્ત વાંચવા અને પ્રિન્ટ માટે છે. કોઈપણ ફેરફાર કે ડિલીટ પ્રતિબંધિત છે.
        </Alert>
      )}

      {/* શોધ બાર */}
      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2 }}>
          <TextField
            placeholder="પ્રમાણપત્ર નં, સભાસદનું નામ કે કોડથી શોધો..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading ? <CircularProgress size={20} /> : null
            }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>પ્રમાણપત્ર નં</TableCell>
                <TableCell>સભાસદ નં</TableCell>
                <TableCell>સભાસદનું નામ</TableCell>
                <TableCell>શેર નં. થી</TableCell>
                <TableCell>શેર નં. સુધી</TableCell>
                <TableCell align="right">શેર સંખ્યા</TableCell>
                <TableCell align="right">શેર દીઠ કિંમત</TableCell>
                <TableCell align="right">કુલ શેર મૂડી (₹)</TableCell>
                <TableCell>ઇશ્યુ તારીખ</TableCell>
                <TableCell>ઠરાવ તારીખ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(shares || []).map((s) => {
                const certiNo = s.certi_no || s.certiNo;
                const mNo = s.member_no || s.memberNo || s.member_code;
                const mName = s.member_name || s.memberName || s.member_name_guj;
                const fromNo = s.from_no || s.fromNo;
                const toNo = s.to_no || s.toNo;
                const cnt = s.share_count || s.shareCount || s.count;
                const fVal = s.face_value || s.faceValue || 100;
                const amt = s.amount;
                const iDate = formatDate(s.issue_date || s.issueDate);
                const tDate = s.tharav_date || s.tharavDate ? formatDate(s.tharav_date || s.tharavDate) : (s.tharav_no || '-');
                const rowYear = s.year_name || s.year || activeYear;
                const isRowLocked = Boolean(isRecordLocked ? isRecordLocked(rowYear) : false);

                return (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#00695C' }}>{certiNo}</TableCell>
                    <TableCell>{mNo}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{mName}</TableCell>
                    <TableCell>{fromNo}</TableCell>
                    <TableCell>{toNo}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{cnt}</TableCell>
                    <TableCell align="right">₹ {fVal}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#00695C' }}>
                      ₹ {Number(amt).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{iDate}</TableCell>
                    <TableCell>{tDate}</TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isRowLocked ? `નાણાકીય વર્ષ (${rowYear}) લૉક હોવાથી સુધારો શક્ય નથી` : "સુધારો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isRowLocked}
                            onClick={() => handleOpenEdit(s)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isRowLocked ? `નાણાકીય વર્ષ (${rowYear}) લૉક હોવાથી ડિલીટ શક્ય નથી` : "ડિલીટ કરો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isRowLocked}
                            onClick={() => setDeleteId(s.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!shares || shares.length === 0) && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'લોડ થઈ રહ્યું છે...' : 'કોઈ શેર પ્રમાણપત્ર મળ્યા નથી.'}
                  </TableCell>
                </TableRow>
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
          labelRowsPerPage="પ્રતિ પેજ શેર:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : `વધુ`}`}
          className="no-print"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="શેર પ્રમાણપત્ર ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ શેર પ્રમાણપત્ર ડિલીટ કરવા માંગો છો? સભાસદના કુલ શેરમાંથી આ શેર બાદ કરવામાં આવશે."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />

      {/* નવો શેર ફાળવણી / સુધારો ડાયલોગ */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          {editingId ? 'શેર પ્રમાણપત્ર વિગત સુધારો' : 'નવા શેર પ્રમાણપત્રની ફાળવણી'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="સભાસદ પસંદ કરો"
            fullWidth
            value={formData.memberId}
            onChange={(e) => handleMemberChange(e.target.value)}
          >
            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                ({m.member_code || m.memberNo}) {m.name || m.member_name_guj} - {m.villageName || m.village_name_guj}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="પ્રમાણપત્ર નં"
              fullWidth
              value={formData.certiNo}
              onChange={(e) => setFormData({ ...formData, certiNo: e.target.value })}
            />
            <TextField
              label="શેર સંખ્યા"
              type="number"
              fullWidth
              value={formData.shareCount}
              onChange={(e) => handleShareCountChange(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="શેર નં. થી"
              fullWidth
              value={formData.fromNo}
              onChange={(e) => setFormData({ ...formData, fromNo: e.target.value })}
            />
            <TextField
              label="શેર નં. સુધી"
              fullWidth
              value={formData.toNo}
              onChange={(e) => setFormData({ ...formData, toNo: e.target.value })}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="કુલ શેર મૂડી રકમ (₹)"
              fullWidth
              disabled
              value={`₹ ${formData.amount}`}
            />
            <TextField
              label="ફાળવણી તારીખ"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? 'સુધારો સાચવો' : 'શેર ફાળવણી સાચવો'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShareEntryPage;
