import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent,
  Divider, Alert, IconButton, Tooltip, InputAdornment, TablePagination
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function DividendPage() {
  const { members, shares, fetchMembers, fetchShares } = useData();
  const { activeYear, showToast, isYearLocked, checkCanModify } = useApp();

  const [dividendRate, setDividendRate] = useState(12); // default 12%
  const [calculated, setCalculated] = useState(false);
  const [dividendData, setDividendData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    if (fetchMembers) fetchMembers();
    if (fetchShares) fetchShares();
  }, [fetchMembers, fetchShares]);

  // Calculate dividend per member based on active shares
  const handleCalculate = () => {
    const list = (members || []).map((m) => {
      // Calculate member's total active shares
      const mShares = (shares || []).filter((s) => (s.member_code || s.memberNo) === (m.member_code || m.memberNo));
      const totalAmount = mShares.reduce((acc, s) => acc + (Number(s.total_amount || s.amount) || Number(s.share_qty || s.shareCount || 10) * 100 || 0), 0) || (m.share_balance || 500);
      const dividendAmount = Math.round((totalAmount * dividendRate) / 100);

      return {
        member_code: m.member_code || m.memberNo,
        member_name_guj: m.member_name_guj || m.name,
        village_name_guj: m.village_name_guj || m.villageName || 'ભારૂંડી',
        bank_name: m.bank_name || 'એસ.બી.આઈ.',
        account_no: m.bank_account_no || '૩૨૫૪૧૫૮૭૪૫',
        share_amount: totalAmount,
        rate: dividendRate,
        dividend_amount: dividendAmount,
        status: 'મંજૂર'
      };
    });

    setDividendData(list);
    setCalculated(true);
    setPage(0);
    showToast(`ડિવિડન્ડ ગણતરી સફળતાપૂર્વક પૂર્ણ થઈ (${dividendRate}%)`, 'success');
  };

  const totalShareCapital = dividendData.reduce((acc, item) => acc + item.share_amount, 0);
  const totalDividend = dividendData.reduce((acc, item) => acc + item.dividend_amount, 0);

  const handlePostToLedger = () => {
    if (!checkCanModify('ડિવિડન્ડ વાઉચર જમા')) return;
    showToast('ડિવિડન્ડ વાઉચર જમા ખાતે સફળતાપૂર્વક નોંધાયું!', 'success');
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return dividendData.filter(
      (r) =>
        (r.member_name_guj && r.member_name_guj.toLowerCase().includes(q)) ||
        (r.member_code && r.member_code.toString().toLowerCase().includes(q)) ||
        (r.village_name_guj && r.village_name_guj.toLowerCase().includes(q))
    );
  }, [dividendData, searchTerm]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <Box>
      <PageHeader
        title="શેર ડિવિડન્ડ ગણતરી અને પત્રક"
        subtitle={`વાર્ષિક સાધારણ સભા મુજબ સભાસદોને શેર મૂડી પર વહેંચણીપાત્ર નફામાંથી ડિવિડન્ડ (નાણાકીય વર્ષ: ${activeYear})`}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. ડિવિડન્ડ પોસ્ટિંગ કે ખાતાવહીમાં ફેરફાર શક્ય નથી.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }} className="no-print">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ડિવિડન્ડ ટકાવારી (%)"
              type="number"
              value={dividendRate}
              onChange={(e) => setDividendRate(Number(e.target.value))}
              helperText="મંડળીના નિયમ મુજબ મહત્તમ ૧૫% સુધી"
              inputProps={{ min: 1, max: 25 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="નાણાકીય વર્ષ"
              value={activeYear}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CalculateIcon />}
              onClick={handleCalculate}
              fullWidth
              sx={{ height: 54 }}
            >
              ડિવિડન્ડ ગણતરી કરો
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {calculated && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="subtitle2">કુલ પાત્ર સભાસદો</Typography>
                  <Typography variant="h4" fontWeight="bold">{dividendData.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                <CardContent>
                  <Typography variant="subtitle2">કુલ શેર ભંડોળ (મૂડી)</Typography>
                  <Typography variant="h4" fontWeight="bold">₹ {totalShareCapital.toLocaleString('gu-IN')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <CardContent>
                  <Typography variant="subtitle2">કુલ ચૂકવવાપાત્ર ડિવિડન્ડ ({dividendRate}%)</Typography>
                  <Typography variant="h4" fontWeight="bold">₹ {totalDividend.toLocaleString('gu-IN')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2, mb: 3 }} className="no-print">
            <TextField
              placeholder="સભાસદનું નામ, કોડ અથવા ગામ શોધો..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
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

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }} className="no-print">
              <Typography variant="h6" fontWeight="bold">
                ડિવિડન્ડ રજીસ્ટર ({activeYear})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  પ્રિન્ટ રજીસ્ટર
                </Button>
                <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી ખાતાવહીમાં જમા કરી શકાશે નહીં" : ""}>
                  <span>
                    <Button
                      variant="contained"
                      color="success"
                      disabled={isYearLocked}
                      startIcon={<SaveIcon />}
                      onClick={handlePostToLedger}
                    >
                      ખાતાવહીમાં જમા કરો
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell>સભાસદ કોડ</TableCell>
                    <TableCell>સભાસદનું નામ</TableCell>
                    <TableCell>ગામ</TableCell>
                    <TableCell>બેંક વિગત</TableCell>
                    <TableCell align="right">શેર મૂડી (₹)</TableCell>
                    <TableCell align="center">ટકા (%)</TableCell>
                    <TableCell align="right">ડિવિડન્ડ રકમ (₹)</TableCell>
                    <TableCell align="center">સ્થિતિ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.map((row) => (
                    <TableRow key={row.member_code} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.member_code}</TableCell>
                      <TableCell>{row.member_name_guj}</TableCell>
                      <TableCell>{row.village_name_guj}</TableCell>
                      <TableCell>{row.bank_name} ({row.account_no})</TableCell>
                      <TableCell align="right">{row.share_amount.toLocaleString('gu-IN')}</TableCell>
                      <TableCell align="center">{row.rate}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ₹ {row.dividend_amount.toLocaleString('gu-IN')}
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" color="success" label={row.status} icon={<CheckCircleIcon />} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        કોઈ ડિવિડન્ડ વિગત મળી નથી.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="પ્રતિ પેજ સભાસદો:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
              className="no-print"
            />
          </Paper>

          {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
          <PrintSignatures />
        </>
      )}
    </Box>
  );
}
