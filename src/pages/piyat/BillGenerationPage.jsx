import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const BillGenerationPage = () => {
  const { piyatEntries, setPiyatEntries, financialYears, seasons } = useData();
  const { activeYear, activeSeason, showToast, isYearLocked, checkCanModify, yearsList } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    year: activeYear,
    season: activeSeason,
    startBillNo: 1001,
    billDate: new Date().toISOString().split('T')[0],
  });

  const yearOptions = yearsList && yearsList.length > 0 ? yearsList : (financialYears || []);

  const unbilledCount = (piyatEntries || []).filter(
    (p) => !p.isBilled && (p.year === formData.year || p.year_name === formData.year)
  ).length;

  const handleGenerate = () => {
    if (!checkCanModify('બિલ નંબર જનરેટ કરો')) return;

    if (unbilledCount === 0) {
      showToast('પસંદ કરેલ ઋતુમાં કોઈ અન-બિલ્ડ (બાકી) પિયત એન્ટ્રીઓ નથી.', 'warning');
      return;
    }

    let currentNo = Number(formData.startBillNo) || 1001;
    if (setPiyatEntries) {
      setPiyatEntries((prev) =>
        prev.map((p) => {
          if (!p.isBilled && (p.year === formData.year || p.year_name === formData.year)) {
            const updated = {
              ...p,
              billNo: currentNo.toString(),
              bill_no: currentNo.toString(),
              billDate: formData.billDate,
              isBilled: true,
              status: 'અંશતઃ બાકી',
            };
            currentNo++;
            return updated;
          }
          return p;
        })
      );
    }

    showToast(
      `કુલ ${unbilledCount} પિયત બિલો સફળતાપૂર્વક જનરેટ થયા! (બિલ નં. ${formData.startBillNo} થી ${currentNo - 1})`
    );
    navigate('/piyat/bill-list');
  };

  return (
    <Box>
      <PageHeader
        title="પિયત બિલ નંબર જનરેશન (બેચ પ્રોસેસ)"
        subtitle="સિંચાઈ પાણીની તમામ બાકી એન્ટ્રીઓને ક્રમબદ્ધ બિલ નંબર ફાળવણી કરવાની પ્રક્રિયા"
        breadcrumb="પિયત / બિલ જનરેશન"
        icon={<ReceiptIcon sx={{ fontSize: 28 }} />}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5, maxWidth: 750 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. લૉક વર્ષમાં બિલ જનરેટ કરી શકાશે નહીં.
        </Alert>
      )}

      <Card sx={{ maxWidth: 750 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            આ પ્રક્રિયા પસંદ કરેલ વર્ષ અને ઋતુની તમામ કાચી (અન-બિલ્ડ) પિયત એન્ટ્રીઓને આપોઆપ સળંગ બિલ નંબરો ફાળવશે.
          </Alert>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="નાણાકીય વર્ષ"
                fullWidth
                disabled={isYearLocked}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {yearOptions.map((y) => {
                  const val = y.year_name || y.name;
                  return (
                    <MenuItem key={y.id || val} value={val}>
                      {val}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="સિંચાઈ ઋતુ"
                fullWidth
                disabled={isYearLocked}
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                {(seasons || []).map((s) => (
                  <MenuItem key={s.id || s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="શરૂઆત બિલ નંબર (Starting Bill No)"
                type="number"
                fullWidth
                disabled={isYearLocked}
                value={formData.startBillNo}
                onChange={(e) => setFormData({ ...formData, startBillNo: Number(e.target.value) })}
                helperText="દા.ત. ૧૦૦૧ થી શરૂ કરો"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="બિલ જનરેશન તારીખ"
                type="date"
                fullWidth
                disabled={isYearLocked}
                InputLabelProps={{ shrink: true }}
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: unbilledCount > 0 ? '#eff6ff' : '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #bfdbfe',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  હાલમાં બિલ બનવાના બાકી હોય તેવી કુલ એન્ટ્રીઓ: {unbilledCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  બિલ જનરેટ કર્યા પછી તમામ એન્ટ્રીઓને પ્રિન્ટિંગ માટે તૈયાર કરવામાં આવશે.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} className="no-print">
              <Divider sx={{ my: 1.5 }} />
              <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી બિલિંગ ચલાવી શકાશે નહીં" : ""}>
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayCircleOutlineIcon />}
                    disabled={unbilledCount === 0 || isYearLocked}
                    onClick={handleGenerate}
                    sx={{ px: 4, py: 1 }}
                  >
                    બિલ નંબર જનરેટ કરો (Run Billing)
                  </Button>
                </span>
              </Tooltip>
            </Grid>

            {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
            <Grid item xs={12}>
              <PrintSignatures />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BillGenerationPage;
