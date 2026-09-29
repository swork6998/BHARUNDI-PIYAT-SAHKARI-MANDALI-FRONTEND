import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Stepper, Step, StepLabel,
  Card, CardContent, Alert, Divider, List, ListItem, ListItemIcon,
  ListItemText, Checkbox, FormControlLabel, CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  PublishedWithChanges as CarryForwardIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useApp } from '../../context/AppContext';

export default function YearEndProcessPage() {
  const { activeYear, showToast, isYearLocked } = useApp();

  const [activeStep, setActiveStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const steps = [
    'વાર્ષિક ઓડિટ અને આખર સિલક ચકાસણી',
    'નફા-નુકસાન અને અનામત ભંડોળ ટ્રાન્સફર',
    'સભાસદ ખાતા અને શેર બાકી કેરી ફોરવર્ડ',
    'નવા નાણાકીય વર્ષ ૨૦૨૭-૨૦૨૮ ની શરૂઆત'
  ];

  const handleNext = () => {
    if (isYearLocked) {
      showToast('પસંદ કરેલ વર્ષ પહેલેથી જ લૉક છે. ફક્ત ચાલુ વર્ષ ૨૦૨૬-૨૦૨૭ માટે જ વર્ષ આખર પ્રક્રિયા થઈ શકે છે!', 'error');
      return;
    }
    if (activeStep === steps.length - 1) {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        showToast('વર્ષ આખર કેરી ફોરવર્ડ પ્રક્રિયા ૧૦૦% સફળતાપૂર્વક પૂર્ણ થઈ!', 'success');
        setActiveStep(steps.length);
      }, 2000);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <Box>
      <PageHeader
        title="વર્ષ આખર પ્રક્રિયા અને કેરી ફોરવર્ડ (Year End Process)"
        subtitle={`નાણાકીય વર્ષ ${activeYear} ના હિસાબો આખરી કરી નવા નાણાકીય વર્ષ ૨૦૨૭-૨૦૨૮ માં બાકીઓ આગળ લઈ જવાની પ્રક્રિયા`}
      />

      {isYearLocked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          🔒 ચેતવણી: પસંદ કરેલ વર્ષ ({activeYear}) ભૂતકાળનું લૉક વર્ષ છે. માત્ર ચાલુ વર્ષ ૨૦૨૬-૨૦૨૭ માટે જ વર્ષ આખર પ્રક્રિયા કરી શકાય છે.
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ my: 4 }} />

        {activeStep < steps.length ? (
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            {activeStep === 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  વર્ષ આખર પ્રક્રિયા શરૂ કરતા પહેલા ખાતરી કરો કે તમામ દૈનિક રોજમેળ, રસીદો અને વાઉચરો ઓડિટ થઈ ચૂક્યા છે.
                </Alert>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  પગલું ૧: વાર્ષિક હિસાબ ચકાસણી યાદી
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="કાચું સરવૈયું સંતુલિત (Tally) થયેલ છે." secondary="ઉધાર અને જમા સરખા છે." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="બેંક રિકોન્સિલેશન પૂર્ણ થયેલ છે." secondary="બેંક પાસબુક અને રોકડમેળ સરભર છે." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="પિયાત આકારણી અને ૨૦% સેસ ગણતરી પૂર્ણ થયેલ છે." />
                  </ListItem>
                </List>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  પગલું ૨: નફાની વહેંચણી અને અનામત ભંડોળ
                </Typography>
                <Card sx={{ bgcolor: 'primary.lighter', mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2">ચાલુ વર્ષનો ચોખ્ખો નફો: <b>₹ ૫૬,૯૫૪</b></Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      - સામાન્ય અનામત ભંડોળ (૨૫%): ₹ ૧૪,૨૩૮.૫૦<br />
                      - ડિવિડન્ડ સમતુલા ભંડોળ (૧૦%): ₹ ૫,૬૯૫.૪૦<br />
                      - શિક્ષણ ફંડ (સહકારી સંઘ): ₹ ૧,૦૦૦.૦૦<br />
                      - બાકી વહેંચણીપાત્ર નફો: ₹ ૩૬,૦૨૦.૧૦
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  પગલું ૩: બાકી સિલકોનું કેરી ફોરવર્ડ
                </Typography>
                <Typography variant="body2" paragraph>
                  નીચેની બાકીઓ નવા નાણાકીય વર્ષ ૨૦૨૭-૨૦૨૮ ની શરૂઆત બાકી તરીકે આપમેળે ટ્રાન્સફર થશે:
                </Typography>
                <List dense>
                  <ListItem><ListItemIcon><CarryForwardIcon color="primary" /></ListItemIcon><ListItemText primary="સભાસદોની શેર મૂડી રકમ (શેર ભંડોળ)" /></ListItem>
                  <ListItem><ListItemIcon><CarryForwardIcon color="primary" /></ListItemIcon><ListItemText primary="સભાસદો પાસેથી બાકી પિયાત પાણી બિલ લેણાં" /></ListItem>
                  <ListItem><ListItemIcon><CarryForwardIcon color="primary" /></ListItemIcon><ListItemText primary="બેંક ખાતા અને રોકડ સિલકની આખર બાકી" /></ListItem>
                  <ListItem><ListItemIcon><CarryForwardIcon color="primary" /></ListItemIcon><ListItemText primary="વેપારીઓ અને કાયમી મિલકતોની આખર સિલક" /></ListItem>
                </List>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  ચેતવણી: આ પ્રક્રિયા પૂર્ણ થયા પછી નાણાકીય વર્ષ {activeYear} ના હિસાબો હંમેશ માટે લોક થઈ જશે!
                </Alert>
                <FormControlLabel
                  control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
                  label="મેં તમામ વાર્ષિક અહેવાલો અને બેલેન્સ શીટ ચકાસી લીધા છે અને હું વર્ષ આખર કરવા સંમત છું."
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button disabled={activeStep === 0 || processing} onClick={() => setActiveStep((p) => p - 1)}>
                પાછળ જાઓ
              </Button>
              <Button
                variant="contained"
                disabled={(activeStep === 3 && !confirmed) || processing || isYearLocked}
                onClick={handleNext}
                startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {activeStep === steps.length - 1 ? (processing ? 'પ્રક્રિયા ચાલુ છે...' : 'વર્ષ આખર કેરી ફોરવર્ડ કરો') : 'આગળ વધો'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              વર્ષ આખર પ્રક્રિયા સફળતાપૂર્વક પૂર્ણ થઈ!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              નવું નાણાકીય વર્ષ ૨૦૨૭-૨૦૨૮ સક્રિય કરવામાં આવ્યું છે. તમામ શરૂઆત બાકીઓ FM000 માં ટ્રાન્સફર થઈ ગઈ છે.
            </Typography>
            <Button variant="contained" onClick={() => setActiveStep(0)}>
              પૂર્ણ
            </Button>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 4 }} className="print-only">
        <PrintSignatures />
      </Box>
    </Box>
  );
}
