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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Tooltip,
  Paper,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const BhavPatrakPage = () => {
  const { seasons, fetchBhavPatrak, fetchSeasons, updateBhavPatrak, deleteBhavPatrak } = useData();
  const { activeYear, activeSeason, showToast, showNotification, isYearLocked, isRecordLocked, yearsList, checkCanModify } = useApp();
  const notify = showToast || showNotification;

  const [selectedYear, setSelectedYear] = useState(activeYear);
  const [selectedSeason, setSelectedSeason] = useState(activeSeason);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratesList, setRatesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Sync with global header activeYear
  useEffect(() => {
    setSelectedYear(activeYear);
  }, [activeYear]);

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBhavPatrak({
        year: selectedYear,
        season: selectedSeason,
        search: searchTerm,
        page: page + 1,
        limit: rowsPerPage
      });
      if (res && res.data) {
        setRatesList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching rates:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchBhavPatrak, selectedYear, selectedSeason, searchTerm, page, rowsPerPage]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyForm, setCopyForm] = useState({
    fromYear: '૨૦૨૫-૨૦૨૬',
    fromSeason: 'રવિ (શિયાળુ)',
    toYear: activeYear,
    toSeason: activeSeason,
    percentage: 10,
  });

  const isEffectiveYearLocked = Boolean(isRecordLocked ? isRecordLocked(selectedYear || activeYear) : isYearLocked);

  const handleRateChange = (id, field, value) => {
    if (isEffectiveYearLocked) return;
    setRatesList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: Number(value) } : r))
    );
  };

  const handleSaveRow = async (row) => {
    if (isEffectiveYearLocked) {
      notify(`નાણાકીય વર્ષ (${selectedYear || activeYear}) લૉક હોવાથી દર સાચવી શકાતો નથી.`, 'warning');
      return;
    }
    if (!checkCanModify('ભાવ દર સાચવો', selectedYear || activeYear)) return;
    try {
      const res = await updateBhavPatrak(row.id, {
        sabhasad_rate: row.sabhasad_rate,
        nominal_rate: row.nominal_rate,
        motor_rate: row.motor_rate
      });
      if (res && res.success) {
        notify(`${row.crop_name || 'પાક'} ના દર સફળતાપૂર્વક સાચવવામાં આવ્યા!`, 'success');
      } else {
        notify(res?.message || 'દર સાચવવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      notify('ભૂલ: ' + e.message, 'error');
    }
  };

  const handleSaveAll = async () => {
    if (isEffectiveYearLocked) {
      notify(`નાણાકીય વર્ષ (${selectedYear || activeYear}) લૉક હોવાથી દર સાચવી શકાતો નથી.`, 'warning');
      return;
    }
    if (!checkCanModify('તમામ દર સાચવો', selectedYear || activeYear)) return;
    try {
      let errCount = 0;
      for (const r of ratesList) {
        const res = await updateBhavPatrak(r.id, {
          sabhasad_rate: r.sabhasad_rate,
          nominal_rate: r.nominal_rate,
          motor_rate: r.motor_rate
        });
        if (!res || !res.success) errCount++;
      }
      if (errCount === 0) {
        notify('આ પેજના તમામ ભાવ પત્રક દરો સફળતાપૂર્વક સાચવવામાં આવ્યા!', 'success');
      } else {
        notify(`કેટલાક દરો સાચવવામાં ભૂલ આવી (${errCount} પાક)`, 'warning');
      }
      loadRates();
    } catch (e) {
      notify('ભૂલ: ' + e.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (isEffectiveYearLocked) {
      notify(`નાણાકીય વર્ષ (${selectedYear || activeYear}) લૉક હોવાથી દર ડિલીટ શક્ય નથી.`, 'warning');
      setDeleteId(null);
      return;
    }
    if (!checkCanModify('ભાવ દર ડિલીટ', selectedYear || activeYear)) return;
    try {
      const res = await deleteBhavPatrak(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        notify('ભાવ દર સફળતાપૂર્વક ડિલીટ કરાયા.', 'success');
        loadRates();
      } else {
        notify(res?.message || 'દર ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
    } catch (e) {
      notify('ભૂલ: ' + e.message, 'error');
    }
  };

  const handleCopyRates = () => {
    if (isEffectiveYearLocked) {
      showNotification(`નાણાકીય વર્ષ (${selectedYear || activeYear}) લૉક હોવાથી ભાવ કોપી કરી શકાતા નથી.`, 'warning');
      return;
    }
    const pct = Number(copyForm.percentage) || 0;
    setRatesList((prev) =>
      prev.map((r) => ({
        ...r,
        sabhasad_rate: Math.round(Number(r.sabhasad_rate || 0) * (1 + pct / 100)),
        nominal_rate: Math.round(Number(r.nominal_rate || 0) * (1 + pct / 100)),
        motor_rate: Math.round(Number(r.motor_rate || 0) * (1 + pct / 100)),
      }))
    );
    setCopyModalOpen(false);
    showNotification(`ભાવો સફળતાપૂર્વક કોપી થયા અને ${pct}% વધારો લાગુ કરાયો!`);
  };

  return (
    <Box>
      <PageHeader
        title="ઋતુવાર પાક ભાવ પત્રક (સિંચાઈ દર માસ્ટર)"
        subtitle="સભાસદ દર, નોમિનલ (બિન-સભાસદ) દર અને મોટર ઉદવહન પાણી દરોની વિગત"
        breadcrumb="ભાવ પત્રક / પાક દર"
        icon={<CurrencyRupeeIcon sx={{ fontSize: 28 }} />}
        actions={
          <>
            <Tooltip title={isEffectiveYearLocked ? `પસંદ કરેલું વર્ષ (${selectedYear || activeYear}) લૉક હોવાથી ભાવ કોપી કરી શકાતા નથી` : ''}>
              <span>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  disabled={isEffectiveYearLocked}
                  onClick={() => setCopyModalOpen(true)}
                >
                  ગત સાલમાંથી ભાવ કોપી / વધારો
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={isEffectiveYearLocked ? `પસંદ કરેલું વર્ષ (${selectedYear || activeYear}) લૉક હોવાથી દર સાચવી શકાતા નથી` : ''}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={isEffectiveYearLocked}
                  onClick={handleSaveAll}
                >
                  તમામ દર સાચવો
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              ભાવ પત્રક પ્રિન્ટ
            </Button>
          </>
        }
      />

      {isEffectiveYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>નાણાકીય વર્ષ {selectedYear || activeYear} લૉક છે:</b> ભાવ પત્રક ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) કરવા માટે છે. કોઈપણ ફેરફાર કે ડિલીટ પ્રતિબંધિત છે.
        </Alert>
      )}

      {/* વર્ષ અને ઋતુ સિલેક્ટ બાર */}
      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            {(seasons || []).map((s) => (
              <MenuItem key={s.id || s.name} value={s.name}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            placeholder="પાકનું નામ અથવા કોડ શોધો..."
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>અ.નં</TableCell>
                <TableCell>પાકનું નામ (Crop Name)</TableCell>
                <TableCell align="right">સભાસદ દર (₹/વીઘા)</TableCell>
                <TableCell align="right">નોમિનલ (બિન-સભાસદ) દર (₹)</TableCell>
                <TableCell align="right">મોટર / ઉદવહન દર (₹)</TableCell>
                <TableCell align="center" className="no-print">ક્રિયાઓ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : ratesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ પાક દર મળ્યા નથી.
                  </TableCell>
                </TableRow>
              ) : (
                ratesList.map((r, index) => (
                  <TableRow key={r.id || index} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.96rem', color: '#1e293b' }}>
                      {r.crop_name || r.cropName}
                    </TableCell>
                    <TableCell align="right">
                      <span className="no-print">
                        <TextField
                          type="number"
                          size="small"
                          disabled={isEffectiveYearLocked}
                          value={r.sabhasad_rate ?? r.sabhasadRate ?? ''}
                          onChange={(e) => handleRateChange(r.id, 'sabhasad_rate', e.target.value)}
                          sx={{ width: 140 }}
                        />
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        {r.sabhasad_rate ?? r.sabhasadRate ? `₹ ${Number(r.sabhasad_rate ?? r.sabhasadRate).toLocaleString('gu-IN')}` : '-'}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="no-print">
                        <TextField
                          type="number"
                          size="small"
                          disabled={isEffectiveYearLocked}
                          value={r.nominal_rate ?? r.nominalRate ?? ''}
                          onChange={(e) => handleRateChange(r.id, 'nominal_rate', e.target.value)}
                          sx={{ width: 140 }}
                        />
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        {r.nominal_rate ?? r.nominalRate ? `₹ ${Number(r.nominal_rate ?? r.nominalRate).toLocaleString('gu-IN')}` : '-'}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="no-print">
                        <TextField
                          type="number"
                          size="small"
                          disabled={isEffectiveYearLocked}
                          value={r.motor_rate ?? r.motorRate ?? ''}
                          onChange={(e) => handleRateChange(r.id, 'motor_rate', e.target.value)}
                          sx={{ width: 140 }}
                        />
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        {r.motor_rate ?? r.motorRate ? `₹ ${Number(r.motor_rate ?? r.motorRate).toLocaleString('gu-IN')}` : '-'}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isEffectiveYearLocked ? "વર્ષ લૉક હોવાથી દર સાચવી શકાતો નથી" : "આ પાકના દર સાચવો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isEffectiveYearLocked}
                            onClick={() => handleSaveRow(r)}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isEffectiveYearLocked ? "વર્ષ લૉક હોવાથી દર ડિલીટ શક્ય નથી" : "ડિલીટ કરો"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isEffectiveYearLocked}
                            onClick={() => setDeleteId(r.id)}
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
          labelRowsPerPage="પ્રતિ પેજ દરો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="ભાવ પત્રક દર ડિલીટ કરવાની પુષ્ટિ"
        message="શું તમે ખરેખર આ પાકના ભાવ દર ડિલીટ કરવા માંગો છો?"
        confirmText="હા, ડિલીટ કરો"
        cancelText="ના, રદ કરો"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <PrintSignatures />

      {/* કોપી ભાવ મોડલ */}
      <Dialog open={copyModalOpen} onClose={() => setCopyModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00695C' }}>
          પાછલા વર્ષમાંથી ભાવ કોપી અને ટકાવારી વધારો
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="ક્યાં વર્ષમાંથી કોપી કરવા?"
            fullWidth
            value={copyForm.fromYear}
            onChange={(e) => setCopyForm({ ...copyForm, fromYear: e.target.value })}
          >
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
            label="કઈ ઋતુમાંથી?"
            fullWidth
            value={copyForm.fromSeason}
            onChange={(e) => setCopyForm({ ...copyForm, fromSeason: e.target.value })}
          >
            {(seasons || []).map((s) => (
              <MenuItem key={s.id || s.name} value={s.name}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="ટકાવારી વધારો (% Increase)"
            type="number"
            fullWidth
            placeholder="દા.ત. 10 (દરોમાં 10% વધારો)"
            value={copyForm.percentage}
            onChange={(e) => setCopyForm({ ...copyForm, percentage: e.target.value })}
            helperText="દાખલ કરેલ % મુજબ બધા પાકના દરો આપોઆપ ગણાઈ જશે."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCopyModalOpen(false)} color="inherit">
            રદ કરો
          </Button>
          <Button onClick={handleCopyRates} variant="contained" color="secondary" disabled={isYearLocked}>
            ભાવ લાગુ કરો (Apply Rates)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BhavPatrakPage;
