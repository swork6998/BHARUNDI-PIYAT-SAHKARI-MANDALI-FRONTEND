import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Box,
  InputAdornment,
  Tooltip,
  TablePagination,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const MemberListPage = () => {
  const { members, villages, deleteMember, fetchMembers, fetchVillages } = useData();
  const { showToast, showNotification, isYearLocked, activeYear } = useApp();
  const notify = showToast || showNotification;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchMembers({
      year: activeYear,
      village_id: selectedVillage,
      category: selectedCategory,
      search: searchQuery,
      page: page + 1,
      limit: rowsPerPage
    });
    if (res && res.total !== undefined) {
      setTotalCount(res.total);
    }
    setLoading(false);
  }, [fetchMembers, activeYear, selectedVillage, selectedCategory, searchQuery, page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  const confirmDelete = async () => {
    if (isYearLocked) {
      notify(`પાછલું વર્ષ (${activeYear}) લૉક હોવાથી સભાસદ ડિલીટ કરી શકાતો નથી.`, 'warning');
      return;
    }
    try {
      const res = await deleteMember(deleteId);
      setDeleteId(null);
      if (res && res.success) {
        notify('સભાસદ સફળતાપૂર્વક ડિલીટ કરાયા.', 'success');
      } else {
        notify(res?.message || 'સભાસદ ડિલીટ કરવામાં ભૂલ આવી.', 'error');
      }
      loadData();
    } catch (e) {
      notify('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="સભાસદ / ખેડૂત યાદી (ડિરેક્ટરી)"
        subtitle={`મંડળીના તમામ સભાસદો અને બિન-સભાસદોની વિગતવાર યાદી (કુલ: ${totalCount})`}
        breadcrumb="સભાસદ / સભાસદ યાદી"
        icon={<PeopleIcon sx={{ fontSize: 28 }} />}
        actions={
          <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી નવો સભાસદ ઉમેરી શકાતો નથી` : ''}>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                disabled={isYearLocked}
                onClick={() => navigate('/members/new')}
              >
                નવા સભાસદ નોંધણી
              </Button>
            </span>
          </Tooltip>
        }
      />

      {/* શોધ અને ફિલ્ટર બાર */}
      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="સભાસદ નંબર, નામ કે ફોનથી શોધો..."
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ flexGrow: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading ? <CircularProgress size={20} /> : null
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
            {villages.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="શ્રેણી ફિલ્ટર"
            size="small"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">તમામ શ્રેણી</MenuItem>
            <MenuItem value="સભાસદ">સભાસદ</MenuItem>
            <MenuItem value="નોમિનલ (બિન-સભાસદ)">નોમિનલ (બિન-સભાસદ)</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      {/* સભાસદ યાદી કોષ્ટક */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>સભાસદ નં</TableCell>
                <TableCell>ખેડૂતનું પૂરું નામ</TableCell>
                <TableCell>ગામ</TableCell>
                <TableCell>મોબાઈલ નંબર</TableCell>
                <TableCell>શ્રેણી</TableCell>
                <TableCell align="right">શેર સંખ્યા</TableCell>
                <TableCell align="right">શરૂઆત બાકી</TableCell>
                <TableCell align="center">સ્થિતિ</TableCell>
                <TableCell align="center" className="no-print">ક્રિયા</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!members || members.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b' }}>
                    {loading ? 'લોડ થઈ રહ્યું છે...' : 'કોઈ સભાસદ રેકોર્ડ મળ્યા નથી.'}
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {m.memberNo || m.member_code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {m.name || m.member_name_guj}
                    </TableCell>
                    <TableCell>{m.villageName || m.village_name_guj}</TableCell>
                    <TableCell>{m.phone || m.mobile_no || '-'}</TableCell>
                    <TableCell>
                      <span className="no-print">
                        <Chip
                          label={m.category || 'સભાસદ'}
                          size="small"
                          color={(m.category || 'સભાસદ') === 'સભાસદ' ? 'primary' : 'default'}
                          variant={(m.category || 'સભાસદ') === 'સભાસદ' ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </span>
                      <span className="print-only">
                        {m.category || 'સભાસદ'}
                      </span>
                    </TableCell>
                    <TableCell align="right">{m.sharesCount || (m.share_balance ? m.share_balance / 100 : 10)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: (m.balanceType || 'જમા') === 'ઉધાર' ? '#d32f2f' : '#2e7d32' }}>
                      ₹ {m.openingBalance ?? m.opening_balance ?? 0} ({m.balanceType || 'જમા'})
                    </TableCell>
                    <TableCell align="center">
                      <span className="no-print">
                        <Chip
                          label={m.status || 'ચાલુ'}
                          size="small"
                          color={(m.status || 'ચાલુ') === 'ચાલુ' ? 'success' : 'error'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </span>
                      <span className="print-only">
                        {m.status || 'ચાલુ'}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <Tooltip title={isYearLocked ? 'પાછલું વર્ષ લૉક હોવાથી સુધારો કરી શકાતો નથી' : 'સુધારો કરો'}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isYearLocked}
                            onClick={() => navigate(`/members/edit/${m.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isYearLocked ? 'પાછલું વર્ષ લૉક હોવાથી ડિલીટ કરી શકાતો નથી' : 'ડિલીટ કરો'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isYearLocked}
                            onClick={() => setDeleteId(m.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
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
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : `વધુ`}`}
          className="no-print"
        />
      </Card>

      <PrintSignatures />

      <ConfirmModal
        open={Boolean(deleteId)}
        message="શું તમે ખરેખર આ સભાસદ ખાતું ડિલીટ કરવા માંગો છો?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default MemberListPage;
