import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Button, TextField, InputAdornment, Chip, Divider,
  Grid, MenuItem
} from '@mui/material';
import {
  Print as PrintIcon,
  Search as SearchIcon,
  RestartAlt as RestartAltIcon,
  LocationCity as VillageIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export default function TarijPage() {
  const {
    members, piyatEntries, receipts, shares, villages,
    fetchMembers, fetchPiyatEntries, fetchReceipts, fetchShares, fetchVillages
  } = useData();
  const { activeYear, societyInfo } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [asOfDate, setAsOfDate] = useState('');

  // Applied filter state
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedVillage, setAppliedVillage] = useState('all');
  const [appliedAsOfDate, setAppliedAsOfDate] = useState('');

  useEffect(() => {
    fetchMembers(activeYear);
    fetchPiyatEntries(activeYear);
    fetchReceipts(activeYear);
    fetchShares(activeYear);
    fetchVillages();
  }, [fetchMembers, fetchPiyatEntries, fetchReceipts, fetchShares, fetchVillages, activeYear]);

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setAppliedVillage(selectedVillage);
    setAppliedAsOfDate(asOfDate);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedVillage('all');
    setAsOfDate('');
    setAppliedSearch('');
    setAppliedVillage('all');
    setAppliedAsOfDate('');
  };

  // Generate Tarij rows per member based on applied filters
  const tarijRows = useMemo(() => {
    return (members || []).map((m, index) => {
      const memShares = (shares || []).filter(
        (s) => (s.member_code || s.memberNo) === (m.member_code || m.memberNo) || s.member_id === m.id || s.memberId === m.id
      );
      const shareAmt = memShares.reduce((sum, s) => sum + (Number(s.total_amount || s.amount) || 0), 0) || (Number(m.share_balance) || 500);

      // Filter bills up to appliedAsOfDate
      const memBills = (piyatEntries || []).filter((p) => {
        const matchesMember = p.member_id === m.id || (p.member_no && p.member_no === m.member_no) || (p.member_code && p.member_code === m.member_code);
        if (!matchesMember) return false;
        if (!appliedAsOfDate) return true;
        const entryDate = p.entry_date || p.date;
        const dateStr = entryDate ? (typeof entryDate === 'string' ? entryDate.split('T')[0] : new Date(entryDate).toISOString().split('T')[0]) : '';
        return !dateStr || dateStr <= appliedAsOfDate;
      });
      const billAmt = memBills.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

      // Filter receipts up to appliedAsOfDate
      const memRcpt = (receipts || []).filter((r) => {
        const matchesMember = r.member_id === m.id || (r.member_no && r.member_no === m.member_no) || (r.member_code && r.member_code === m.member_code);
        if (!matchesMember) return false;
        if (!appliedAsOfDate) return true;
        const rDate = r.date;
        const dateStr = rDate ? (typeof rDate === 'string' ? rDate.split('T')[0] : new Date(rDate).toISOString().split('T')[0]) : '';
        return !dateStr || dateStr <= appliedAsOfDate;
      });
      const paidAmt = memRcpt.reduce((sum, r) => sum + Number(r.amount || 0), 0);

      const opBal = Number(m.opening_balance || 0);
      const closingBal = opBal + billAmt - paidAmt;

      return {
        sr: index + 1,
        code: m.member_code || m.memberNo,
        name: m.member_name_guj || m.name,
        village: m.village_name_guj || m.villageName || 'ભારૂંડી',
        block_no: m.block_no || m.blockNo || '૧૨/અ',
        share_amt: shareAmt,
        op_bal: opBal,
        bill_amt: billAmt,
        paid_amt: paidAmt,
        closing_bal: closingBal
      };
    });
  }, [members, shares, piyatEntries, receipts, appliedAsOfDate]);

  // Filter by village and search keyword
  const filtered = useMemo(() => {
    return tarijRows.filter((r) => {
      const matchesSearch =
        !appliedSearch.trim() ||
        r.name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.code?.toString().toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.village?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.block_no?.toString().toLowerCase().includes(appliedSearch.toLowerCase());

      const matchesVillage =
        appliedVillage === 'all' ||
        r.village?.toLowerCase() === appliedVillage.toLowerCase();

      return matchesSearch && matchesVillage;
    });
  }, [tarijRows, appliedSearch, appliedVillage]);

  // Totals computed on filtered results
  const totalShare = useMemo(() => filtered.reduce((s, r) => s + r.share_amt, 0), [filtered]);
  const totalOp = useMemo(() => filtered.reduce((s, r) => s + r.op_bal, 0), [filtered]);
  const totalBills = useMemo(() => filtered.reduce((s, r) => s + r.bill_amt, 0), [filtered]);
  const totalPaid = useMemo(() => filtered.reduce((s, r) => s + r.paid_amt, 0), [filtered]);
  const totalClosing = useMemo(() => filtered.reduce((s, r) => s + r.closing_bal, 0), [filtered]);

  // Build unique village list
  const villageOptions = useMemo(() => {
    const list = new Set();
    (villages || []).forEach((v) => { if (v.name) list.add(v.name); });
    (members || []).forEach((m) => {
      if (m.village_name_guj) list.add(m.village_name_guj);
      else if (m.villageName) list.add(m.villageName);
    });
    return Array.from(list);
  }, [villages, members]);

  return (
    <Box>
      <PageHeader
        title="વાર્ષિક તારીજ પત્રક (Tarij Statement)"
        subtitle={`સહકારી મંડળીના સભાસદવાર શેર, શરૂઆત બાકી, ચાલુ બિલિંગ અને વસૂલાતનું સંક્ષિપ્ત તારીજ પત્રક - વર્ષ: ${activeYear}${appliedAsOfDate ? ` (તારીખ: ${formatDate(appliedAsOfDate)} સુધી)` : ''}`}
        actionLabel="તારીજ પત્રક પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      {/* ફિલ્ટર બાર */}
      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="સભાસદનું નામ, કોડ અથવા બ્લોક..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="ગામ પસંદ કરો"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
            >
              <MenuItem value="all">તમામ ગામો</MenuItem>
              {villageOptions.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="આ તારીખ સુધીનું તારીજ (વૈકલ્પિક)"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              તારીજ શોધો
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              title="રીસેટ"
            >
              રીસેટ
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Chip
            label={`કુલ સભાસદો: ${filtered.length}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          {appliedVillage !== 'all' && (
            <Chip
              label={`ગામ: ${appliedVillage}`}
              color="info"
              size="small"
              onDelete={() => {
                setSelectedVillage('all');
                setAppliedVillage('all');
              }}
            />
          )}
          {appliedAsOfDate && (
            <Chip
              label={`તારીખ: ${formatDate(appliedAsOfDate)} સુધી`}
              color="warning"
              size="small"
              onDelete={() => {
                setAsOfDate('');
                setAppliedAsOfDate('');
              }}
            />
          )}
        </Box>
      </Paper>

      {/* પ્રિન્ટેબલ પત્રક */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">{societyInfo.name}</Typography>
          <Typography variant="subtitle1">{societyInfo.address} | રજી. નં: {societyInfo.reg_no}</Typography>
          <Typography variant="h6" sx={{ mt: 1, textDecoration: 'underline', fontWeight: 'bold' }}>
            વાર્ષિક સભાસદ તારીજ પત્રક ({activeYear})
            {appliedAsOfDate && ` - તારીખ: ${formatDate(appliedAsOfDate)} સુધી`}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={60}>અનુ.</TableCell>
                <TableCell width={90}>સભાસદ</TableCell>
                <TableCell>સભાસદનું પૂરું નામ</TableCell>
                <TableCell>ગામ</TableCell>
                <TableCell>બ્લોક નં</TableCell>
                <TableCell align="right">શેર મૂડી (₹)</TableCell>
                <TableCell align="right">શરૂઆત બાકી (₹)</TableCell>
                <TableCell align="right">ચાલુ બિલિંગ (₹)</TableCell>
                <TableCell align="right">વસૂલાત રસીદ (₹)</TableCell>
                <TableCell align="right">આખર બાકી લેણાં (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row, idx) => (
                <TableRow key={row.code || idx} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell>{row.village}</TableCell>
                  <TableCell>{row.block_no}</TableCell>
                  <TableCell align="right">{row.share_amt.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right">{row.op_bal.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right">{row.bill_amt.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{row.paid_amt.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: row.closing_bal > 0 ? 'error.main' : 'inherit' }}>
                    {row.closing_bal.toLocaleString('gu-IN')}
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ સભાસદ રેકોર્ડ મળ્યો નથી.
                  </TableCell>
                </TableRow>
              )}

              {filtered.length > 0 && (
                <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    કુલ સરવાળો (Grand Total)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹ {totalShare.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹ {totalOp.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹ {totalBills.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>₹ {totalPaid.toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1.05rem' }}>
                    ₹ {totalClosing.toLocaleString('gu-IN')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
}
