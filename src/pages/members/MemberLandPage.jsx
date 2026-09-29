import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Box,
  InputAdornment,
  TablePagination,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LandscapeIcon from '@mui/icons-material/Landscape';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const MemberLandPage = () => {
  const { villages, canals, subCanals, fetchVillages, fetchCanals, fetchSubCanals, fetchMemberBlocks, updateMemberBlock, deleteMemberBlock } = useData();
  const { showToast, isYearLocked, activeYear, checkCanModify } = useApp();

  const [blocks, setBlocks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    blockNo: '',
    surveyNo: '',
    area: '',
    canalId: '',
    subCanalId: '',
    cultivator: 'પોતે'
  });

  useEffect(() => {
    fetchVillages();
    if (fetchCanals) fetchCanals();
    if (fetchSubCanals) fetchSubCanals();
  }, [fetchVillages, fetchCanals, fetchSubCanals]);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMemberBlocks({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        village_id: selectedVillage
      });
      if (res && res.data) {
        setBlocks(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Error loading blocks:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMemberBlocks, page, rowsPerPage, searchQuery, selectedVillage]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleVillageChange = (e) => {
    setSelectedVillage(e.target.value);
    setPage(0);
  };

  const handleOpenEdit = (b) => {
    if (!checkCanModify('જમીન બ્લોક સુધારો')) return;
    setEditingBlock(b);
    setFormData({
      blockNo: b.block_no || '',
      surveyNo: b.survey_no || '',
      area: b.area || b.area_vigha || b.vigha || 1,
      canalId: b.canal_id || '',
      subCanalId: b.sub_canal_id || '',
      cultivator: b.cultivator_name || 'પોતે'
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!checkCanModify('જમીન બ્લોક સાચવો')) return;
    if (!formData.blockNo) {
      showToast('કૃપા કરીને બ્લોક નંબર દાખલ કરો.', 'warning');
      return;
    }

    try {
      const res = await updateMemberBlock(editingBlock.id, {
        block_no: formData.blockNo,
        survey_no: formData.surveyNo,
        area_vigha: formData.area,
        canal_id: formData.canalId || null,
        sub_canal_id: formData.subCanalId || null,
        cultivator_name: formData.cultivator
      });
      if (res && res.success) {
        showToast('જમીન બ્લોક વિગત સફળતાપૂર્વક સુધારી લેવાઈ!', 'success');
        setOpenModal(false);
        loadBlocks();
      } else {
        showToast(res?.message || 'બ્લોક સુધારવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('જમીન બ્લોક ડિલીટ')) return;
    try {
      const res = await deleteMemberBlock(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        showToast('જમીન બ્લોક સફળતાપૂર્વક ડિલીટ કરાયો.', 'success');
        loadBlocks();
      } else {
        showToast(res?.message || 'બ્લોક ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="ખેડૂત જમીન અને બ્લોક વિગત (લેન્ડ માસ્ટર)"
        subtitle="સભાસદોના સર્વે નંબરો, બ્લોક નંબરો, જમીન વિસ્તાર અને જોડાયેલ કેનાલ શાખાઓ"
        breadcrumb="સભાસદ / જમીન અને બ્લોક વિગત"
        icon={<LandscapeIcon sx={{ fontSize: 28 }} />}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. જમીન બ્લોકમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="સભાસદ નામ, બ્લોક કે સર્વે નંબરથી શોધો..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="ગામ ફિલ્ટર"
            size="small"
            value={selectedVillage}
            onChange={handleVillageChange}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">તમામ ગામો</MenuItem>
            {(villages || []).map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>સભાસદ નં</TableCell>
                <TableCell>ખેડૂતનું નામ</TableCell>
                <TableCell>ગામ</TableCell>
                <TableCell>બ્લોક નં</TableCell>
                <TableCell>સર્વે નં</TableCell>
                <TableCell align="right">વિસ્તાર (વીઘા)</TableCell>
                <TableCell>મુખ્ય નહેર</TableCell>
                <TableCell>શાખા નહેર</TableCell>
                <TableCell>ખેડનાર / વાવનાર</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : blocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ જમીન બ્લોક વિગત મળી નથી.
                  </TableCell>
                </TableRow>
              ) : (
                blocks.map((b, idx) => (
                  <TableRow key={b.id || `${b.member_id}-${b.block_no}-${idx}`} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#00695C' }}>{b.member_no}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.member_name}</TableCell>
                    <TableCell>{b.village_name}</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f0fdf4' }}>{b.block_no}</TableCell>
                    <TableCell>{b.survey_no || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0288D1' }}>
                      {b.area || b.vigha || '-'}
                    </TableCell>
                    <TableCell>{b.canal_name || 'મુખ્ય નહેર'}</TableCell>
                    <TableCell>{b.sub_canal_name || 'શાખા-૧'}</TableCell>
                    <TableCell>{b.cultivator_name || 'પોતે'}</TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? "વર્ષ લૉક હોવાથી સુધારો શક્ય નથી" : "સુધારો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isYearLocked}
                            onClick={() => handleOpenEdit(b)}
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
                            onClick={() => setDeleteId(b.id)}
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
          labelRowsPerPage="પ્રતિ પેજ બ્લોક:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="જમીન બ્લોક ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ જમીન બ્લોક વિગત ડિલીટ કરવા માંગો છો?"
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Edit Block Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          જમીન બ્લોક વિગત સુધારો ({editingBlock?.member_name} - સભાસદ નં: {editingBlock?.member_no})
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label="બ્લોક નંબર"
              fullWidth
              value={formData.blockNo}
              onChange={(e) => setFormData({ ...formData, blockNo: e.target.value })}
            />
            <TextField
              label="સર્વે નંબર"
              fullWidth
              value={formData.surveyNo}
              onChange={(e) => setFormData({ ...formData, surveyNo: e.target.value })}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="વિસ્તાર (વીઘા)"
              type="number"
              fullWidth
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            />
            <TextField
              label="વાવનાર / ખેડનાર"
              fullWidth
              value={formData.cultivator}
              onChange={(e) => setFormData({ ...formData, cultivator: e.target.value })}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="મુખ્ય નહેર"
              fullWidth
              value={formData.canalId}
              onChange={(e) => setFormData({ ...formData, canalId: e.target.value })}
            >
              <MenuItem value="">-- પસંદ કરો --</MenuItem>
              {(canals || []).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="શાખા નહેર"
              fullWidth
              value={formData.subCanalId}
              onChange={(e) => setFormData({ ...formData, subCanalId: e.target.value })}
            >
              <MenuItem value="">-- પસંદ કરો --</MenuItem>
              {(subCanals || []).map((sc) => (
                <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>
              ))}
            </TextField>
          </Box>
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

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
};

export default MemberLandPage;
