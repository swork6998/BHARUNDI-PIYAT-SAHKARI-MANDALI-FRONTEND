import React, { useState, useEffect } from 'react';
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
import SaveIcon from '@mui/icons-material/Save';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const PiyatSingleEntryPage = () => {
  const { members, crops, rates, addPiyatEntry, fetchMembers, fetchCrops, fetchBhavPatrak } = useData();
  const { activeYear, activeSeason, showToast, isYearLocked, checkCanModify } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
    fetchCrops();
    fetchBhavPatrak(activeYear, activeSeason);
  }, [fetchMembers, fetchCrops, fetchBhavPatrak, activeYear, activeSeason]);

  const [formData, setFormData] = useState({
    entryNo: (Math.floor(Math.random() * 900) + 100).toString(),
    entryDate: new Date().toISOString().split('T')[0],
    memberId: members[0]?.id || 1,
    blockNo: members[0]?.blocks?.[0]?.blockNo || '૧',
    cropId: crops[0]?.id || 1,
    waterType: 'વહેતા પાણી',
    area: 2.0,
    paniCount: 2,
  });

  // સભાસદ બદલાય ત્યારે બ્લોક અપડેટ કરો
  const selectedMember = members.find((m) => m.id === Number(formData.memberId));
  const selectedCrop = crops.find((c) => c.id === Number(formData.cropId));

  // ભાવ પત્રકમાંથી દર મેળવો
  const matchedRateObj = (rates || []).find(
    (r) => Number(r.crop_id || r.cropId) === Number(formData.cropId)
  );
  let currentRate = 0;
  if (matchedRateObj) {
    const motor = matchedRateObj.motor_rate ?? matchedRateObj.motorRate ?? 0;
    const sabhasad = matchedRateObj.sabhasad_rate ?? matchedRateObj.sabhasadRate ?? 0;
    const nominal = matchedRateObj.nominal_rate ?? matchedRateObj.nominalRate ?? 0;
    if (formData.waterType === 'મોટર / ઉદવહન') {
      currentRate = motor;
    } else {
      currentRate = selectedMember?.category === 'સભાસદ' ? sabhasad : nominal;
    }
  }

  // આપોઆપ ગણતરી
  const baseAmount = Number(formData.area) * Number(formData.paniCount) * Number(currentRate);
  const cess20 = Math.round(baseAmount * 0.2); // ૨૦% સ્થાનિક સરકારી સેસ
  const totalAmount = baseAmount + cess20;

  const handleMemberChange = (memberId) => {
    const mem = members.find((m) => m.id === Number(memberId));
    setFormData((prev) => ({
      ...prev,
      memberId,
      blockNo: mem?.blocks?.[0]?.blockNo || '૧',
      area: mem?.blocks?.[0]?.area || 2.0,
    }));
  };

  const handleSave = () => {
    if (!checkCanModify('પિયત એન્ટ્રી ઉમેરો')) return;

    const payload = {
      ...formData,
      year: activeYear,
      season: activeSeason,
      memberNo: selectedMember ? selectedMember.memberNo : '૧',
      memberName: selectedMember ? selectedMember.name : '',
      villageName: selectedMember ? selectedMember.villageName : '',
      category: selectedMember ? selectedMember.category : 'સભાસદ',
      cropName: selectedCrop ? selectedCrop.name : '',
      rate: currentRate,
      baseAmount,
      cess20,
      totalAmount,
      isBilled: false,
      billNo: '',
      billDate: '',
      paidAmount: 0,
      status: 'બિલ બાકી',
    };

    addPiyatEntry(payload);
    showToast('પિયત એન્ટ્રી સફળતાપૂર્વક સાચવવામાં આવી!');
    navigate('/piyat/bill-list');
  };

  return (
    <Box>
      <PageHeader
        title="પિયત કામગીરી એન્ટ્રી (સિંગલ ફોર્મ)"
        subtitle="ખેડૂતને અપાયેલ નહેર/મોટર સિંચાઈ પાણીની વિગતવાર નોંધણી"
        breadcrumb="પિયત / સિંગલ એન્ટ્રી"
        icon={<WaterDropIcon sx={{ fontSize: 28 }} />}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/piyat/bill-list')}>
            યાદી જુઓ
          </Button>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5, maxWidth: 850 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નવી પિયત એન્ટ્રી ઉમેરી શકાશે નહીં.
        </Alert>
      )}

      <Card sx={{ maxWidth: 850 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="એન્ટ્રી નંબર"
                fullWidth
                disabled={isYearLocked}
                value={formData.entryNo}
                onChange={(e) => setFormData({ ...formData, entryNo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="એન્ટ્રી તારીખ"
                type="date"
                fullWidth
                disabled={isYearLocked}
                InputLabelProps={{ shrink: true }}
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="ખેડૂત (સભાસદ)"
                fullWidth
                disabled={isYearLocked}
                value={formData.memberId}
                onChange={(e) => handleMemberChange(e.target.value)}
              >
                {members.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    ({m.memberNo}) {m.name} - {m.villageName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="જમીન બ્લોક નં."
                fullWidth
                disabled={isYearLocked}
                value={formData.blockNo}
                onChange={(e) => setFormData({ ...formData, blockNo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="વાવેતર પાક"
                fullWidth
                disabled={isYearLocked}
                value={formData.cropId}
                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              >
                {crops.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="સિંચાઈ પદ્ધતિ"
                fullWidth
                disabled={isYearLocked}
                value={formData.waterType}
                onChange={(e) => setFormData({ ...formData, waterType: e.target.value })}
              >
                <MenuItem value="વહેતા પાણી">વહેતા પાણી (Gravity Flow)</MenuItem>
                <MenuItem value="મોટર / ઉદવહન">મોટર / ઉદવહન (Pump Lift)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="પિયત વિસ્તાર (વીઘા)"
                type="number"
                fullWidth
                disabled={isYearLocked}
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="પાણી ફેરી સંખ્યા (Rotations)"
                type="number"
                fullWidth
                disabled={isYearLocked}
                value={formData.paniCount}
                onChange={(e) => setFormData({ ...formData, paniCount: Number(e.target.value) })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="ભાવ પત્રક દર (₹ / વીઘા)"
                fullWidth
                disabled
                value={`₹ ${currentRate}`}
                helperText={`${selectedMember?.category} દર`}
              />
            </Grid>

            {/* આપોઆપ ગણતરી સારાંશ બોક્સ */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2.5,
                  my: 1,
                  bgcolor: '#f0fdf4',
                  borderRadius: 2,
                  border: '1px solid #bbf7d0',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', mb: 1 }}>
                  આપોઆપ બિલ ગણતરી સારાંશ:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">મૂળ પાણી રકમ:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      ₹ {baseAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">૨૦% સ્થાનિક સરકારી સેસ:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#dc2626' }}>
                      + ₹ {cess20.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">કુલ ચૂકવવાપાત્ર રકમ:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00695C' }}>
                      ₹ {totalAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} className="no-print">
              <Divider sx={{ my: 1 }} />
              <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી નવી એન્ટ્રી સાચવી શકાશે નહીં" : ""}>
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isYearLocked}
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ px: 4, py: 1 }}
                  >
                    પિયત એન્ટ્રી સાચવો (Save Piyat Entry)
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

export default PiyatSingleEntryPage;
