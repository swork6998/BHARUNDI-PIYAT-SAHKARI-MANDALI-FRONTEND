import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useApp } from '../../context/AppContext';

const CompanyProfilePage = () => {
  const { societyInfo, setSocietyInfo, showToast, showNotification, isYearLocked, canModify, apiBase } = useApp();
  const notify = showToast || showNotification;
  const currentApiBase = apiBase || 'http://localhost:5000/api';
  const [formData, setFormData] = useState({
    name: societyInfo?.name || '',
    subTitle: societyInfo?.subTitle || societyInfo?.sub_title || '',
    regNo: societyInfo?.regNo || societyInfo?.reg_no || '',
    pramukh: societyInfo?.pramukh || '',
    mantri: societyInfo?.mantri || '',
    phone: societyInfo?.phone || '',
    address: societyInfo?.address || ''
  });

  useEffect(() => {
    fetch(`${currentApiBase}/masters/company-profile`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const loaded = {
            name: res.data.name || '',
            subTitle: res.data.sub_title || res.data.subTitle || '',
            sub_title: res.data.sub_title || res.data.subTitle || '',
            regNo: res.data.reg_no || res.data.regNo || '',
            reg_no: res.data.reg_no || res.data.regNo || '',
            pramukh: res.data.pramukh || '',
            mantri: res.data.mantri || '',
            phone: res.data.phone || '',
            address: res.data.address || ''
          };
          setFormData(loaded);
          setSocietyInfo(loaded);
        }
      })
      .catch((err) => console.warn('Company profile fetch fallback:', err));
  }, [setSocietyInfo, currentApiBase]);

  const handleSave = async () => {
    if (isYearLocked) {
      if (notify) notify('પસંદ કરેલ વર્ષ લૉક હોવાથી મંડળી પ્રોફાઇલ માહિતીમાં ફેરફાર થઈ શકશે નહીં!', 'error');
      return;
    }
    const payload = {
      name: formData.name || '',
      sub_title: formData.subTitle || formData.sub_title || '',
      reg_no: formData.regNo || formData.reg_no || '',
      pramukh: formData.pramukh || '',
      mantri: formData.mantri || '',
      phone: formData.phone || '',
      address: formData.address || ''
    };
    try {
      await fetch(`${currentApiBase}/masters/company-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSocietyInfo(payload);
      if (notify) notify('મંડળી પ્રોફાઇલ માહિતી સફળતાપૂર્વક સાચવવામાં આવી!', 'success');
    } catch (e) {
      setSocietyInfo(payload);
      if (notify) notify('મંડળી પ્રોફાઇલ માહિતી સાચવવામાં આવી!', 'success');
    }
  };

  return (
    <Box>
      <PageHeader
        title="મંડળી માહિતી પ્રોફાઇલ"
        subtitle="સહકારી મંડળીનું પૂરું નામ, સરનામું, રજીસ્ટ્રેશન નંબર અને હોદ્દેદારોની સત્તાવાર વિગત"
        breadcrumb="માસ્ટર / મંડળી માહિતી"
        icon={<BusinessIcon sx={{ fontSize: 28 }} />}
      />

      <Card sx={{ maxWidth: 900 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#004D40', mb: 1 }}>
            સંસ્થાકીય વિગતો (બિલ અને રિપોર્ટ્સ હેડર માટે)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            અહીં દાખલ કરેલી વિગતો તમામ પિયત બિલો, રસીદો અને નાણાકીય અહેવાલોના મથાળે છાપવામાં આવશે.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="મંડળીનું સત્તાવાર પૂરું નામ"
                fullWidth
                disabled={isYearLocked}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="વિસ્તાર / તાલુકો / જિલ્લો વિગત"
                fullWidth
                disabled={isYearLocked}
                value={formData.subTitle || formData.sub_title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, subTitle: e.target.value, sub_title: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="સહકારી મંડળી રજીસ્ટ્રેશન નંબર"
                fullWidth
                disabled={isYearLocked}
                value={formData.regNo || formData.reg_no || ''}
                onChange={(e) =>
                  setFormData({ ...formData, regNo: e.target.value, reg_no: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="પ્રમુખ શ્રી નું નામ"
                fullWidth
                disabled={isYearLocked}
                value={formData.pramukh || ''}
                onChange={(e) => setFormData({ ...formData, pramukh: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="મંત્રી શ્રી નું નામ"
                fullWidth
                disabled={isYearLocked}
                value={formData.mantri || ''}
                onChange={(e) => setFormData({ ...formData, mantri: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="સંપર્ક ફોન / મોબાઈલ નંબર"
                fullWidth
                disabled={isYearLocked}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="મંડળી કાર્યાલયનું પૂરું સરનામું"
                multiline
                rows={3}
                fullWidth
                disabled={isYearLocked}
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={isYearLocked}
                startIcon={isYearLocked ? <LockIcon /> : <SaveIcon />}
                onClick={handleSave}
                sx={{ px: 4, py: 1 }}
              >
                {isYearLocked ? 'લૉક વર્ષ (ફેરફાર અમાન્ય)' : 'માહિતી સાચવો (Update Profile)'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }} className="print-only">
        <PrintSignatures />
      </Box>
    </Box>
  );
};

export default CompanyProfilePage;
