import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  TablePagination,
  Paper,
  MenuItem,
  Chip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

const PiyatReportsPage = () => {
  const { piyatEntries, crops, villages, seasons, fetchPiyatEntries, fetchCrops, fetchVillages, fetchSeasons } = useData();
  const { activeYear, activeSeason, societyInfo } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

  // Date range and module filters
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');

  // Applied filter state
  const [appliedFromDate, setAppliedFromDate] = useState('2026-04-01');
  const [appliedToDate, setAppliedToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appliedSeason, setAppliedSeason] = useState('all');
  const [appliedVillage, setAppliedVillage] = useState('all');

  useEffect(() => {
    fetchPiyatEntries(activeYear);
    fetchCrops();
    fetchVillages();
    if (fetchSeasons) fetchSeasons();
  }, [fetchPiyatEntries, fetchCrops, fetchVillages, fetchSeasons, activeYear]);

  const handleSearch = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedSeason(selectedSeason);
    setAppliedVillage(selectedVillage);
    setPage(0);
  };

  const handleReset = () => {
    setFromDate('2026-04-01');
    const today = new Date().toISOString().split('T')[0];
    setToDate(today);
    setSelectedSeason('all');
    setSelectedVillage('all');
    setAppliedFromDate('2026-04-01');
    setAppliedToDate(today);
    setAppliedSeason('all');
    setAppliedVillage('all');
    setSearchTerm('');
    setPage(0);
  };

  // Filtered piyat entries based on applied criteria
  const filteredEntries = useMemo(() => {
    return (piyatEntries || []).filter((p) => {
      // Date range filter
      const rawDate = p.entry_date || p.date;
      if (rawDate) {
        const dStr = typeof rawDate === 'string' ? rawDate.split('T')[0] : new Date(rawDate).toISOString().split('T')[0];
        if (appliedFromDate && dStr < appliedFromDate) return false;
        if (appliedToDate && dStr > appliedToDate) return false;
      }

      // Season filter
      if (appliedSeason !== 'all') {
        const sName = p.season_name || p.seasonName || p.season || '';
        if (!sName.toLowerCase().includes(appliedSeason.toLowerCase())) return false;
      }

      // Village filter
      if (appliedVillage !== 'all') {
        const vName = p.villageName || p.village_name || p.village_name_guj || '';
        if (vName.toLowerCase() !== appliedVillage.toLowerCase()) return false;
      }

      return true;
    });
  }, [piyatEntries, appliedFromDate, appliedToDate, appliedSeason, appliedVillage]);

  // ૧. પાક વાર સારાંશ ગણતરી (Filtered)
  const cropSummary = useMemo(() => {
    return (crops || []).map((c) => {
      const matched = filteredEntries.filter((p) => p.cropId === c.id || p.crop_id === c.id || p.crop_name === c.name || p.cropName === c.name);
      const count = matched.length;
      const totalArea = matched.reduce((s, p) => s + Number(p.area || p.area_vigha || 0), 0);
      const totalPani = matched.reduce((s, p) => s + Number(p.paniCount || p.pani_count || 0), 0);
      const baseAmt = matched.reduce((s, p) => s + Number(p.baseAmount || p.base_amount || 0), 0);
      const cess = matched.reduce((s, p) => s + Number(p.cess20 || p.cess_20 || 0), 0);
      const totalAmt = matched.reduce((s, p) => s + Number(p.totalAmount || p.total_amount || 0), 0);

      return {
        cropName: c.name,
        count,
        totalArea,
        totalPani,
        baseAmt,
        cess,
        totalAmt,
      };
    });
  }, [crops, filteredEntries]);

  // ૨. ગામ વાર સારાંશ (Filtered)
  const villageSummary = useMemo(() => {
    return (villages || []).map((v) => {
      const matched = filteredEntries.filter((p) =>
        p.villageName === v.name || p.village_name === v.name || p.village_name_guj === v.name || p.village_id === v.id || p.villageId === v.id
      );
      const count = matched.length;
      const totalArea = matched.reduce((s, p) => s + Number(p.area || p.area_vigha || 0), 0);
      const totalAmt = matched.reduce((s, p) => s + Number(p.totalAmount || p.total_amount || 0), 0);
      return {
        villageName: v.name,
        count,
        totalArea,
        totalAmt,
      };
    });
  }, [villages, filteredEntries]);

  // ૩. બાકી વસૂલાત ફિલ્ટર અને પેજીનેશન
  const filteredPending = useMemo(() => {
    return filteredEntries
      .filter((p) => p.status !== 'ચૂકવાઈ ગયું')
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          (p.billNo || p.bill_no || '').toLowerCase().includes(q) ||
          (p.memberNo || p.member_no || p.member_code || '').toLowerCase().includes(q) ||
          (p.memberName || p.member_name || p.member_name_guj || '').toLowerCase().includes(q) ||
          (p.villageName || p.village_name || p.village_name_guj || '').toLowerCase().includes(q)
        );
      });
  }, [filteredEntries, searchTerm]);

  const pagedPending = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPending.slice(start, start + rowsPerPage);
  }, [filteredPending, page, rowsPerPage]);

  const grandTotalArea = useMemo(() => cropSummary.reduce((s, c) => s + c.totalArea, 0), [cropSummary]);
  const grandTotalAmt = useMemo(() => cropSummary.reduce((s, c) => s + c.totalAmt, 0), [cropSummary]);

  return (
    <Box>
      <PageHeader
        title="પિયત કામગીરી અહેવાલો (સારાંશ પત્રક)"
        subtitle={`વર્ષ: ${activeYear} | સમયગાળો: ${formatDate(appliedFromDate)} થી ${formatDate(appliedToDate)} | પાક વાર અને ગામ વાર પિયત વિશ્લેષણ`}
        breadcrumb="પિયત / પિયત અહેવાલો"
        icon={<AssessmentIcon sx={{ fontSize: 28 }} />}
        actionLabel="અહેવાલ પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      {/* સર્ચ & ફિલ્ટર કાર્ડ */}
      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="તારીખથી (From Date)"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="તારીખ સુધી (To Date)"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="સિંચાઈ ઋતુ"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <MenuItem value="all">તમામ ઋતુઓ</MenuItem>
              {(seasons || []).map((s) => (
                <MenuItem key={s.id || s.name} value={s.name}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="ગામ ફિલ્ટર"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
            >
              <MenuItem value="all">તમામ ગામો</MenuItem>
              {(villages || []).map((v) => (
                <MenuItem key={v.id || v.name} value={v.name}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              અહેવાલ શોધો
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              title="રીસેટ કરો"
            >
              રીસેટ
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`કુલ પિયત એન્ટ્રીઓ: ${filteredEntries.length}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          <Chip
            label={`કુલ વિસ્તાર: ${grandTotalArea.toFixed(1)} વીઘા`}
            color="info"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`કુલ આકારણી રકમ: ₹ ${grandTotalAmt.toLocaleString('gu-IN')}`}
            color="success"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          {appliedSeason !== 'all' && (
            <Chip
              label={`ઋતુ: ${appliedSeason}`}
              color="secondary"
              size="small"
              onDelete={() => {
                setSelectedSeason('all');
                setAppliedSeason('all');
              }}
            />
          )}
          {appliedVillage !== 'all' && (
            <Chip
              label={`ગામ: ${appliedVillage}`}
              color="default"
              size="small"
              onDelete={() => {
                setSelectedVillage('all');
                setAppliedVillage('all');
              }}
            />
          )}
        </Box>
      </Paper>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }} className="no-print">
          <Tabs
            value={activeTab}
            onChange={(e, val) => { setActiveTab(val); setPage(0); }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="૧. પાક વાર પિયત સારાંશ" sx={{ fontWeight: 600 }} />
            <Tab label="૨. ગામ વાર પિયત સારાંશ" sx={{ fontWeight: 600 }} />
            <Tab label="૩. બાકી પિયત વસૂલાત યાદી" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* ટેબ ૧: પાક વાર સારાંશ */}
          {activeTab === 0 && (
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>ક્રમ</TableCell>
                  <TableCell>પાકનું નામ</TableCell>
                  <TableCell align="right">કુલ એન્ટ્રીઓ</TableCell>
                  <TableCell align="right">કુલ વિસ્તાર (વીઘા)</TableCell>
                  <TableCell align="right">કુલ પાણી ફેરી</TableCell>
                  <TableCell align="right">મૂળ પાણી રકમ (₹)</TableCell>
                  <TableCell align="right">૨૦% સેસ રકમ (₹)</TableCell>
                  <TableCell align="right">કુલ આકારણી રકમ (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cropSummary.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.cropName}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0288D1' }}>
                      {item.totalArea.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">{item.totalPani}</TableCell>
                    <TableCell align="right">₹ {item.baseAmt.toLocaleString('gu-IN')}</TableCell>
                    <TableCell align="right" sx={{ color: '#dc2626' }}>₹ {item.cess.toLocaleString('gu-IN')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#00695C' }}>
                      ₹ {item.totalAmt.toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>કુલ સરવાળો</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0288D1' }}>{grandTotalArea.toFixed(1)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{cropSummary.reduce((s, c) => s + c.totalPani, 0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹ {cropSummary.reduce((s, c) => s + c.baseAmt, 0).toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#dc2626' }}>₹ {cropSummary.reduce((s, c) => s + c.cess, 0).toLocaleString('gu-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#00695C' }}>
                    ₹ {grandTotalAmt.toLocaleString('gu-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {/* ટેબ ૨: ગામ વાર સારાંશ */}
          {activeTab === 1 && (
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>ક્રમ</TableCell>
                  <TableCell>ગામનું નામ</TableCell>
                  <TableCell align="right">પિયત એન્ટ્રી સંખ્યા</TableCell>
                  <TableCell align="right">સિંચાઈ વિસ્તાર (વીઘા)</TableCell>
                  <TableCell align="right">કુલ બિલિંગ રકમ (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {villageSummary.map((v, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{v.villageName}</TableCell>
                    <TableCell align="right">{v.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{v.totalArea.toFixed(1)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#00695C' }}>
                      ₹ {v.totalAmt.toLocaleString('gu-IN')}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ borderTop: '2px solid #333', bgcolor: 'action.hover' }}>
                  <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>કુલ સરવાળો</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{villageSummary.reduce((s, v) => s + v.count, 0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{villageSummary.reduce((s, v) => s + v.totalArea, 0).toFixed(1)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#00695C' }}>
                    ₹ {villageSummary.reduce((s, v) => s + v.totalAmt, 0).toLocaleString('gu-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {/* ટેબ ૩: બાકી વસૂલાત યાદી */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }} className="no-print">
                <TextField
                  placeholder="ખેડૂતનું નામ, બિલ નં, સભાસદ નં અથવા ગામ શોધો..."
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
              </Box>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>બિલ નં</TableCell>
                    <TableCell>સભાસદ નં</TableCell>
                    <TableCell>ખેડૂતનું નામ</TableCell>
                    <TableCell>ગામ</TableCell>
                    <TableCell align="right">કુલ બિલ રકમ (₹)</TableCell>
                    <TableCell align="right">ભરેલ રકમ (₹)</TableCell>
                    <TableCell align="right">બાકી વસૂલાત રકમ (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedPending.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{p.billNo || p.bill_no || '-'}</TableCell>
                      <TableCell>{p.memberNo || p.member_no || p.member_code}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.memberName || p.member_name || p.member_name_guj}</TableCell>
                      <TableCell>{p.villageName || p.village_name || p.village_name_guj}</TableCell>
                      <TableCell align="right">₹ {Number(p.totalAmount || p.total_amount || 0).toLocaleString('gu-IN')}</TableCell>
                      <TableCell align="right" sx={{ color: '#16a34a' }}>₹ {Number(p.paidAmount || p.paid_amount || 0).toLocaleString('gu-IN')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#dc2626' }}>
                        ₹ {(Number(p.totalAmount || p.total_amount || 0) - Number(p.paidAmount || p.paid_amount || 0)).toLocaleString('gu-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        કોઈ બાકી વસૂલાત રેકોર્ડ મળ્યો નથી.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredPending.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="પ્રતિ પેજ બિલો:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
                className="no-print"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
};

export default PiyatReportsPage;
