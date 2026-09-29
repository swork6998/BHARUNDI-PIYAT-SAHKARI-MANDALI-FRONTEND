import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Divider, Card, CardContent,
  Chip, CircularProgress
} from '@mui/material';
import {
  Print as PrintIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function RojmelPrintPage() {
  const { receipts, vouchers, fetchReceipts, fetchVouchers } = useData();
  const { activeYear, societyInfo } = useApp();

  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [appliedFromDate, setAppliedFromDate] = useState('2026-04-01');
  const [appliedToDate, setAppliedToDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (fDate, tDate) => {
    setLoading(true);
    await Promise.all([
      fetchReceipts({ year: activeYear, fromDate: fDate, toDate: tDate }),
      fetchVouchers({ year: activeYear, fromDate: fDate, toDate: tDate })
    ]);
    setLoading(false);
  }, [fetchReceipts, fetchVouchers, activeYear]);

  useEffect(() => {
    loadData(appliedFromDate, appliedToDate);
  }, [loadData, appliedFromDate, appliedToDate]);

  const handleSearch = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    loadData(fromDate, toDate);
  };

  const handleResetToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setAppliedFromDate(today);
    setAppliedToDate(today);
    loadData(today, today);
  };

  const handleResetToCurrentYear = () => {
    const start = '2026-04-01';
    const end = new Date().toISOString().split('T')[0];
    setFromDate(start);
    setToDate(end);
    setAppliedFromDate(start);
    setAppliedToDate(end);
    loadData(start, end);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract YYYY-MM-DD from various date representations
  const toDateString = (dVal) => {
    if (!dVal) return '';
    if (typeof dVal === 'string') return dVal.split('T')[0];
    try {
      return new Date(dVal).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Filter with date boundary check
  const filteredReceipts = useMemo(() => {
    return (receipts || []).filter((r) => {
      const d = toDateString(r.date);
      if (!d) return false;
      if (appliedFromDate && d < appliedFromDate) return false;
      if (appliedToDate && d > appliedToDate) return false;
      return true;
    });
  }, [receipts, appliedFromDate, appliedToDate]);

  const filteredVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => {
      const d = toDateString(v.date);
      if (!d) return false;
      if (appliedFromDate && d < appliedFromDate) return false;
      if (appliedToDate && d > appliedToDate) return false;
      return true;
    });
  }, [vouchers, appliedFromDate, appliedToDate]);

  const totalReceipts = useMemo(() => {
    return filteredReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [filteredReceipts]);

  const totalVouchers = useMemo(() => {
    return filteredVouchers.reduce((sum, v) => sum + Number(v.amount || 0), 0);
  }, [filteredVouchers]);

  // Initial base cash as of 2026-04-01
  const initialBaseCash = 45250;
  const openingCash = initialBaseCash;
  const closingCash = openingCash + totalReceipts - totalVouchers;

  return (
    <Box>
      <PageHeader
        title="રોજમેળ પત્રક પ્રિન્ટિંગ"
        subtitle="નિયત સમયગાળાનો દૈનિક રોજમેળ સત્તાવાર રજીસ્ટર સ્વરૂપે પ્રિન્ટ કરવા માટે"
        actionLabel="પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={handlePrint}
      />

      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="તારીખથી (From Date)"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="તારીખ સુધી (To Date)"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ height: 40, fontWeight: 700 }}
            >
              પત્રક શોધો
            </Button>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetToToday}
              sx={{ flex: 1, height: 40 }}
            >
              આજનો રોજમેળ
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetToCurrentYear}
              sx={{ flex: 1, height: 40 }}
            >
              આખું વર્ષ
            </Button>
          </Grid>
        </Grid>

        {/* Filter status banner */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={`સમયગાળો: ${formatDate(appliedFromDate)} થી ${formatDate(appliedToDate)}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`કુલ જમા રસીદો: ${filteredReceipts.length} (₹ ${totalReceipts.toLocaleString('gu-IN')})`}
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`કુલ ઉધાર વાઉચરો: ${filteredVouchers.length} (₹ ${totalVouchers.toLocaleString('gu-IN')})`}
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </Box>
      </Paper>

      {/* Official Print Header */}
      <Paper sx={{ p: 4, mb: 3 }} className="print-page">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {societyInfo.name}
          </Typography>
          <Typography variant="subtitle1">
            {societyInfo.address} | નોંધણી નં: {societyInfo.reg_no}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, textDecoration: 'underline', fontWeight: 'bold' }}>
            દૈનિક રોજમેળ પત્રક ({formatDate(appliedFromDate)} થી {formatDate(appliedToDate)})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            નાણાકીય વર્ષ: {activeYear}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Side by side Rojmel Ledger */}
        <Grid container spacing={3}>
          {/* Jama Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" color="success.main" sx={{ mb: 1, borderBottom: '2px solid' }}>
              જમા બાજુ (આવક / રસીદ વિગત)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>તારીખ / રસીદ નં</TableCell>
                    <TableCell>વિગત</TableCell>
                    <TableCell align="right">રકમ (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>-</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>આગળ લાવ્યા શરૂઆત રોકડ સિલક</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{openingCash.toLocaleString('gu-IN')}</TableCell>
                  </TableRow>
                  {filteredReceipts.map((r, i) => (
                    <TableRow key={r.id || i} hover>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatDate(r.date)} <br />
                        <Typography variant="caption" color="text.secondary">નં. {r.receipt_no}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.member_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.narration || 'પિયાત ઉઘરાણી'}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {Number(r.amount).toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        પસંદ કરેલ સમયગાળામાં કોઈ જમા રસીદ મળી નથી.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>કુલ જમા રકમ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'success.main' }}>
                      ₹ {(openingCash + totalReceipts).toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Udhar Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" color="error.main" sx={{ mb: 1, borderBottom: '2px solid' }}>
              ઉધાર બાજુ (જાવક / વાઉચર વિગત)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>તારીખ / વાઉચર</TableCell>
                    <TableCell>વિગત / ખર્ચ ખાતું</TableCell>
                    <TableCell align="right">રકમ (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVouchers.map((v, i) => (
                    <TableRow key={v.id || i} hover>
                      <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatDate(v.date)} <br />
                        <Typography variant="caption" color="text.secondary">નં. {v.voucher_no}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.debit_account}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.narration || v.paid_to || 'ખર્ચ'}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {Number(v.amount).toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVouchers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        પસંદ કરેલ સમયગાળામાં કોઈ ઉધાર વાઉચર મળ્યું નથી.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>-</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>આખર રોકડ સિલક (હાથ પર)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{closingCash.toLocaleString('gu-IN')}</TableCell>
                  </TableRow>
                  <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>કુલ ઉધાર રકમ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'error.main' }}>
                      ₹ {(totalVouchers + closingCash).toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
}
