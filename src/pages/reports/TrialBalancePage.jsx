import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Card, CardContent, Grid, Button, Chip, Divider, CircularProgress,
  TextField
} from '@mui/material';
import {
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function TrialBalancePage() {
  const { generalAccounts, fetchGeneralAccounts, apiBase } = useData();
  const { activeYear, societyInfo } = useApp();
  const currentApiBase = apiBase || 'http://localhost:5000/api';

  const [loading, setLoading] = useState(false);
  const [trialRows, setTrialRows] = useState([]);
  const [summary, setSummary] = useState({ totalDebit: 0, totalCredit: 0, difference: 0, isTally: true });
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [appliedToDate, setAppliedToDate] = useState(new Date().toISOString().split('T')[0]);

  const loadTrialBalance = useCallback(async (targetDate) => {
    setLoading(true);
    try {
      const qUrl = targetDate
        ? `${currentApiBase}/reports/trial-balance?year=${encodeURIComponent(activeYear)}&to_date=${targetDate}`
        : `${currentApiBase}/reports/trial-balance?year=${encodeURIComponent(activeYear)}`;
      const r = await fetch(qUrl);
      const res = await r.json();
      if (res.success && res.data?.length > 0) {
        setTrialRows(res.data.map((d) => ({
          code: d.code,
          name: d.name,
          group: d.group_name || d.type || 'સામાન્ય',
          debit: Number(d.debit) || 0,
          credit: Number(d.credit) || 0
        })));
        if (res.summary) {
          setSummary({
            totalDebit: Number(res.summary.totalDebit) || 0,
            totalCredit: Number(res.summary.totalCredit) || 0,
            difference: Math.abs(Number(res.summary.difference) || 0),
            isTally: Boolean(res.summary.isTally)
          });
        }
      } else {
        // Fallback based on generalAccounts
        const fallback = (generalAccounts || []).map((a) => ({
          code: a.code,
          name: a.name,
          group: a.group_name || 'સામાન્ય',
          debit: Number(a.opening_debit) || 0,
          credit: Number(a.opening_credit) || 0
        }));
        setTrialRows(fallback);
        const tD = fallback.reduce((s, row) => s + row.debit, 0);
        const tC = fallback.reduce((s, row) => s + row.credit, 0);
        setSummary({ totalDebit: tD, totalCredit: tC, difference: Math.abs(tD - tC), isTally: tD === tC });
      }
    } catch (err) {
      console.warn('Trial balance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeYear, generalAccounts]);

  useEffect(() => {
    fetchGeneralAccounts();
    loadTrialBalance(appliedToDate);
  }, [fetchGeneralAccounts, loadTrialBalance, appliedToDate]);

  const handleFilter = () => {
    setAppliedToDate(toDate);
    loadTrialBalance(toDate);
  };

  const totalDebit = summary.totalDebit || trialRows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = summary.totalCredit || trialRows.reduce((s, r) => s + r.credit, 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isTally = diff === 0;

  return (
    <Box>
      <PageHeader
        title="કાચું સરવૈયું (Trial Balance)"
        subtitle={`સહકારી મંડળીના હિસાબોનું વાર્ષિક કાચું સરવૈયું - વર્ષ: ${activeYear}`}
        actionLabel="સરવૈયું પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      {/* Date Filter Bar */}
      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="તારીખ સુધીનું સરવૈયું (As of Date)"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={handleFilter}
              sx={{ height: 40, fontWeight: 700 }}
            >
              સરવૈયું મેળવો
            </Button>
          </Grid>
          <Grid item xs={12} md={5}>
            <Chip
              label={`તારીખ: ${formatDate(appliedToDate)} સુધીનું સરવૈયું દર્શાવાય છે`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Balance Indicator Banner */}
      <Grid container spacing={3} sx={{ mb: 3 }} className="no-print">
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">કુલ ઉધાર રકમ (Total Debit)</Typography>
              <Typography variant="h4" fontWeight="bold">₹ {totalDebit.toLocaleString('gu-IN')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">કુલ જમા રકમ (Total Credit)</Typography>
              <Typography variant="h4" fontWeight="bold">₹ {totalCredit.toLocaleString('gu-IN')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: isTally ? 'primary.light' : 'warning.light', color: isTally ? 'primary.contrastText' : 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">સ્થિતિ (Status)</Typography>
              <Typography variant="h5" fontWeight="bold">
                {isTally ? '✓ સરવૈયું સંતુલિત છે (Tally)' : `⚠ તફાવત: ₹ ${diff.toLocaleString('gu-IN')}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Printable Report Paper */}
      <Paper sx={{ p: 4, mb: 3 }} className="print-page">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">{societyInfo.name}</Typography>
          <Typography variant="subtitle1">{societyInfo.address} | રજી. નં: {societyInfo.reg_no}</Typography>
          <Typography variant="h6" sx={{ mt: 1, textDecoration: 'underline', fontWeight: 'bold' }}>
            કાચું સરવૈયું (વર્ષ: {activeYear} - તા. {formatDate(appliedToDate)} સુધીનું)
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell width={100}>ખાતા કોડ</TableCell>
                  <TableCell>જનરલ ખાતાનું નામ</TableCell>
                  <TableCell>ખાતા ગ્રુપ</TableCell>
                  <TableCell align="right" width={180}>ઉધાર સિલક (Debit ₹)</TableCell>
                  <TableCell align="right" width={180}>જમા સિલક (Credit ₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trialRows.map((row, idx) => (
                  <TableRow key={row.code || idx} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip size="small" label={row.group} variant="outlined" />
                      </span>
                      <span className="print-only">
                        {row.group}
                      </span>
                    </TableCell>
                    <TableCell align="right" sx={{ color: row.debit > 0 ? 'error.main' : 'inherit' }}>
                      {row.debit > 0 ? row.debit.toLocaleString('gu-IN') : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ color: row.credit > 0 ? 'success.main' : 'inherit' }}>
                      {row.credit > 0 ? row.credit.toLocaleString('gu-IN') : '-'}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                    કુલ સરવાળો (Total)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'error.main' }}>
                    ₹ {totalDebit.toLocaleString('gu-IN')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'success.main' }}>
                    ₹ {totalCredit.toLocaleString('gu-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
}
