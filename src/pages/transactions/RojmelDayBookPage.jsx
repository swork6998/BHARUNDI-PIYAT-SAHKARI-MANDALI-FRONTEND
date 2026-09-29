import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Card, CardContent,
  Divider, Chip, IconButton, Tooltip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function RojmelDayBookPage() {
  const { receipts, vouchers, fetchReceipts, fetchVouchers } = useData();
  const { activeYear, societyInfo } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReceipts(activeYear);
    fetchVouchers(activeYear);
  }, [fetchReceipts, fetchVouchers, activeYear]);

  const toDateString = (dVal) => {
    if (!dVal) return '';
    if (typeof dVal === 'string') return dVal.split('T')[0];
    try {
      return new Date(dVal).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Receipts on selected date
  const dayReceipts = useMemo(() => {
    return (receipts || []).filter((r) => toDateString(r.date) === selectedDate);
  }, [receipts, selectedDate]);

  // Vouchers on selected date
  const dayVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => toDateString(v.date) === selectedDate);
  }, [vouchers, selectedDate]);

  // Calculate opening cash dynamically from prior days
  const openingCash = useMemo(() => {
    const baseOpeningCash = 45250;
    const priorIncome = (receipts || []).filter((r) => {
      const d = toDateString(r.date);
      return d && d < selectedDate;
    }).reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const priorExpense = (vouchers || []).filter((v) => {
      const d = toDateString(v.date);
      return d && d < selectedDate;
    }).reduce((sum, v) => sum + Number(v.amount || 0), 0);

    return baseOpeningCash + priorIncome - priorExpense;
  }, [receipts, vouchers, selectedDate]);

  const totalJamaIncome = dayReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalUdharExpense = dayVouchers.reduce((sum, v) => sum + Number(v.amount || 0), 0);

  const totalJamaSide = openingCash + totalJamaIncome;
  const closingCash = totalJamaSide - totalUdharExpense;
  const totalUdharSide = totalUdharExpense + closingCash;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <PageHeader
        title="દૈનિક રોજમેળ (Daily Rojmel Day Book)"
        subtitle="સહકારી મંડળીની પરંપરાગત રોજમેળ પદ્ધતિ (ડાબી બાજુ જમા/આવક અને જમણી બાજુ ઉધાર/જાવક)"
        onPrint={handlePrint}
      />

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="રોજમેળ તારીખ પસંદ કરો"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              નાણાકીય વર્ષ: <b>{activeYear}</b> | મંડળી: <b>{societyInfo.name}</b>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              આજની તારીખ
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cash Summary Banner */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">શરૂઆત રોકડ સિલક</Typography>
              <Typography variant="h6" fontWeight="bold">₹ {openingCash.toLocaleString('gu-IN')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.main' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">આજની કુલ જમા (આવક)</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                + ₹ {totalJamaIncome.toLocaleString('gu-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.main' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">આજની કુલ ઉધાર (ખર્ચ)</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                - ₹ {totalUdharExpense.toLocaleString('gu-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.main' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">આખર રોકડ સિલક</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                ₹ {closingCash.toLocaleString('gu-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Two Column Classical Rojmel Table */}
      <Grid container spacing={2} className="print-page">
        {/* Left Column: જમા (Receipts) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: '2px solid #16a34a' }}>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                જમા બાજુ (આવક / રસીદો)
              </Typography>
              <Chip label={`કુલ: ${dayReceipts.length} રસીદ`} size="small" color="success" variant="outlined" />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell width={80}>રસીદ નં</TableCell>
                    <TableCell>ખાતાનું નામ / વિગત</TableCell>
                    <TableCell align="right">રકમ (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Opening Cash Entry */}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>-</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>આગળ લાવ્યા રોકડ સિલક</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {openingCash.toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>

                  {dayReceipts.map((r, idx) => (
                    <TableRow key={r.id || idx} hover>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>{r.receipt_no}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{r.member_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.narration || 'પિયાત વસૂલાત'}</Typography>
                      </TableCell>
                      <TableCell align="right">{Number(r.amount).toLocaleString('gu-IN')}</TableCell>
                    </TableRow>
                  ))}

                  {dayReceipts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 2.5, color: 'text.secondary' }}>
                        આ તારીખે કોઈ જમા (આવક) રસીદ નોંધાયેલ નથી.
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow sx={{ borderTop: '2px solid #ccc', bgcolor: 'background.default' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      કુલ જમા રકમ
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'success.main' }}>
                      ₹ {totalJamaSide.toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: ઉધાર (Payments) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: '2px solid #dc2626' }}>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                ઉધાર બાજુ (જાવક / ખર્ચાઓ)
              </Typography>
              <Chip label={`કુલ: ${dayVouchers.length} વાઉચર`} size="small" color="error" variant="outlined" />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell width={80}>વાઉચર</TableCell>
                    <TableCell>ખાતાનું નામ / વિગત</TableCell>
                    <TableCell align="right">રકમ (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dayVouchers.map((v, idx) => (
                    <TableRow key={v.id || idx} hover>
                      <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{v.voucher_no}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{v.debit_account}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.narration || v.paid_to || 'ખર્ચ'}</Typography>
                      </TableCell>
                      <TableCell align="right">{Number(v.amount).toLocaleString('gu-IN')}</TableCell>
                    </TableRow>
                  ))}

                  {dayVouchers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 2.5, color: 'text.secondary' }}>
                        આ તારીખે કોઈ ઉધાર (જાવક) વાઉચર નોંધાયેલ નથી.
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Closing Cash Balance Entry */}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>-</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>આખર રોકડ સિલક (હાથ પર)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {closingCash.toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ borderTop: '2px solid #ccc', bgcolor: 'background.default' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      કુલ ઉધાર રકમ
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'error.main' }}>
                      ₹ {totalUdharSide.toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <PrintSignatures />
    </Box>
  );
}
