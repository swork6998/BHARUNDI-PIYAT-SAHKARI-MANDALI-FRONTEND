import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Grid, Card, CardContent,
  Alert, InputAdornment, IconButton
} from '@mui/material';
import {
  VpnKey as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import { useApp } from '../../context/AppContext';

export default function ChangePasswordPage() {
  const { user, showToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('કૃપા કરીને તમામ ખાના ભરો', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('નવો પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા નથી!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ', 'warning');
      return;
    }

    showToast('તમારો લૉગિન પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Box>
      <PageHeader
        title="લૉગિન પાસવર્ડ બદલો"
        subtitle="તમારા વપરાશકર્તા ખાતાની સુરક્ષા માટે નિયમિત પાસવર્ડ બદલો"
      />

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={8} md={6}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <KeyIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">નવો પાસવર્ડ સેટ કરો</Typography>
                <Typography variant="body2" color="text.secondary">
                  વપરાશકર્તા: <b>{user?.username || 'admin'}</b> ({user?.role || 'એડમિનિસ્ટ્રેટર'})
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type={showPass ? 'text' : 'password'}
                label="હાલનો જૂનો પાસવર્ડ"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                sx={{ mb: 2.5 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                type={showPass ? 'text' : 'password'}
                label="નવો પાસવર્ડ દાખલ કરો"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                type={showPass ? 'text' : 'password'}
                label="નવો પાસવર્ડ ફરીથી દાખલ કરો (Confirm)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<SaveIcon />}
                sx={{ height: 48 }}
              >
                પાસવર્ડ બદલો
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
