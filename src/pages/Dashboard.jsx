import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import PrintSignatures from '../components/common/PrintSignatures';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

const Dashboard = () => {
  const {
    members,
    piyatEntries,
    receipts,
    fetchMembers,
    fetchPiyatEntries,
    fetchReceipts
  } = useData();
  const { societyInfo, activeYear, activeSeason, isYearLocked } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchMembers(activeYear);
    fetchPiyatEntries(activeYear);
    fetchReceipts(activeYear);
  }, [fetchMembers, fetchPiyatEntries, fetchReceipts, activeYear]);

  // ગણતરીઓ
  const totalMembers = members?.length || 0;
  const totalArea = (piyatEntries || []).reduce((sum, p) => sum + Number(p.area_vigha || p.area || 0), 0);
  const totalPiyatAmount = (piyatEntries || []).reduce((sum, p) => sum + Number(p.total_amount || p.totalAmount || 0), 0);
  const totalCollected = (receipts || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const pendingAmount = Math.max(0, totalPiyatAmount - totalCollected);

  return (
    <Box>
      <PageHeader
        title="મુખ્ય નિયંત્રણ બોર્ડ (ડેશબોર્ડ)"
        subtitle={`${societyInfo.name} - ${societyInfo.subTitle}`}
        breadcrumb="ડેશબોર્ડ"
        actions={
          <>
            <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી નવી એન્ટ્રી ઉમેરી શકાતી નથી` : ''}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  disabled={isYearLocked}
                  onClick={() => navigate('/piyat/multi')}
                >
                  ઝડપી પિયત એન્ટ્રી
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી નવી રસીદ બનાવી શકાતી નથી` : ''}>
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ReceiptLongIcon />}
                  disabled={isYearLocked}
                  onClick={() => navigate('/transactions/receipt')}
                >
                  રોકડ પહોંચ / રસીદ
                </Button>
              </span>
            </Tooltip>
          </>
        }
      />

      {/* KPI આંકડાકીય કાર્ડ્સ */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="કુલ નોંધાયેલ સભાસદો"
            value={`${totalMembers} ખેડૂતો`}
            icon={<PeopleIcon sx={{ fontSize: 30 }} />}
            color="#00695C"
            subtitle="ચાલુ સક્રિય સભાસદો"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="કુલ પિયત થયેલ વિસ્તાર"
            value={`${totalArea.toFixed(1)} વીઘા`}
            icon={<WaterDropIcon sx={{ fontSize: 30 }} />}
            color="#0288D1"
            subtitle={`વર્ષ: ${activeYear}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="કુલ વસૂલાત થયેલ રકમ"
            value={`₹ ${totalCollected.toLocaleString('gu-IN')}`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 30 }} />}
            color="#2E7D32"
            subtitle={`વર્ષ: ${activeYear}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="બાકી પિયત વસૂલાત"
            value={`₹ ${pendingAmount.toLocaleString('gu-IN')}`}
            icon={<ReceiptLongIcon sx={{ fontSize: 30 }} />}
            color="#C62828"
            subtitle="કુલ લેણી રકમ"
          />
        </Grid>
      </Grid>

      {/* મુખ્ય તાલિકા અને ગતિવિધિઓ */}
      <Grid container spacing={3}>
        {/* તાજેતરની પિયત એન્ટ્રીઓ */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  તાજેતરની પિયત નોંધણીઓ ({activeYear})
                </Typography>
                <Button size="small" className="no-print" onClick={() => navigate('/piyat/bills')}>
                  બધા જુઓ
                </Button>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>સભાસદ</TableCell>
                    <TableCell>પાક</TableCell>
                    <TableCell align="right">વિસ્તાર (વીઘા)</TableCell>
                    <TableCell align="right">રકમ (₹)</TableCell>
                    <TableCell align="center">સ્થિતિ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {piyatEntries.slice(0, 5).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {p.member_name_guj || p.memberName || `સભાસદ નં. ${p.member_code || p.member_id}`}
                      </TableCell>
                      <TableCell>{p.crop_name_guj || p.cropName || 'શેરડી'}</TableCell>
                      <TableCell align="right">{p.area_vigha ?? p.area ?? 1}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#00695C' }}>
                        ₹ {p.total_amount ?? p.totalAmount ?? 0}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.status || 'મંજૂર'}
                          size="small"
                          color={p.status === 'મંજૂર' ? 'success' : 'default'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {piyatEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        આ વર્ષ માટે કોઈ પિયત એન્ટ્રી મળી નથી.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* તાજેતરની રોકડ રસીદો */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  તાજેતરની રોકડ રસીદો ({activeYear})
                </Typography>
                <Button size="small" className="no-print" onClick={() => navigate('/transactions/receipt')}>
                  બધા જુઓ
                </Button>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>રસીદ નં</TableCell>
                    <TableCell>સભાસદ</TableCell>
                    <TableCell align="right">રકમ (₹)</TableCell>
                    <TableCell>તારીખ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipts.slice(0, 5).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{r.receipt_no || r.receiptNo}</TableCell>
                      <TableCell>{r.member_name || r.memberName}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                        ₹ {Number(r.amount).toLocaleString('gu-IN')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {formatDate(r.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {receipts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        આ વર્ષ માટે કોઈ રોકડ રસીદ મળી નથી.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <PrintSignatures />
    </Box>
  );
};

export default Dashboard;
