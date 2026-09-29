import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Alert, Card,
  CardContent, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Switch, FormControlLabel
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Security as SecurityIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useApp } from '../../context/AppContext';

export default function AccountLockPage() {
  const { activeYear, showToast, isYearLocked, checkCanModify } = useApp();

  const [lockDate, setLockDate] = useState('2026-09-30');
  const [isLocked, setIsLocked] = useState(true);
  const [remarks, setRemarks] = useState('પ્રથમ અર્ધવાર્ષિક ઓડિટ પૂર્ણ થયેલ હોવાથી લોક કરેલ છે.');

  const handleSave = () => {
    if (isYearLocked) {
      showToast('પસંદ કરેલ નાણાકીય વર્ષ લૉક હોવાથી સેટિંગ્સ બદલી શકાશે નહીં!', 'error');
      return;
    }
    showToast(
      isLocked
        ? `તા. ${lockDate} સુધીના તમામ હિસાબી વ્યવહારો સફળતાપૂર્વક લોક કરવામાં આવ્યા!`
        : 'હિસાબી વ્યવહારો અનલોક કરવામાં આવ્યા!',
      isLocked ? 'success' : 'info'
    );
  };

  return (
    <Box>
      <PageHeader
        title="હિસાબ લોક / પિરિયડ લોક (Period Locking)"
        subtitle="ઓડિટ થયેલ સમયગાળાના રોજમેળ, રસીદો અને વાઉચરોમાં અનધિકૃત ફેરફાર રોકવા માટેની સુરક્ષા વ્યવસ્થા"
      />

      {isYearLocked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          🔒 ચેતવણી: પસંદ કરેલ નાણાકીય વર્ષ ({activeYear}) સંપૂર્ણપણે લૉક છે. ફક્ત ચાલુ વર્ષ ૨૦૨૬-૨૦૨૭ માટે જ પિરિયડ લૉક સેટિંગ્સ બદલી શકાય છે.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              {isLocked ? <LockIcon color="error" sx={{ fontSize: 40 }} /> : <LockOpenIcon color="success" sx={{ fontSize: 40 }} />}
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {isLocked ? 'હિસાબી ડેટા લોક સ્થિતિ: સક્રિય' : 'હિસાબી ડેટા લોક સ્થિતિ: અનલોક'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  નાણાકીય વર્ષ: {activeYear}
                </Typography>
              </Box>
            </Box>

            <FormControlLabel
              control={<Switch checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} color="error" disabled={isYearLocked} />}
              label="ડેટા એન્ટ્રી લોક લાગુ કરો"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              type="date"
              label="કઈ તારીખ સુધીના વ્યવહારો લોક કરવા છે?"
              value={lockDate}
              onChange={(e) => setLockDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={!isLocked || isYearLocked}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="લોક કરવાનું કારણ / ઓડિટ નોંધ"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={!isLocked || isYearLocked}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color={isLocked ? 'error' : 'primary'}
              fullWidth
              size="large"
              disabled={isYearLocked}
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              {isYearLocked ? 'લૉક વર્ષ (સેટિંગ્સ અમાન્ય)' : 'સેટિંગ્સ સાચવો'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                સુરક્ષા નિયમો અને માર્ગદર્શિકા
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                જે તારીખ સુધી વ્યવહારો લોક કરવામાં આવે છે તે તારીખ સુધી કોઈપણ ઓપરેટર દ્વારા નીચે મુજબની કાર્યવાહી થઈ શકશે નહીં:
              </Alert>
              <Typography variant="body2" paragraph>
                ૧. રોજમેળમાં નવી રસીદ કે વાઉચર બનાવી શકાશે નહીં.<br />
                ૨. અગાઉ નોંધાયેલી એન્ટ્રીમાં ફેરફાર કે રદ્દીકરણ કરી શકાશે નહીં.<br />
                ૩. પિયાત બિલિંગની જૂની તારીખમાં સુધારો થઈ શકશે નહીં.<br />
                ૪. માત્ર સુપર એડમિન (પ્રમુખ શ્રી) વિશેષ અધિકારથી જ અનલોક કરી શકશે.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }} className="print-only">
        <PrintSignatures />
      </Box>
    </Box>
  );
}
