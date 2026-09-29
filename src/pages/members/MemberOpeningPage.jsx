import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Tooltip,
  TablePagination,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const MemberOpeningPage = () => {
  const { updateMember, fetchMembers, villages, fetchVillages } = useData();
  const { showToast, showNotification, activeYear, isYearLocked } = useApp();
  const notify = showToast || showNotification;

  const [balances, setBalances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMembers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        village_id: selectedVillage
      });
      if (res && res.data) {
        setBalances(
          res.data.map((m) => ({
            id: m.id,
            memberNo: m.memberNo || m.member_code,
            name: m.name || m.member_name_guj,
            villageName: m.villageName || m.village_name_guj || 'ભારૂંડી',
            openingBalance: m.openingBalance ?? m.opening_balance ?? 0,
            balanceType: m.balanceType || m.balance_type || 'જમા',
          }))
        );
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error loading member opening balances:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchMembers, page, rowsPerPage, searchTerm, selectedVillage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBalanceChange = (id, field, value) => {
    if (isYearLocked) return;
    setBalances((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSaveAll = async () => {
    if (isYearLocked) {
      if (notify) notify(`પાછલું વર્ષ (${activeYear}) લૉક હોવાથી શરૂઆત બાકી સાચવી શકાશે નહીં.`, 'warning');
      return;
    }
    try {
      for (const b of balances) {
        if (updateMember) {
          await updateMember(b.id, {
            openingBalance: Number(b.openingBalance),
            balanceType: b.balanceType,
          });
        }
      }
      if (notify) notify('સભાસદોની શરૂઆત બાકી સફળતાપૂર્વક સાચવવામાં આવી!', 'success');
    } catch (e) {
      if (notify) notify('બાકી સાચવવામાં ક્ષતિ આવી!', 'error');
    }
  };

  const totalDebit = balances
    .filter((b) => b.balanceType === 'ઉધાર')
    .reduce((sum, b) => sum + Number(b.openingBalance), 0);

  const totalCredit = balances
    .filter((b) => b.balanceType === 'જમા')
    .reduce((sum, b) => sum + Number(b.openingBalance), 0);

  return (
    <Box>
      <PageHeader
        title="સભાસદ શરૂઆત બાકી વ્યવસ્થા (Opening Balances)"
        subtitle={`વર્ષ ${activeYear} ની શરૂઆતમાં સભાસદોની લેણી / એડવાન્સ જમા બાકીની નોંધ`}
        breadcrumb="સભાસદ / શરૂઆત બાકી"
        icon={<AccountBalanceWalletIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી બાકી સાચવી શકાશે નહીં.` : ''}>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={isYearLocked}
                onClick={handleSaveAll}
              >
                આ પેજની બાકી સાચવો
              </Button>
            </span>
          </Tooltip>
        }
      />

      {/* સારાંશ કાર્ડ */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }} className="no-print">
        <Card sx={{ flex: 1, bgcolor: '#fef2f2', borderLeft: '5px solid #dc2626' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ચાલુ પેજ શરૂઆત ઉધાર (ખેડૂતો પાસેથી લેણી રકમ):
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
              ₹ {totalDebit.toLocaleString('gu-IN')}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, bgcolor: '#f0fdf4', borderLeft: '5px solid #16a34a' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ચાલુ પેજ શરૂઆત જમા (ખેડૂતોની એડવાન્સ જમા રકમ):
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
              ₹ {totalCredit.toLocaleString('gu-IN')}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* સર્ચ અને ફિલ્ટર */}
      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="સભાસદ નામ અથવા સભાસદ નંબર શોધો..."
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ flexGrow: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="ગામ ફિલ્ટર"
            size="small"
            value={selectedVillage}
            onChange={(e) => {
              setSelectedVillage(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">તમામ ગામો</MenuItem>
            {(villages || []).map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>સભાસદ નં</TableCell>
                <TableCell>ખેડૂતનું નામ</TableCell>
                <TableCell>ગામ</TableCell>
                <TableCell align="right" sx={{ width: 200 }}>શરૂઆત બાકી રકમ (₹)</TableCell>
                <TableCell align="center" sx={{ width: 180 }}>બાકી પ્રકાર (જમા / ઉધાર)</TableCell>
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
                    કોઈ સભાસદ મળ્યા નથી.
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell sx={{ fontWeight: 700, color: '#00695C' }}>{b.memberNo}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.name}</TableCell>
                    <TableCell>{b.villageName}</TableCell>
                    <TableCell align="right">
                      <span className="no-print">
                        <TextField
                          type="number"
                          size="small"
                          disabled={isYearLocked}
                          value={b.openingBalance}
                          onChange={(e) => handleBalanceChange(b.id, 'openingBalance', e.target.value)}
                          sx={{ width: 140 }}
                        />
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        ₹ {Number(b.openingBalance || 0).toLocaleString('gu-IN')}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <TextField
                          select
                          size="small"
                          disabled={isYearLocked}
                          value={b.balanceType}
                          onChange={(e) => handleBalanceChange(b.id, 'balanceType', e.target.value)}
                          sx={{ width: 130 }}
                        >
                          <MenuItem value="જમા">જમા (Credit)</MenuItem>
                          <MenuItem value="ઉધાર">ઉધાર (Debit)</MenuItem>
                        </TextField>
                      </span>
                      <span className="print-only" style={{ fontWeight: 600 }}>
                        {b.balanceType || 'જમા'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

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
          labelRowsPerPage="પ્રતિ પેજ સભાસદો:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      <PrintSignatures />
    </Box>
  );
};

export default MemberOpeningPage;
