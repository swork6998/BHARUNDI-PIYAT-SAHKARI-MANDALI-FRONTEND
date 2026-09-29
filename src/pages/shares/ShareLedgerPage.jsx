import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  TablePagination,
  CircularProgress
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';

const ShareLedgerPage = () => {
  const { members, villages, fetchMembers, fetchShares, fetchVillages } = useData();
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberShares, setMemberShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // ૧. શરૂઆતમાં તમામ સભાસદો અને ગામો લોડ કરો
  useEffect(() => {
    if (fetchVillages) fetchVillages();
    if (fetchMembers) fetchMembers();
  }, [fetchVillages, fetchMembers]);

  // ૨. ગામ અને સર્ચ મુજબ ફિલ્ટર થયેલ સભાસદોની યાદી
  const filteredMemberList = useMemo(() => {
    return (members || []).filter((m) => {
      const vName = m.village_name_guj || m.villageName || m.village_name || '';
      const vMatch = selectedVillage === 'all' || vName === selectedVillage;
      const mCode = String(m.member_code || m.memberNo || m.member_no || '');
      const mName = String(m.name || m.member_name_guj || '');
      const sMatch = !searchTerm.trim() ||
        mCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mName.toLowerCase().includes(searchTerm.toLowerCase());
      return vMatch && sMatch;
    });
  }, [members, selectedVillage, searchTerm]);

  // ૩. ફિલ્ટર કરેલા લિસ્ટમાંથી પ્રથમ સભાસદ આપોઆપ પસંદ કરો
  useEffect(() => {
    if (filteredMemberList.length > 0) {
      const exists = filteredMemberList.some((m) => String(m.id) === String(selectedMemberId));
      if (!selectedMemberId || !exists) {
        setSelectedMemberId(String(filteredMemberList[0].id));
        setPage(0);
      }
    } else {
      setSelectedMemberId('');
      setMemberShares([]);
    }
  }, [filteredMemberList, selectedMemberId]);

  // ૪. પસંદ કરેલ સભાસદ ઓબ્જેક્ટ
  const selectedMember = useMemo(() => {
    return (members || []).find((m) => String(m.id) === String(selectedMemberId)) || filteredMemberList[0] || null;
  }, [members, selectedMemberId, filteredMemberList]);

  // ૫. પસંદ કરેલ સભાસદ માટે સર્વર પરથી શેર ડેટા ફેચ કરો
  useEffect(() => {
    if (!selectedMemberId) {
      setMemberShares([]);
      return;
    }
    let isMounted = true;
    const loadShares = async () => {
      setLoading(true);
      if (fetchShares) {
        const res = await fetchShares({ member_id: selectedMemberId });
        if (isMounted && res && res.data) {
          setMemberShares(res.data);
        }
      }
      if (isMounted) setLoading(false);
    };
    loadShares();
    return () => {
      isMounted = false;
    };
  }, [selectedMemberId, fetchShares]);

  // ૬. જો શેર ટેબલમાં પ્રમાણપત્રો હોય તો તે, અન્યથા સભાસદ પ્રોફાઇલમાંથી આરંભિક શેર દર્શાવો
  const displayShares = useMemo(() => {
    if (memberShares.length > 0) return memberShares;
    const sCount = Number(selectedMember?.sharesCount || selectedMember?.shares_count || 0);
    const sAmount = Number(selectedMember?.share_balance || selectedMember?.share_amount || 0);
    if (sCount > 0 && selectedMember) {
      return [{
        id: `opening-${selectedMember.id}`,
        issue_date: selectedMember.joinDate || selectedMember.join_date || '2005-04-01',
        certi_no: `આરંભિક-${selectedMember.member_code || selectedMember.member_no || selectedMember.id}`,
        from_no: '૧',
        to_no: String(sCount),
        share_count: sCount,
        face_value: 100,
        amount: sAmount || (sCount * 100),
        tharav_no: 'આરંભિક સભ્યપદ ફાળવણી',
        status: selectedMember.status || 'ચાલુ'
      }];
    }
    return [];
  }, [memberShares, selectedMember]);

  const totalMemberShares = useMemo(() => {
    return displayShares.reduce((s, sh) => s + Number(sh.share_count || sh.count || sh.shareCount || 0), 0);
  }, [displayShares]);

  const totalMemberAmount = useMemo(() => {
    return displayShares.reduce((s, sh) => s + Number(sh.amount || sh.total_amount || 0), 0);
  }, [displayShares]);

  const pagedShares = useMemo(() => {
    const start = page * rowsPerPage;
    return displayShares.slice(start, start + rowsPerPage);
  }, [displayShares, page, rowsPerPage]);

  const villageOptions = useMemo(() => {
    const list = new Set();
    (villages || []).forEach((v) => { if (v.name) list.add(v.name); });
    (members || []).forEach((m) => {
      const vName = m.village_name_guj || m.villageName || m.village_name;
      if (vName) list.add(vName);
    });
    return Array.from(list);
  }, [villages, members]);

  return (
    <Box>
      <PageHeader
        title="સભાસદ શેર ખાતાવહી (શેર લેજર)"
        subtitle="સભાસદવાર શેર પ્રમાણપત્રો અને શેર મૂડી વ્યવહારોની વિગતવાર ખાતાવહી"
        breadcrumb="શેર / શેર ખાતાવહી"
        icon={<AutoStoriesIcon sx={{ fontSize: 28 }} />}
        actions={
          <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={() => window.print()}>
            ખાતાવહી પ્રિન્ટ કરો
          </Button>
        }
      />

      {/* સભાસદ સિલેક્ટર અને ફિલ્ટર્સ */}
      <Card sx={{ mb: 2.5 }} className="no-print">
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            {villageOptions.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            placeholder="સભાસદ નંબર અથવા નામ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          />

          <TextField
            select
            label="સભાસદ પસંદ કરો"
            size="small"
            value={selectedMemberId}
            onChange={(e) => {
              setSelectedMemberId(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 280, flexGrow: 1 }}
          >
            {filteredMemberList.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>
                ({m.member_code || m.memberNo || m.member_no}) {m.name || m.member_name_guj} - {m.villageName || m.village_name_guj || m.village_name || 'ભારૂંડી'}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ ml: { xs: 0, md: 'auto' }, display: 'flex', gap: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              કુલ શેર: <span style={{ color: '#00695C', fontSize: '1.1rem' }}>{totalMemberShares}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              કુલ શેર મૂડી: <span style={{ color: '#00695C', fontSize: '1.1rem' }}>₹ {Number(totalMemberAmount).toLocaleString('en-IN')}</span>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* પ્રિન્ટેબલ લેજર પત્રક */}
      <Card className="print-page" sx={{ mb: 3 }}>
        <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#004D40' }}>
            સભાસદ: ({selectedMember?.member_code || selectedMember?.memberNo || selectedMember?.member_no || '-'}) {selectedMember?.name || selectedMember?.member_name_guj || 'સભાસદ પસંદ કરો'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            ગામ: {selectedMember?.villageName || selectedMember?.village_name_guj || selectedMember?.village_name || '-'} | સભ્યપદ જોડાણ તારીખ: {selectedMember?.joinDate || selectedMember?.join_date ? formatDate(selectedMember?.joinDate || selectedMember?.join_date) : '-'} | સ્થિતિ: {selectedMember?.status || 'ચાલુ'}
          </Typography>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>તારીખ</TableCell>
                  <TableCell>પ્રમાણપત્ર નં</TableCell>
                  <TableCell>શેર નં. થી</TableCell>
                  <TableCell>શેર નં. સુધી</TableCell>
                  <TableCell align="right">શેર સંખ્યા</TableCell>
                  <TableCell align="right">શેર દીઠ દર (₹)</TableCell>
                  <TableCell align="right">શેર મૂડી રકમ (₹)</TableCell>
                  <TableCell>ઠરાવ નંબર/તારીખ</TableCell>
                  <TableCell align="center">સ્થિતિ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                        શેર ખાતાવહી ડેટા લોડ થઈ રહ્યો છે...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : displayShares.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3, color: '#64748b' }}>
                      આ સભાસદના કોઈ શેર રેકોર્ડ ઉપલબ્ધ નથી.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedShares.map((sh) => (
                    <TableRow key={sh.id}>
                      <TableCell>{formatDate(sh.issueDate || sh.issue_date)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#00695C' }}>{sh.certiNo || sh.certi_no || '-'}</TableCell>
                      <TableCell>{sh.fromNo || sh.from_no || '-'}</TableCell>
                      <TableCell>{sh.toNo || sh.to_no || '-'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{sh.count || sh.shareCount || sh.share_count || 1}</TableCell>
                      <TableCell align="right">₹ {Number(sh.faceValue || sh.face_value || 100).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#00695C' }}>
                        ₹ {Number(sh.amount || sh.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{sh.tharavDate ? formatDate(sh.tharavDate) : (sh.tharav_date ? formatDate(sh.tharav_date) : (sh.tharav_no || '-'))}</TableCell>
                      <TableCell align="center">{sh.status || 'ચાલુ'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>

        <TablePagination
          component="div"
          count={displayShares.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="પ્રતિ પેજ શેર:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Card>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
};

export default ShareLedgerPage;
