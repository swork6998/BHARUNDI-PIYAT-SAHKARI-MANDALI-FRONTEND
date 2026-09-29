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
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

const ShareReturnPage = () => {
  const { members, shares, fetchMembers, fetchShares } = useData();
  const { showToast, activeYear, isYearLocked, checkCanModify } = useApp();

  useEffect(() => {
    if (fetchMembers) fetchMembers();
    if (fetchShares) fetchShares();
  }, [fetchMembers, fetchShares]);

  const [formData, setFormData] = useState({
    memberId: '',
    certiNo: '',
    returnCount: 10,
    refundAmount: 1000,
    returnDate: new Date().toISOString().split('T')[0],
    reason: 'સભ્યપદ રાજીનામું',
  });

  useEffect(() => {
    if (members && members.length > 0 && !formData.memberId) {
      setFormData(prev => ({
        ...prev,
        memberId: members[0]?.id || ''
      }));
    }
  }, [members, formData.memberId]);

  useEffect(() => {
    if (shares && shares.length > 0 && !formData.certiNo) {
      setFormData(prev => ({
        ...prev,
        certiNo: shares[0]?.certiNo || shares[0]?.certi_no || ''
      }));
    }
  }, [shares, formData.certiNo]);

  const handleReturn = () => {
    if (!checkCanModify('શેર પરત')) return;
    showToast('શેર પરત / રદ કરવાની નોંધણી સફળતાપૂર્વક થઈ!');
  };

  return (
    <Box>
      <PageHeader
        title="શેર પરત / રદ નોંધણી (Share Surrender / Return)"
        subtitle="સભાસદ રાજીનામું આપે ત્યારે શેર મૂડી પરત કરી પ્રમાણપત્ર રદ કરવાની પ્રક્રિયા"
        breadcrumb="શેર / શેર પરત"
        icon={<AssignmentReturnIcon sx={{ fontSize: 28 }} />}
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5, maxWidth: 750 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. શેર પરત અથવા રદ કરવાની નોંધણી શક્ય નથી.
        </Alert>
      )}

      <Card sx={{ maxWidth: 750, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="સભાસદ પસંદ કરો"
                fullWidth
                disabled={isYearLocked}
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              >
                {members.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    ({m.member_code || m.memberNo}) {m.name || m.member_name_guj}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="શેર પ્રમાણપત્ર પસંદ કરો"
                fullWidth
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
                label="પરત કરવાના શેર સંખ્યા"
                type="number"
                fullWidth
                disabled={isYearLocked}
                value={formData.returnCount}
                onChange={(e) => setFormData({ ...formData, returnCount: Number(e.target.value), refundAmount: Number(e.target.value) * 100 })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="પરત ચૂકવવાપાત્ર રકમ (₹)"
                fullWidth
                disabled
                value={`₹ ${formData.refundAmount}`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="પરત તારીખ"
                type="date"
                fullWidth
                disabled={isYearLocked}
                InputLabelProps={{ shrink: true }}
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="શેર પરત કરવાનું કારણ"
                fullWidth
                disabled={isYearLocked}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} className="no-print">
              <Divider sx={{ my: 1.5 }} />
              <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી શેર પરત નોંધણી શક્ય નથી" : ""}>
                <span>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    disabled={isYearLocked}
                    startIcon={<AssignmentReturnIcon />}
                    onClick={handleReturn}
                    sx={{ px: 4, py: 1 }}
                  >
                    શેર પરત મંજૂર કરો (Confirm Surrender)
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

export default ShareReturnPage;
