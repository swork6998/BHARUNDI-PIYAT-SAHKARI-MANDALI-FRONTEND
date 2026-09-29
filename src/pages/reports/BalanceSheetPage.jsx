import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Grid, Button, Divider, Card, CardContent, CircularProgress,
  TextField, Chip
} from '@mui/material';
import { Print as PrintIcon, CheckCircle as CheckCircleIcon, Search as SearchIcon, Today as TodayIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export default function BalanceSheetPage() {
  const { activeYear, societyInfo } = useApp();

  const [loading, setLoading] = useState(false);
  const [liabilities, setLiabilities] = useState([]);
  const [assets, setAssets] = useState([]);
  const [totals, setTotals] = useState({ totalLiabilities: 0, totalAssets: 0 });

  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appliedToDate, setAppliedToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchBalanceSheet = useCallback((cutoffDate) => {
    setLoading(true);
    const dateParam = cutoffDate !== undefined ? cutoffDate : appliedToDate;
    let url = `http://localhost:5000/api/reports/balance-sheet?year=${encodeURIComponent(activeYear)}`;
    if (dateParam) {
      url += `&to_date=${dateParam}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setLiabilities(res.liabilities || []);
          setAssets(res.assets || []);
          setTotals({
            totalLiabilities: Number(res.totalLiabilities) || 0,
            totalAssets: Number(res.totalAssets) || 0
          });
        }
      })
      .catch((err) => console.warn('Balance Sheet fetch error:', err))
      .finally(() => setLoading(false));
  }, [activeYear, appliedToDate]);

  useEffect(() => {
    fetchBalanceSheet(appliedToDate);
  }, [fetchBalanceSheet, appliedToDate]);

  const handleSearch = () => {
    setAppliedToDate(toDate);
    fetchBalanceSheet(toDate);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setToDate(today);
    setAppliedToDate(today);
    fetchBalanceSheet(today);
  };

  const totalLiabilities = totals.totalLiabilities;
  const totalAssets = totals.totalAssets;
  const isTally = totalLiabilities === totalAssets;

  return (
    <Box>
      <PageHeader
        title="પાકું સરવૈયું (Balance Sheet)"
        subtitle={`સહકારી મંડળીની નાણાકીય સ્થિતિ દર્શાવતું પાકું સરવૈયું - વર્ષ: ${activeYear} (તારીખ: ${formatDate(appliedToDate)} સુધી)`}
        actionLabel="પાકું સરવૈયું પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      {/* ફિલ્ટર કાર્ડ */}
      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="તારીખ સુધીનું પાકું સરવૈયું (As of Date)"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={7} md={5} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ minWidth: 150 }}
            >
              સરવૈયું મેળવો
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<TodayIcon />}
              onClick={handleSetToday}
            >
              આજ સુધી
            </Button>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            {isTally && (
              <Chip
                icon={<CheckCircleIcon />}
                label="કુલ મેળ બેસે છે (Balanced)"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">{societyInfo.name}</Typography>
          <Typography variant="subtitle1">{societyInfo.address} | રજી. નં: {societyInfo.reg_no}</Typography>
          <Typography variant="h6" sx={{ mt: 1, textDecoration: 'underline', fontWeight: 'bold' }}>
            પાકું સરવૈયું (નાણાકીય વર્ષ: {activeYear} | તારીખ {formatDate(appliedToDate)} સુધીની સ્થિતિ)
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Liabilities & Capital */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1, borderBottom: '2px solid' }}>
                દેવા અને જવાબદારીઓ (મૂડી-દેવા બાજુ)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>જવાબદારી વિગત</TableCell>
                      <TableCell align="right">રકમ (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liabilities.map((l, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{l.name}</TableCell>
                        <TableCell align="right">{Number(l.amount).toLocaleString('gu-IN')}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'background.default' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                        કુલ મૂડી અને દેવા
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'primary.main' }}>
                        ₹ {totalLiabilities.toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Assets */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="secondary.main" sx={{ mb: 1, borderBottom: '2px solid' }}>
                મિલકતો અને લેણાં (મિલકત બાજુ)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>મિલકત વિગત</TableCell>
                      <TableCell align="right">રકમ (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((a, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell align="right">{Number(a.amount).toLocaleString('gu-IN')}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'background.default' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                        કુલ મિલકતો અને લેણાં
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'secondary.main' }}>
                        ₹ {totalAssets.toLocaleString('gu-IN')}
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
