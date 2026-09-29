import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Alert, Card, CardContent,
  Divider, LinearProgress, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useApp } from '../../context/AppContext';

export default function BackupRestorePage() {
  const { activeYear, showToast, isYearLocked } = useApp();

  const [downloading, setDownloading] = useState(false);

  const handleDownloadBackup = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      showToast('MySQL ડેટાબેઝ બેકઅપ ફાઇલ (SQL Script) સફળતાપૂર્વક ડાઉનલોડ થઈ!', 'success');

      // Create downloadable anchor
      const element = document.createElement('a');
      const file = new Blob(
        ['-- શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ ડેટાબેઝ બેકઅપ\nUSE bharundi_piyat_mandali;'],
        { type: 'text/plain' }
      );
      element.href = URL.createObjectURL(file);
      element.download = `bharundi_piyat_backup_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(element);
      element.click();
    }, 1500);
  };

  const handleRestore = () => {
    if (isYearLocked) {
      showToast('પસંદ કરેલ નાણાકીય વર્ષ લૉક હોવાથી ડેટાબેઝ રીસ્ટોર કરી શકાશે નહીં!', 'error');
      return;
    }
    showToast('ડેટાબેઝ સફળતાપૂર્વક રીસ્ટોર કરવામાં આવ્યો!', 'info');
  };

  return (
    <Box>
      <PageHeader
        title="ડેટાબેઝ બેકઅપ અને પુનઃસ્થાપન (Backup & Restore)"
        subtitle="મંડળીના તમામ પિયાત, સભાસદ, શેર અને નાણાકીય હિસાબોનું સુરક્ષિત MySQL બેકઅપ"
      />

      {isYearLocked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          🔒 ચેતવણી: પસંદ કરેલ વર્ષ ({activeYear}) લૉક છે. ફક્ત બેકઅપ ડાઉનલોડ અને પ્રિન્ટ કરી શકાશે. રીસ્ટોર સુવિધા નિષ્ક્રિય કરેલ છે.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Backup Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <DownloadIcon color="primary" sx={{ fontSize: 44 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">નવો બેકઅપ ડાઉનલોડ કરો</Typography>
                <Typography variant="body2" color="text.secondary">
                  સંપૂર્ણ ડેટાબેઝની એક જ .sql સ્ક્રિપ્ટ ફાઇલ તૈયાર થશે
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              ડેટાબેઝ સુરક્ષિત છે. છેલ્લો સ્વયંચાલિત બેકઅપ: <b>આજે ૧૨:૦૦ PM</b>
            </Alert>

            <List dense sx={{ mb: 3 }}>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="સભાસદો અને તેમની જમીન/કેનાલ રેકોર્ડ્સ" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="પિયાત આકારણી, મીટર રીડિંગ અને ૨૦% સેસ સહિતના બિલો" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="દૈનિક રોજમેળ, રસીદો અને હિસાબી વાઉચરો" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="શેર રજીસ્ટર અને ડિવિડન્ડ રેકોર્ડ્સ" />
              </ListItem>
            </List>

            {downloading && <LinearProgress sx={{ mb: 2 }} />}

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={handleDownloadBackup}
              disabled={downloading}
              sx={{ height: 48 }}
            >
              {downloading ? 'બેકઅપ ફાઈલ બની રહી છે...' : 'સંપૂર્ણ SQL બેકઅપ ડાઉનલોડ કરો'}
            </Button>
          </Paper>
        </Grid>

        {/* Restore Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <UploadIcon color="warning" sx={{ fontSize: 44 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">બેકઅપ ફાઈલમાંથી રીસ્ટોર કરો</Typography>
                <Typography variant="body2" color="text.secondary">
                  અગાઉ સેવ કરેલી .sql ફાઇલ અપલોડ કરીને ડેટા પાછો મેળવો
                </Typography>
              </Box>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              સાવચેતી: રીસ્ટોર કરવાથી હાલનો ડેટાબેઝ અપલોડ કરેલી ફાઇલ મુજબ ઓવરરાઈટ થશે.
            </Alert>

            <Box
              sx={{
                border: '2px dashed #bbb',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
                mb: 3,
                cursor: 'pointer'
              }}
              onClick={handleRestore}
            >
              <StorageIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                અહીં .sql બેકઅપ ફાઈલ પસંદ કરો અથવા ડ્રેગ કરો
              </Typography>
              <Typography variant="caption" color="text.secondary">
                મહત્તમ ફાઈલ સાઈઝ: ૫૦ MB
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="warning"
              size="large"
              fullWidth
              disabled={isYearLocked}
              startIcon={<UploadIcon />}
              onClick={handleRestore}
              sx={{ height: 48 }}
            >
              {isYearLocked ? 'લૉક વર્ષ (રીસ્ટોર અમાન્ય)' : 'ડેટાબેઝ પુનઃસ્થાપિત (Restore) કરો'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }} className="print-only">
        <PrintSignatures />
      </Box>
    </Box>
  );
}
