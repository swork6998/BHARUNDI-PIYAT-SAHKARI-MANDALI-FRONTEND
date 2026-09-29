import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Grid, Button, Divider, Card, CardContent, CircularProgress,
  TextField, Chip
} from '@mui/material';
import { Print as PrintIcon, Search as SearchIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';

export default function ProfitLossPage() {
  const { activeYear, societyInfo } = useApp();

  const [loading, setLoading] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });

  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [appliedFromDate, setAppliedFromDate] = useState('2026-04-01');
  const [appliedToDate, setAppliedToDate] = useState(new Date().toISOString().split('T')[0]);

  const loadProfitLoss = useCallback(async (fDate, tDate) => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      if (activeYear) qParams.append('year', activeYear);
      if (fDate) qParams.append('from_date', fDate);
      if (tDate) qParams.append('to_date', tDate);

      const r = await fetch(`http://localhost:5000/api/reports/profit-loss?${qParams.toString()}`);
      const res = await r.json();
      if (res.success) {
        setIncomes(res.income || []);
        setExpenses(res.expense || []);
        setTotals({
          totalIncome: Number(res.totalIncome) || 0,
          totalExpense: Number(res.totalExpense) || 0,
          netProfit: Number(res.netProfit) || 0
        });
      }
    } catch (err) {
      console.warn('Profit-Loss fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeYear]);

  useEffect(() => {
    loadProfitLoss(appliedFromDate, appliedToDate);
  }, [loadProfitLoss, appliedFromDate, appliedToDate]);

  const handleFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    loadProfitLoss(fromDate, toDate);
  };

  const handleResetToCurrentYear = () => {
    const start = '2026-04-01';
    const end = new Date().toISOString().split('T')[0];
    setFromDate(start);
    setToDate(end);
    setAppliedFromDate(start);
    setAppliedToDate(end);
    loadProfitLoss(start, end);
  };

  const totalExpense = totals.totalExpense;
  const totalIncome = totals.totalIncome;
  const netProfit = totals.netProfit;

  return (
    <Box>
      <PageHeader
        title="નફા-નુકસાન ખાતું (Profit & Loss Account)"
        subtitle={`સહકારી મંડળીનું વાર્ષિક નફા-નુકસાન ખાતું અને ચોખ્ખો નફો - વર્ષ: ${activeYear}`}
        actionLabel="નફા-નુકસાન ખાતું પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      {/* Date Filter Bar */}
      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3.5}>
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
          <Grid item xs={12} sm={3.5}>
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
          <Grid item xs={12} sm={2.5}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={handleFilter}
              sx={{ height: 40, fontWeight: 700 }}
            >
              પત્રક મેળવો
            </Button>
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResetToCurrentYear}
              sx={{ height: 40 }}
            >
              આખું વર્ષ
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Net Profit Card */}
      <Grid container spacing={3} sx={{ mb: 3 }} className="no-print">
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="error.main">કુલ વહીવટી ખર્ચાઓ</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                ₹ {totalExpense.toLocaleString('gu-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="success.main">કુલ પરોક્ષ આવકો</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ₹ {totalIncome.toLocaleString('gu-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="primary.main">ચોખ્ખો વાર્ષિક નફો (Net Profit)</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                ₹ {netProfit.toLocaleString('gu-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mb: 3 }} className="print-page">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">{societyInfo.name}</Typography>
          <Typography variant="subtitle1">{societyInfo.address}</Typography>
          <Typography variant="h6" sx={{ mt: 1, textDecoration: 'underline', fontWeight: 'bold' }}>
            નફા-નુકસાન ખાતું ({formatDate(appliedFromDate)} થી {formatDate(appliedToDate)})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            નાણાકીય વર્ષ: {activeYear}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Expense / Debit Side */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="error.main" sx={{ mb: 1, borderBottom: '2px solid' }}>
                ઉધાર બાજુ (વહીવટી & કામગીરી ખર્ચ)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>ખર્ચ ખાતું / વિગત</TableCell>
                      <TableCell align="right">રકમ (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((e, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{e.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {Number(e.amount).toLocaleString('gu-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'success.lighter' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ચોખ્ખો નફો (પાકા સરવૈયે લઈ ગયા)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {netProfit.toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>કુલ ઉધાર</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                        ₹ {totalIncome.toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Income / Credit Side */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="success.main" sx={{ mb: 1, borderBottom: '2px solid' }}>
                જમા બાજુ (પિયાત કામગીરી & પરોક્ષ આવક)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>આવક ખાતું / વિગત</TableCell>
                      <TableCell align="right">રકમ (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incomes.map((i, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{i.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {Number(i.amount).toLocaleString('gu-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>કુલ જમા</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                        ₹ {totalIncome.toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
}
