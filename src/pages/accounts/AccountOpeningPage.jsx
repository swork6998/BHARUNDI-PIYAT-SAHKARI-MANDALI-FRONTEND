import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Typography, Grid, Card, CardContent,
  Alert, Chip, InputAdornment, Tooltip, TablePagination, CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function AccountOpeningPage() {
  const { fetchGeneralAccounts, updateGeneralAccount } = useData();
  const { activeYear, showToast, isYearLocked, checkCanModify } = useApp();

  const [balances, setBalances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGeneralAccounts({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setBalances(
          res.data.map((a) => ({
            id: a.id,
            code: a.code,
            name: a.name,
            group_name: a.group_name || 'સામાન્ય',
            debit: Number(a.opening_debit) || 0,
            credit: Number(a.opening_credit) || 0
          }))
        );
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching general accounts for opening:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchGeneralAccounts, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDebitChange = (id, val) => {
    if (isYearLocked) return;
    setBalances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, debit: Number(val) || 0 } : item))
    );
  };

  const handleCreditChange = (id, val) => {
    if (isYearLocked) return;
    setBalances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, credit: Number(val) || 0 } : item))
    );
  };

  const totalDebit = balances.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = balances.reduce((sum, item) => sum + item.credit, 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff === 0;

  const handleSaveAll = async () => {
    if (!checkCanModify('શરૂઆત બાકી સાચવો')) return;
    try {
      for (const item of balances) {
        await updateGeneralAccount(item.id, {
          opening_debit: item.debit,
          opening_credit: item.credit
        });
      }
      showToast('આ પેજના ખાતાઓની શરૂઆત બાકી સફળતાપૂર્વક સાચવવામાં આવી!', 'success');
      loadData();
    } catch (e) {
      showToast('ભૂલ: ' + e.message, 'error');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="ખાતા શરૂઆત બાકી માસ્ટર (FM000)"
        subtitle={`નાણાકીય વર્ષ ${activeYear} માટેના જનરલ અને પેટા ખાતાઓની શરૂઆત ઉધાર / જમા બાકીઓ`}
        actionLabel={isYearLocked ? undefined : "શરૂઆત બાકી સાચવો"}
        actionIcon={<SaveIcon />}
        onAction={handleSaveAll}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. શરૂઆત બાકીમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">ચાલુ પેજ કુલ શરૂઆત ઉધાર (Debit)</Typography>
              <Typography variant="h4" fontWeight="bold">₹ {totalDebit.toLocaleString('gu-IN')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">ચાલુ પેજ કુલ શરૂઆત જમા (Credit)</Typography>
              <Typography variant="h4" fontWeight="bold">₹ {totalCredit.toLocaleString('gu-IN')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: isBalanced ? 'info.light' : 'warning.light', color: isBalanced ? 'info.contrastText' : 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">તફાવત (Difference)</Typography>
              <Typography variant="h4" fontWeight="bold">₹ {diff.toLocaleString('gu-IN')}</Typography>
              <Typography variant="caption">{isBalanced ? '✓ સરવૈયું સંતુલિત છે' : '⚠ ઉધાર અને જમા સમાન હોવા જોઈએ'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="ખાતાનું નામ અથવા કોડ શોધો..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={100}>ખાતા કોડ</TableCell>
                <TableCell>જનરલ ખાતાનું નામ</TableCell>
                <TableCell>ખાતા ગ્રુપ</TableCell>
                <TableCell width={200} align="right">શરૂઆત ઉધાર (₹)</TableCell>
                <TableCell width={200} align="right">શરૂઆત જમા (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ ખાતું મળ્યું નથી.
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {item.code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip size="small" label={item.group_name} variant="outlined" />
                      </span>
                      <span className="print-only">
                        {item.group_name}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="no-print">
                        <TextField
                          type="number"
                          size="small"
                          disabled={isYearLocked}
                          value={item.debit}
                          onChange={(e) => handleDebitChange(item.id, e.target.value)}
                          sx={{ width: 170 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        {Number(item.debit) ? `₹ ${Number(item.debit).toLocaleString('gu-IN')}` : '-'}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="no-print">
                        <TextField
                          type="number"
                          size="small"
                          disabled={isYearLocked}
                          value={item.credit}
                          onChange={(e) => handleCreditChange(item.id, e.target.value)}
                          sx={{ width: 170 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        {Number(item.credit) ? `₹ ${Number(item.credit).toLocaleString('gu-IN')}` : '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
          labelRowsPerPage="પ્રતિ પેજ ખાતાઓ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
}
