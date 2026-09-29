import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Typography, Card,
  CardContent, Divider, Chip
} from '@mui/material';
import {
  Print as PrintIcon,
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function MemberLedgerPage() {
  const { members, piyatEntries, receipts, villages, fetchMembers, fetchPiyatEntries, fetchReceipts, fetchVillages } = useData();
  const { activeYear, societyInfo } = useApp();

  const [selectedVillageId, setSelectedVillageId] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const [appliedMemberId, setAppliedMemberId] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('2026-04-01');
  const [appliedToDate, setAppliedToDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchMembers(activeYear);
    fetchPiyatEntries(activeYear);
    fetchReceipts(activeYear);
    fetchVillages();
  }, [fetchMembers, fetchPiyatEntries, fetchReceipts, fetchVillages, activeYear]);

  // Filter members by selected village
  const filteredMemberList = useMemo(() => {
    if (!members) return [];
    if (selectedVillageId === 'all') return members;
    return members.filter((m) => m.village_id === Number(selectedVillageId) || m.villageId === Number(selectedVillageId));
  }, [members, selectedVillageId]);

  // Set default selected member
  useEffect(() => {
    if (filteredMemberList.length > 0 && (!selectedMemberId || !filteredMemberList.some((m) => m.id === Number(selectedMemberId)))) {
      const firstId = filteredMemberList[0].id;
      setSelectedMemberId(firstId);
      if (!appliedMemberId) {
        setAppliedMemberId(firstId);
      }
    }
  }, [filteredMemberList, selectedMemberId, appliedMemberId]);

  const handleSearch = () => {
    setAppliedMemberId(selectedMemberId);
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

  const member = useMemo(() => {
    const targetId = Number(appliedMemberId || selectedMemberId);
    return (members || []).find((m) => m.id === targetId) || members?.[0];
  }, [members, appliedMemberId, selectedMemberId]);

  // Calculate ledger for selected member with date boundary
  const { ledgerWithBalance, totalDebit, totalCredit, netDue, priorBalance } = useMemo(() => {
    if (!member) {
      return { ledgerWithBalance: [], totalDebit: 0, totalCredit: 0, netDue: 0, priorBalance: 0 };
    }

    const memberBills = (piyatEntries || [])
      .filter((p) => p.member_id === member.id || p.memberId === member.id || (p.member_no && p.member_no === member.member_no))
      .map((p) => ({
        date: toDateString(p.entry_date || p.bill_date || p.created_at),
        doc_no: p.bill_no || p.billNo || `P-${p.entry_no || p.id}`,
        description: `પિયાત બિલ: પાક ${p.crop_name_guj || p.cropName || 'ડાંગર'}, ${p.area_vigha || p.area || 0} વીઘા (${p.pani_count || p.paniCount || 1} પાણી)`,
        debit: Number(p.total_amount || p.totalAmount || 0),
        credit: 0
      }));

    const memberReceipts = (receipts || [])
      .filter((r) => r.member_id === member.id || (r.member_no && r.member_no === member.member_no))
      .map((r) => ({
        date: toDateString(r.date),
        doc_no: r.receipt_no,
        description: `રોકડ રસીદ ચૂકવણી (${r.narration || 'પિયાત વસૂલાત'})`,
        debit: 0,
        credit: Number(r.amount || 0)
      }));

    const allTx = [...memberBills, ...memberReceipts];

    // Initial base opening balance
    const baseOpening = Number(member.opening_balance || member.openingBalance || 0);
    let netPrior = baseOpening;

    const inRange = [];

    allTx.forEach((tx) => {
      if (tx.date && appliedFromDate && tx.date < appliedFromDate) {
        netPrior += (tx.debit - tx.credit);
      } else if (!appliedToDate || (tx.date && tx.date <= appliedToDate)) {
        inRange.push(tx);
      }
    });

    inRange.sort((a, b) => (a.date > b.date ? 1 : -1));

    let runningBalance = netPrior;
    const finalLedger = [
      {
        date: appliedFromDate,
        doc_no: 'શરૂઆત બાકી',
        description: `તારીખ ${formatDate(appliedFromDate)} સુધીની શરૂઆત બાકી આગળ લાવ્યા`,
        debit: netPrior > 0 ? netPrior : 0,
        credit: netPrior < 0 ? Math.abs(netPrior) : 0,
        balance: netPrior,
        isOpening: true
      },
      ...inRange.map((tx) => {
        runningBalance += (tx.debit - tx.credit);
        return {
          ...tx,
          balance: runningBalance
        };
      })
    ];

    const tDebit = finalLedger.reduce((s, e) => s + e.debit, 0);
    const tCredit = finalLedger.reduce((s, e) => s + e.credit, 0);

    return {
      ledgerWithBalance: finalLedger,
      totalDebit: tDebit,
      totalCredit: tCredit,
      netDue: runningBalance,
      priorBalance: netPrior
    };
  }, [member, piyatEntries, receipts, appliedFromDate, appliedToDate]);

  return (
    <Box>
      <PageHeader
        title="સભાસદ ખાતાવહી (Member Ledger)"
        subtitle="સભાસદવાર પિયાત આકારણી, બિલિંગ અને રોકડ વસૂલાતનું વ્યક્તિગત ખાતાવહી પત્રક"
        actionLabel="ખાતાવહી નકલ પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="ગામ પસંદ કરો"
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              size="small"
            >
              <MenuItem value="all">બધા ગામ</MenuItem>
              {(villages || []).map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3.5}>
            <TextField
              fullWidth
              select
              label="સભાસદ પસંદ કરો"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              size="small"
            >
              {filteredMemberList.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  ({m.member_code || m.memberNo}) {m.member_name_guj || m.name} - {m.village_name_guj || m.villageName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="date"
              label="તારીખથી (From)"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="date"
              label="તારીખ સુધી (To)"
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
              જુઓ
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`સભાસદ: (${member?.member_code || '-'}) ${member?.name || '-'}`}
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
            label={`કુલ વ્યવહારો: ${ledgerWithBalance.length - 1}`}
            color="info"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Button
            variant="text"
            size="small"
            onClick={handleResetToCurrentYear}
            sx={{ ml: 'auto' }}
          >
            ચાલુ નાણાકીય વર્ષ રીસેટ
          </Button>
        </Box>
      </Paper>

      {/* Member Details Header Card */}
      <Paper sx={{ p: 3, mb: 3 }} className="print-page">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7}>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              ({member?.member_code || member?.memberNo}) {member?.member_name_guj || member?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ગામ: <b>{member?.village_name_guj || member?.villageName || 'ભારૂંડી'}</b> | બ્લોક નં: <b>{member?.block_no || member?.blockNo || '૧૨/અ'}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              મોબાઈલ: {member?.mobile_no || member?.phone || '૯૮૨૫૦ ૧૨૩૪૫'} | કેનાલ: {member?.canal_name_guj || member?.canalName || 'મુખ્ય નહેર'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary">ચોખ્ખી લેણી બાકી (Net Due)</Typography>
            <Typography variant="h4" fontWeight="bold" color={netDue > 0 ? 'error.main' : 'success.main'}>
              ₹ {Math.abs(netDue).toLocaleString('gu-IN')} {netDue > 0 ? '(બાકી લેણાં)' : '(જમા બોલે છે)'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Statement Table */}
      <Paper sx={{ p: 4, mb: 3 }} className="print-page">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">{societyInfo.name}</Typography>
          <Typography variant="subtitle1">{societyInfo.address}</Typography>
          <Typography variant="h6" sx={{ mt: 1, textDecoration: 'underline', fontWeight: 'bold' }}>
            સભાસદ પિયાત ખાતાવહી પત્રક ({formatDate(appliedFromDate)} થી {formatDate(appliedToDate)})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            નાણાકીય વર્ષ: {activeYear}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={110}>તારીખ</TableCell>
                <TableCell width={120}>બિલ / રસીદ નં</TableCell>
                <TableCell>વિગત</TableCell>
                <TableCell align="right" width={140}>ઉધાર બિલ રકમ (₹)</TableCell>
                <TableCell align="right" width={140}>જમા વસૂલાત (₹)</TableCell>
                <TableCell align="right" width={150}>બાકી રકમ (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerWithBalance.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={row.isOpening ? { bgcolor: '#f8fafc', fontStyle: 'italic' } : {}}
                >
                  <TableCell sx={row.isOpening ? { fontWeight: 700 } : {}}>{formatDate(row.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: row.isOpening ? 'text.secondary' : 'primary.main' }}>
                    {row.doc_no}
                  </TableCell>
                  <TableCell sx={row.isOpening ? { fontWeight: 600 } : {}}>{row.description}</TableCell>
                  <TableCell align="right" sx={{ color: row.debit > 0 ? 'error.main' : 'inherit' }}>
                    {row.debit > 0 ? `₹ ${row.debit.toLocaleString('gu-IN')}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: row.credit > 0 ? 'success.main' : 'inherit' }}>
                    {row.credit > 0 ? `₹ ${row.credit.toLocaleString('gu-IN')}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ₹ {Math.abs(row.balance).toLocaleString('gu-IN')} {row.balance >= 0 ? '(બાકી)' : '(જમા)'}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  કુલ સરવાળો
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ₹ {totalDebit.toLocaleString('gu-IN')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ₹ {totalCredit.toLocaleString('gu-IN')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.05rem' }}>
                  ₹ {Math.abs(netDue).toLocaleString('gu-IN')} {netDue >= 0 ? '(બાકી)' : '(જમા)'}
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
