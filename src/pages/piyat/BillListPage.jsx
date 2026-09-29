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
  TextField,
  MenuItem,
  Chip,
  Box,
  Tooltip,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import BillPrintModal from '../../components/print/BillPrintModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

const BillListPage = () => {
  const { piyatEntries, seasons, fetchPiyatEntries, fetchSeasons, updatePiyatEntry, deletePiyatEntry } = useData();
  const { activeYear, activeSeason, isYearLocked, yearsList, showToast, showNotification, checkCanModify } = useApp();
  const notify = showToast || showNotification;
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState(activeYear);
  const [selectedSeason, setSelectedSeason] = useState(activeSeason);
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Sync with global header activeYear
  useEffect(() => {
    setSelectedYear(activeYear);
  }, [activeYear]);

  const loadData = useCallback(async () => {
    setLoading(true);
    let yearParam = selectedYear;
    if (fromDate || toDate) {
      if (selectedYear === activeYear) {
        const checkYear = fromDate ? fromDate.split('-')[0] : toDate.split('-')[0];
        const activeEnglishYear = activeYear ? activeYear.replace(/[૦-૯]/g, d => '૦૧૨૩૪૫૬૭૮૯'.indexOf(d)).split('-')[0] : '';
        if (checkYear && checkYear !== activeEnglishYear && checkYear !== String(Number(activeEnglishYear) + 1)) {
          yearParam = 'all';
        }
      }
    }
    const res = await fetchPiyatEntries({
      year: yearParam,
      season: selectedSeason,
      is_billed: statusFilter,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      search: searchTerm,
      page: page + 1,
      limit: rowsPerPage
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchPiyatEntries, selectedYear, activeYear, selectedSeason, statusFilter, fromDate, toDate, searchTerm, page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEdit = (p) => {
    if (!checkCanModify('પિયત એન્ટ્રી સુધારો')) return;
    setEditingEntry({
      ...p,
      area_vigha: p.area_vigha ?? p.area ?? 1,
      pani_count: p.pani_count ?? p.paniCount ?? 1,
      rate: p.rate ?? 150,
      water_type: p.water_type || p.waterType || 'વહેતા પાણી',
      block_no: p.block_no || p.blockNo || '૧',
      base_amount: p.base_amount ?? p.baseAmount ?? 0,
      cess_20: p.cess_20 ?? p.cess20 ?? 0,
      total_amount: p.total_amount ?? p.totalAmount ?? 0,
    });
    setOpenEditModal(true);
  };

  const handleEditFieldChange = (field, val) => {
    setEditingEntry((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'area_vigha' || field === 'pani_count' || field === 'rate') {
        const area = Number(field === 'area_vigha' ? val : updated.area_vigha) || 0;
        const pani = Number(field === 'pani_count' ? val : updated.pani_count) || 0;
        const rate = Number(field === 'rate' ? val : updated.rate) || 0;
        const base = Math.round(area * pani * rate);
        const cess = Math.round(base * 0.20);
        const total = base + cess;
        updated.base_amount = base;
        updated.cess_20 = cess;
        updated.total_amount = total;
      }
      return updated;
    });
  };

  const handleSaveEdit = async () => {
    if (!checkCanModify('પિયત એન્ટ્રી સાચવો')) return;
    try {
      const res = await updatePiyatEntry(editingEntry.id, {
        area_vigha: editingEntry.area_vigha,
        pani_count: editingEntry.pani_count,
        rate: editingEntry.rate,
        water_type: editingEntry.water_type,
        block_no: editingEntry.block_no,
        base_amount: editingEntry.base_amount,
        cess_20: editingEntry.cess_20,
        total_amount: editingEntry.total_amount,
      });
      if (res && res.success) {
        notify('પિયત એન્ટ્રી વિગત સફળતાપૂર્વક સુધારી લેવાઈ!', 'success');
        setOpenEditModal(false);
        loadData();
      } else {
        notify(res?.message || 'એન્ટ્રી સુધારવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      notify('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!checkCanModify('પિયત એન્ટ્રી ડિલીટ')) return;
    try {
      const res = await deletePiyatEntry(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        notify('પિયત એન્ટ્રી સફળતાપૂર્વક ડિલીટ કરાઈ.', 'success');
        loadData();
      } else {
        notify(res?.message || 'એન્ટ્રી ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      notify('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="પિયત બિલ યાદી અને પ્રિન્ટિંગ"
        subtitle={`નાણાકીય વર્ષ ${selectedYear === 'all' ? 'તમામ વર્ષો' : (selectedYear || activeYear)} ના પિયત બિલો (કુલ: ${totalCount})`}
        breadcrumb="પિયત / બિલ યાદી"
        icon={<ReceiptIcon sx={{ fontSize: 28 }} />}
        actions={
          <>
            <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી બિલ જનરેટ કરી શકાતું નથી` : ''}>
              <span>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={isYearLocked}
                  onClick={() => navigate('/piyat/generate-bills')}
                >
                  બિલ નંબર જનરેટ કરો
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી નવી એન્ટ્રી ઉમેરી શકાતી નથી` : ''}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  disabled={isYearLocked}
                  onClick={() => navigate('/piyat/single')}
                >
                  નવી પિયત એન્ટ્રી
                </Button>
              </span>
            </Tooltip>
          </>
        }
      />

      {/* ફિલ્ટર બાર */}
      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="બિલ નં, સભાસદ અથવા બ્લોક શોધો..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ flexGrow: 1, minWidth: 220 }}
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
            label="નાણાકીય વર્ષ"
            size="small"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">તમામ વર્ષો</MenuItem>
            {(yearsList || []).map((y) => {
              const val = y.year_name || y.name;
              return (
                <MenuItem key={y.id || val} value={val}>
                  {val}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            select
            label="સિંચાઈ ઋતુ"
            size="small"
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">તમામ ઋતુઓ</MenuItem>
            {(seasons || []).map((s) => (
              <MenuItem key={s.id || s.name} value={s.name}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="બિલ સ્થિતિ ફિલ્ટર"
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">તમામ રેકોર્ડ</MenuItem>
            <MenuItem value="billed">બિલ જનરેટ થયેલ (Billed)</MenuItem>
            <MenuItem value="unbilled">બિલ બાકી (Unbilled)</MenuItem>
          </TextField>

          <TextField
            size="small"
            type="date"
            label="તારીખથી (From Date)"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          <TextField
            size="small"
            type="date"
            label="તારીખ સુધી (To Date)"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          {(searchTerm || statusFilter !== 'all' || fromDate || toDate || (selectedYear && selectedYear !== activeYear) || selectedSeason !== activeSeason) && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={() => {
                setSearchTerm('');
                setSelectedYear(activeYear);
                setSelectedSeason(activeSeason);
                setStatusFilter('all');
                setFromDate('');
                setToDate('');
                setPage(0);
              }}
            >
              રીસેટ
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>બિલ નં</TableCell>
                <TableCell>નાણાકીય વર્ષ</TableCell>
                <TableCell>તારીખ</TableCell>
                <TableCell>સભાસદ નં</TableCell>
                <TableCell>ખેડૂતનું નામ</TableCell>
                <TableCell>ગામ</TableCell>
                <TableCell>પાક</TableCell>
                <TableCell align="right">વિસ્તાર (વીઘા)</TableCell>
                <TableCell align="right">પાણી ફેરી</TableCell>
                <TableCell align="right">૨૦% સેસ</TableCell>
                <TableCell align="right">કુલ રકમ (₹)</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!piyatEntries || piyatEntries.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 4, color: '#64748b' }}>
                    {loading ? 'લોડ થઈ રહ્યું છે...' : 'પસંદ કરેલ ફિલ્ટર મુજબ કોઈ પિયત એન્ટ્રી મળી નથી.'}
                  </TableCell>
                </TableRow>
              ) : (
                piyatEntries.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#00695C' }}>
                      {p.bill_no || p.billNo || (
                        <>
                          <span className="no-print"><Chip label="કાચી એન્ટ્રી" size="small" variant="outlined" /></span>
                          <span className="print-only">કાચી એન્ટ્રી</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip
                          size="small"
                          label={p.year_name || p.year || selectedYear}
                          color={p.year_name === selectedYear ? 'primary' : 'default'}
                          variant={p.year_name === selectedYear ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </span>
                      <span className="print-only">
                        {p.year_name || p.year || selectedYear}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(p.bill_date || p.entry_date)}</TableCell>
                    <TableCell>{p.member_code || p.memberNo}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.member_name_guj || p.memberName}</TableCell>
                    <TableCell>{p.village_name || p.villageName || '-'}</TableCell>
                    <TableCell>{p.crop_name_guj || p.cropName}</TableCell>
                    <TableCell align="right">{p.area_vigha ?? p.area ?? 1}</TableCell>
                    <TableCell align="right">{p.pani_count ?? p.paniCount ?? 1}</TableCell>
                    <TableCell align="right" sx={{ color: '#dc2626' }}>₹ {p.cess_20 ?? p.cess20 ?? 0}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#00695C', fontSize: '0.96rem' }}>
                      ₹ {p.total_amount ?? p.totalAmount ?? 0}
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <Chip
                          label={p.status || 'મંજૂર'}
                          size="small"
                          color={p.is_billed ? 'success' : 'default'}
                          variant={p.is_billed ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </span>
                      <span className="print-only">
                        {p.status || 'મંજૂર'}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title="આ બિલ પ્રિન્ટ કરો">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => setSelectedBillForPrint({
                              ...p,
                              billNo: p.bill_no || p.billNo || `B-${p.id}`,
                              billDate: formatDate(p.bill_date || p.entry_date),
                              memberName: p.member_name_guj || p.memberName,
                              memberNo: p.member_code || p.memberNo,
                              cropName: p.crop_name_guj || p.cropName,
                              area: p.area_vigha || p.area || 1,
                              paniCount: p.pani_count || p.paniCount || 1,
                              rate: p.rate || 150,
                              baseAmount: p.base_amount || p.baseAmount || 150,
                              cess20: p.cess_20 || p.cess20 || 30,
                              totalAmount: p.total_amount || p.totalAmount || 180,
                              waterType: p.water_type || p.waterType || 'વહેતા પાણી',
                              blockNo: p.block_no || p.blockNo || '૧',
                              season: p.season_name || p.season || selectedSeason,
                              year: p.year_name || p.year || selectedYear,
                              villageName: p.village_name_guj || p.village || p.villageName || 'ભારૂંડી',
                              category: p.category || 'સભાસદ'
                            })}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isYearLocked ? "વર્ષ લૉક હોવાથી સુધારો શક્ય નથી" : "સુધારો"}>
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={isYearLocked}
                              onClick={() => handleOpenEdit(p)}
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
                              onClick={() => setDeleteId(p.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
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
          labelRowsPerPage="પ્રતિ પેજ બિલ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : `વધુ`}`}
          className="no-print"
        />
      </Card>

      <PrintSignatures />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="પિયત એન્ટ્રી ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ પિયત એન્ટ્રી ડિલીટ કરવા માંગો છો? આ એન્ટ્રીની તમામ વિગતો રદ થશે."
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Edit Entry Dialog */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          પિયત એન્ટ્રી સુધારો ({editingEntry?.member_name_guj || editingEntry?.memberName} - {editingEntry?.crop_name_guj || editingEntry?.cropName})
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label="બ્લોક નંબર"
              fullWidth
              value={editingEntry?.block_no || ''}
              onChange={(e) => handleEditFieldChange('block_no', e.target.value)}
            />
            <TextField
              select
              label="પાણી પ્રકાર"
              fullWidth
              value={editingEntry?.water_type || 'વહેતા પાણી'}
              onChange={(e) => handleEditFieldChange('water_type', e.target.value)}
            >
              <MenuItem value="વહેતા પાણી">વહેતા પાણી</MenuItem>
              <MenuItem value="મોટર / ઉદવહન">મોટર / ઉદવહન</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="વિસ્તાર (વીઘા)"
              type="number"
              fullWidth
              value={editingEntry?.area_vigha ?? ''}
              onChange={(e) => handleEditFieldChange('area_vigha', e.target.value)}
            />
            <TextField
              label="પાણી ફેરી"
              type="number"
              fullWidth
              value={editingEntry?.pani_count ?? ''}
              onChange={(e) => handleEditFieldChange('pani_count', e.target.value)}
            />
            <TextField
              label="દર (₹)"
              type="number"
              fullWidth
              value={editingEntry?.rate ?? ''}
              onChange={(e) => handleEditFieldChange('rate', e.target.value)}
            />
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <span>મૂળ રકમ (Base):</span>
              <b>₹ {editingEntry?.base_amount || 0}</b>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#dc2626' }}>
              <span>૨૦% સેસ:</span>
              <b>₹ {editingEntry?.cess_20 || 0}</b>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#00695C', fontSize: '1.1rem' }}>
              <span>કુલ રકમ (Total):</span>
              <b>₹ {editingEntry?.total_amount || 0}</b>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            સાચવો (Save)
          </Button>
        </DialogActions>
      </Dialog>

      {/* વ્યક્તિગત બિલ પ્રિન્ટ મોડલ */}
      {selectedBillForPrint && (
        <BillPrintModal
          open={Boolean(selectedBillForPrint)}
          bill={selectedBillForPrint}
          billData={selectedBillForPrint}
          onClose={() => setSelectedBillForPrint(null)}
        />
      )}
    </Box>
  );
};

export default BillListPage;
