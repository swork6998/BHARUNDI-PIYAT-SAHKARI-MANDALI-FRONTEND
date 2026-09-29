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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const ShareTransferPage = () => {
  const { members, shares, fetchMembers, fetchShares } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  useEffect(() => {
    if (fetchMembers) fetchMembers();
    if (fetchShares) fetchShares();
  }, [fetchMembers, fetchShares]);

  const [formData, setFormData] = useState({
    fromMemberId: '',
    toMemberId: '',
    certiNo: '',
    shareCount: 10,
    amount: 1000,
    tharavDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (members && members.length > 0 && !formData.fromMemberId) {
      setFormData(prev => ({
        ...prev,
        fromMemberId: members[0]?.id || '',
        toMemberId: members[1]?.id || members[0]?.id || ''
      }));
    }
  }, [members, formData.fromMemberId]);

  useEffect(() => {
    if (shares && shares.length > 0 && !formData.certiNo) {
      setFormData(prev => ({
        ...prev,
        certiNo: shares[0]?.certiNo || shares[0]?.certi_no || ''
      }));
    }
  }, [shares, formData.certiNo]);

  const fromMember = members.find((m) => m.id === Number(formData.fromMemberId));
  const toMember = members.find((m) => m.id === Number(formData.toMemberId));

  const handleTransfer = () => {
    if (!checkCanModify('શેર ફેરબદલ')) return;
    if (formData.fromMemberId === formData.toMemberId) {
      showToast('શેર આપનાર અને લેનાર ખેડૂત એક જ હોઈ શકે નહીં.', 'warning');
      return;
    }
    showToast('શેર ફેરબદલ (ટ્રાન્સફર) સફળતાપૂર્વક પૂર્ણ થઈ!');
  };

  return (
    <Box>
      <PageHeader
        title="શેર ફેરબદલ નોંધણી (Share Transfer Entry)"
        subtitle="એક સભાસદ પાસેથી બીજા સભાસદને શેર ટ્રાન્સફર કરવાની સત્તાવાર પ્રક્રિયા"
        breadcrumb="શેર / શેર ફેરબદલ"
        icon={<SwapHorizIcon sx={{ fontSize: 28 }} />}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5, maxWidth: 850 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. શેર ફેરબદલ અમાન્ય છે.
        </Alert>
      )}

      <Card sx={{ maxWidth: 850, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Grid container spacing={3}>
            {/* આપનાર સભાસદ */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mb: 1.5 }}>
                  શેર આપનાર ખેડૂત (Transferor):
                </Typography>
                <TextField
                  select
                  label="આપનાર સભાસદ"
                  fullWidth
                  size="small"
                  disabled={isYearLocked}
                  value={formData.fromMemberId}
                  onChange={(e) => setFormData({ ...formData, fromMemberId: e.target.value })}
                >
                  {members.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      ({m.member_code || m.memberNo}) {m.name || m.member_name_guj}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#64748b' }}>
                  વર્તમાન શેર: {fromMember?.sharesCount || fromMember?.shares_count || 10} શેર (₹ {fromMember?.share_balance || fromMember?.shareAmount || 1000})
                </Typography>
              </Box>
            </Grid>

            {/* મેળવનાર સભાસદ */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a', mb: 1.5 }}>
                  શેર મેળવનાર ખેડૂત (Transferee):
                </Typography>
                <TextField
                  select
                  label="મેળવનાર સભાસદ"
                  fullWidth
                  size="small"
                  disabled={isYearLocked}
                  value={formData.toMemberId}
                  onChange={(e) => setFormData({ ...formData, toMemberId: e.target.value })}
                >
                  {members.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      ({m.member_code || m.memberNo}) {m.name || m.member_name_guj}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#64748b' }}>
                  વર્તમાન શેર: {toMember?.sharesCount || toMember?.shares_count || 10} શેર (₹ {toMember?.share_balance || toMember?.shareAmount || 1000})
                </Typography>
              </Box>
            </Grid>

            {/* ટ્રાન્સફર વિગતો */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="શેર પ્રમાણપત્ર પસંદ કરો"
                fullWidth
                size="small"
                disabled={isYearLocked}
                value={formData.certiNo}
                onChange={(e) => setFormData({ ...formData, certiNo: e.target.value })}
              >
                {(shares || []).map((s) => (
                  <MenuItem key={s.id} value={s.certi_no || s.certiNo}>
                    {s.certi_no || s.certiNo} (કુલ {s.share_count || s.shareCount || s.count} શેર)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="ફેરબદલ કરવાના શેરની સંખ્યા"
                type="number"
                fullWidth
                size="small"
                disabled={isYearLocked}
                value={formData.shareCount}
                onChange={(e) => setFormData({ ...formData, shareCount: Number(e.target.value), amount: Number(e.target.value) * 100 })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="ટ્રાન્સફર મૂડી રકમ (₹)"
                fullWidth
                size="small"
                disabled
                value={`₹ ${formData.amount}`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="મંડળી ઠરાવ તારીખ"
                type="date"
                fullWidth
                size="small"
                disabled={isYearLocked}
                InputLabelProps={{ shrink: true }}
                value={formData.tharavDate}
                onChange={(e) => setFormData({ ...formData, tharavDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} className="no-print">
              <Divider sx={{ my: 1 }} />
              <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી શેર ફેરબદલ શક્ય નથી" : ""}>
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isYearLocked}
                    startIcon={<SwapHorizIcon />}
                    onClick={handleTransfer}
                    sx={{ px: 4, py: 1 }}
                  >
                    શેર ફેરબદલ મંજૂર કરો (Confirm Transfer)
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

export default ShareTransferPage;
