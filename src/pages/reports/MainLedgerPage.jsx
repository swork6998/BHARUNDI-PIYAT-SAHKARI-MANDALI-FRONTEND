import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Typography, Card,
  CardContent, Divider, Chip
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

export default function MainLedgerPage() {
  const { generalAccounts, vouchers, receipts, fetchGeneralAccounts, fetchVouchers, fetchReceipts } = useData();
  const { activeYear, societyInfo } = useApp();

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const [appliedAccountId, setAppliedAccountId] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('2026-04-01');
  const [appliedToDate, setAppliedToDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchGeneralAccounts();
    fetchReceipts(activeYear);
    fetchVouchers(activeYear);
  }, [fetchGeneralAccounts, fetchReceipts, fetchVouchers, activeYear]);

  // Default first account if none selected
  useEffect(() => {
    if (generalAccounts && generalAccounts.length > 0 && !selectedAccountId) {
      const firstId = generalAccounts[0].id;
      setSelectedAccountId(firstId);
      setAppliedAccountId(firstId);
    }
  }, [generalAccounts, selectedAccountId]);

  const handleSearch = () => {
    setAppliedAccountId(selectedAccountId);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const handleResetToCurrentYear = () => {
    const start = '2026-04-01';
    const end = new Date().toISOString().split('T')[0];
    setFromDate(start);
    setToDate(end);
    setAppliedFromDate(start);
    setAppliedToDate(end);
  };

  const toDateString = (dVal) => {
    if (!dVal) return '';
    if (typeof dVal === 'string') return dVal.split('T')[0];
    try {
      return new Date(dVal).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const account = useMemo(() => {
    return (generalAccounts || []).find((a) => a.id === Number(appliedAccountId || selectedAccountId)) || generalAccounts[0];
  }, [generalAccounts, appliedAccountId, selectedAccountId]);

  // Calculate prior balance and filtered ledger entries
  const { ledgerEntries, totalDebit, totalCredit, closingBalance, priorBalance } = useMemo(() => {
    if (!account) {
      return { ledgerEntries: [], totalDebit: 0, totalCredit: 0, closingBalance: 0, priorBalance: 0 };
    }

    const isCashOrBank = account.name.includes('રોકડ') || account.name.includes('બેંક') || account.code === '101' || account.code === '102';

    // Transactions linked to this account
    const matchedVouchers = (vouchers || []).filter(
      (v) => v.debit_account === account.name || v.credit_account === account.name
    );

    // If Cash or Bank, cash receipts are debits to this account
    const matchedReceipts = isCashOrBank
      ? (receipts || []).map((r) => ({
          date: r.date,
          doc_no: r.receipt_no,
          narration: `પિયાત વસૂલાત - ${r.member_name || ''} (${r.narration || ''})`,
          debit: Number(r.amount || 0),
          credit: 0
        }))
      : [];

    const allMapped = [
      ...matchedVouchers.map((v) => ({
        date: v.date,
        doc_no: v.voucher_no,
        narration: v.narration || v.paid_to || 'વાઉચર ખર્ચ',
        debit: v.debit_account === account.name ? Number(v.amount || 0) : 0,
        credit: v.credit_account === account.name ? Number(v.amount || 0) : 0
      })),
      ...matchedReceipts
    ];

    // Initial base opening balance
    const baseOpeningDebit = Number(account.opening_debit || 0);
    const baseOpeningCredit = Number(account.opening_credit || 0);
    let netPrior = baseOpeningDebit - baseOpeningCredit;

    const inRange = [];

    allMapped.forEach((entry) => {
      const d = toDateString(entry.date);
      if (d && appliedFromDate && d < appliedFromDate) {
        netPrior += (entry.debit - entry.credit);
      } else if (!appliedToDate || (d && d <= appliedToDate)) {
        inRange.push({
          ...entry,
          date: d
        });
      }
    });

    // Sort chronologically
    inRange.sort((a, b) => (a.date > b.date ? 1 : -1));

    // Running balance starting with opening balance as of appliedFromDate
    let currentBal = netPrior;
    const finalEntries = [
      {
        date: appliedFromDate,
        doc_no: 'OP-BAL',
        narration: `શરૂઆતની સિલક (${formatDate(appliedFromDate)} મુજબ)`,
        debit: netPrior >= 0 ? netPrior : 0,
        credit: netPrior < 0 ? Math.abs(netPrior) : 0,
        balance: netPrior,
        isOpening: true
      },
      ...inRange.map((e) => {
        currentBal += (e.debit - e.credit);
        return {
          ...e,
          balance: currentBal
        };
      })
    ];

    const tDebit = finalEntries.reduce((s, e) => s + e.debit, 0);
    const tCredit = finalEntries.reduce((s, e) => s + e.credit, 0);
    const closeBal = currentBal;

    return {
      ledgerEntries: finalEntries,
      totalDebit: tDebit,
      totalCredit: tCredit,
      closingBalance: closeBal,
      priorBalance: netPrior
    };
  }, [account, vouchers, receipts, appliedFromDate, appliedToDate]);

  return (
    <Box>
      <PageHeader
        title="મુખ્ય ખાતાવહી (General Ledger)"
        subtitle="જનરલ ખાતાઓનું તારીખવાર વિગતવાર લેજર અને ચાલુ સિલક પત્રક"
        actionLabel="ખાતાવહી પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="જનરલ ખાતું પસંદ કરો"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              size="small"
            >
              {(generalAccounts || []).map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.code} - {a.name} ({a.group_name || 'સામાન્ય'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2.5}>
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
          <Grid item xs={12} sm={2.5}>
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
          <Grid item xs={12} sm={1.5}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ height: 40, fontWeight: 700 }}
            >
              શોધો
            </Button>
          </Grid>
          <Grid item xs={12} sm={1.5}>
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

        {/* Filter status chip */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`ખાતું: ${account?.name || '-'} (${account?.code || '-'})`}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`સમયગાળો: ${formatDate(appliedFromDate)} થી ${formatDate(appliedToDate)}`}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`કુલ વ્યવહારો: ${ledgerEntries.length - 1}`}
            color="info"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`આખર સિલક: ₹ ${Math.abs(closingBalance).toLocaleString('gu-IN')} ${closingBalance >= 0 ? '(ઉધાર)' : '(જમા)'}`}
            color={closingBalance >= 0 ? 'success' : 'warning'}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Paper>

      {/* Ledger Report Display */}
      <Paper sx={{ p: 4, mb: 3 }} className="print-page">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">{societyInfo.name}</Typography>
          <Typography variant="h6" color="primary.main" sx={{ mt: 1, fontWeight: 'bold' }}>
            ખાતાવહી: {account?.name} (કોડ: {account?.code})
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            ખાતા ગ્રુપ: {account?.group_name || 'સામાન્ય'} | સમયગાળો: {formatDate(appliedFromDate)} થી {formatDate(appliedToDate)} | નાણાકીય વર્ષ: {activeYear}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={110}>તારીખ</TableCell>
                <TableCell width={110}>દસ્તાવેજ નં</TableCell>
                <TableCell>વિગત / લખાણ (Narration)</TableCell>
                <TableCell align="right" width={140}>ઉધાર રકમ (₹)</TableCell>
                <TableCell align="right" width={140}>જમા રકમ (₹)</TableCell>
                <TableCell align="right" width={160}>બાકી સિલક (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerEntries.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={row.isOpening ? { bgcolor: '#f8fafc', fontStyle: 'italic' } : {}}
                >
                  <TableCell sx={row.isOpening ? { fontWeight: 700 } : {}}>{formatDate(row.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: row.isOpening ? 'text.secondary' : 'primary.main' }}>
                    {row.doc_no}
                  </TableCell>
                  <TableCell sx={row.isOpening ? { fontWeight: 600 } : {}}>{row.narration}</TableCell>
                  <TableCell align="right" sx={{ color: row.debit > 0 ? 'error.main' : 'inherit' }}>
                    {row.debit > 0 ? `₹ ${row.debit.toLocaleString('gu-IN')}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: row.credit > 0 ? 'success.main' : 'inherit' }}>
                    {row.credit > 0 ? `₹ ${row.credit.toLocaleString('gu-IN')}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ₹ {Math.abs(row.balance).toLocaleString('gu-IN')} {row.balance >= 0 ? '(ઉધાર)' : '(જમા)'}
                  </TableCell>
                </TableRow>
              ))}
              {ledgerEntries.length === 1 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    પસંદ કરેલ સમયગાળામાં કોઈ વધારાના વ્યવહારો થયેલા નથી.
                  </TableCell>
                </TableRow>
              )}
              <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  કુલ સરવાળો અને આખર સિલક
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ₹ {totalDebit.toLocaleString('gu-IN')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ₹ {totalCredit.toLocaleString('gu-IN')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.05rem' }}>
                  ₹ {Math.abs(closingBalance).toLocaleString('gu-IN')} {closingBalance >= 0 ? '(ઉધાર બાકી)' : '(જમા બાકી)'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
}
