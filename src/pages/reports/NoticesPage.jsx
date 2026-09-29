import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Grid, TextField, Button, MenuItem, Typography, Divider,
  Chip, Card, CardContent, InputAdornment
} from '@mui/material';
import {
  Print as PrintIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  LocationCity as VillageIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDate } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';

export default function NoticesPage() {
  const { members, piyatEntries, receipts, villages, fetchMembers, fetchPiyatEntries, fetchReceipts, fetchVillages } = useData();
  const { activeYear, societyInfo } = useApp();

  useEffect(() => {
    fetchMembers(activeYear);
    fetchPiyatEntries(activeYear);
    fetchReceipts(activeYear);
    fetchVillages();
  }, [fetchMembers, fetchPiyatEntries, fetchReceipts, fetchVillages, activeYear]);

  const [noticeType, setNoticeType] = useState('ઉઘરાણી નોટિસ');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [daysLimit, setDaysLimit] = useState(15);
  const [customDueAmount, setCustomDueAmount] = useState('');

  // Filter members by village
  const filteredMembers = useMemo(() => {
    if (selectedVillage === 'all') return members || [];
    return (members || []).filter(
      (m) => (m.village_name_guj || m.villageName) === selectedVillage
    );
  }, [members, selectedVillage]);

  // Set default member when list changes
  useEffect(() => {
    if (filteredMembers.length > 0 && (!selectedMemberId || !filteredMembers.some(m => String(m.id) === String(selectedMemberId)))) {
      setSelectedMemberId(String(filteredMembers[0].id));
    }
  }, [filteredMembers, selectedMemberId]);

  const member = useMemo(() => {
    return (members || []).find((m) => String(m.id) === String(selectedMemberId)) || filteredMembers[0] || {};
  }, [members, selectedMemberId, filteredMembers]);

  // Calculate real member balance
  const calculatedDueAmount = useMemo(() => {
    if (!member?.id) return 0;
    const opBal = Number(member.opening_balance || 0);
    const memBills = (piyatEntries || []).filter(
      (p) => p.member_id === member.id || (p.member_no && p.member_no === member.member_no) || (p.member_code && p.member_code === member.member_code)
    );
    const billAmt = memBills.reduce((s, b) => s + Number(b.total_amount || 0), 0);

    const memRcpt = (receipts || []).filter(
      (r) => r.member_id === member.id || (r.member_no && r.member_no === member.member_no) || (r.member_code && r.member_code === member.member_code)
    );
    const paidAmt = memRcpt.reduce((s, r) => s + Number(r.amount || 0), 0);

    return opBal + billAmt - paidAmt;
  }, [member, piyatEntries, receipts]);

  const effectiveDueAmount = customDueAmount !== '' ? Number(customDueAmount) : Math.max(0, calculatedDueAmount);

  // Build village list
  const villageOptions = useMemo(() => {
    const list = new Set();
    (villages || []).forEach((v) => { if (v.name) list.add(v.name); });
    (members || []).forEach((m) => {
      if (m.village_name_guj) list.add(m.village_name_guj);
      else if (m.villageName) list.add(m.villageName);
    });
    return Array.from(list);
  }, [villages, members]);

  return (
    <Box>
      <PageHeader
        title="ઉઘરાણી નોટિસ અને ખાતા ખાતરી પત્રક"
        subtitle="બાકી પિયાત મહેસુલ વસૂલાત માટે સભાસદોને મોકલવાની સત્તાવાર નોટિસ અને બેલેન્સ કન્ફર્મેશન લેટર"
        actionLabel="નોટિસ પ્રિન્ટ કરો"
        actionIcon={<PrintIcon />}
        onAction={() => window.print()}
      />

      <Paper sx={{ p: 2.5, mb: 3 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="નોટિસ પ્રકાર"
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              size="small"
            >
              <MenuItem value="ઉઘરાણી નોટિસ">પિયાત ઉઘરાણી નોટિસ (Demand Notice)</MenuItem>
              <MenuItem value="ખાતા ખાતરી પત્રક">વાર્ષિક ખાતા ખાતરી પત્રક (Confirmation Slip)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="ગામ ફિલ્ટર"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              size="small"
            >
              <MenuItem value="all">તમામ ગામો</MenuItem>
              {villageOptions.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="સભાસદ પસંદ કરો"
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                setCustomDueAmount('');
              }}
              size="small"
            >
              {filteredMembers.map((m) => (
                <MenuItem key={m.id} value={String(m.id)}>
                  ({m.member_code || m.memberNo}) {m.member_name_guj || m.name} - {m.village_name_guj || m.villageName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label="મુદત (દિવસ)"
              value={daysLimit}
              onChange={(e) => setDaysLimit(Number(e.target.value))}
              size="small"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            icon={<PersonIcon />}
            label={`પસંદ કરેલ સભાસદ: ${member?.member_name_guj || member?.name || '-'}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`ગણતરી મુજબ બાકી લેણાં: ₹ ${calculatedDueAmount.toLocaleString('gu-IN')}`}
            color={calculatedDueAmount > 0 ? 'error' : 'success'}
            variant="filled"
            sx={{ fontWeight: 'bold' }}
          />
          <TextField
            size="small"
            type="number"
            label="બાકી રકમ સુધારો (વૈકલ્પિક)"
            placeholder={String(calculatedDueAmount)}
            value={customDueAmount}
            onChange={(e) => setCustomDueAmount(e.target.value)}
            sx={{ width: 190 }}
          />
        </Box>
      </Paper>

      {/* Official Printed Notice Paper */}
      <Paper sx={{ p: 5, maxWidth: 850, mx: 'auto', border: '1px solid #ddd' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {societyInfo.name}
          </Typography>
          <Typography variant="subtitle1">
            {societyInfo.address}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            નોંધણી નં: {societyInfo.reg_no} | ફોન: {societyInfo.phone}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: noticeType === 'ઉઘરાણી નોટિસ' ? 'error.main' : 'primary.main'
            }}
          >
            {noticeType === 'ઉઘરાણી નોટિસ' ? 'સખત પિયાત પાણી બિલ ઉઘરાણી નોટિસ' : 'વાર્ષિક ખાતા સિલક ખાતરી પત્ર'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="body2">જા. નં: ભારૂંડી/પિયત/નોટિસ/{activeYear}/{(member?.member_code || '૧૦૧')}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">તારીખ: {formatDate(new Date())}</Typography>
          </Box>
        </Box>

        {/* Member Address Block */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body1"><b>પ્રતિશ્રી,</b></Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ pl: 2 }}>
            {member?.member_name_guj || member?.name} (સભાસદ કોડ: {member?.member_code || member?.memberNo})
          </Typography>
          <Typography variant="body2" sx={{ pl: 2 }}>
            મુ. પો.: {member?.village_name_guj || member?.villageName || 'ભારૂંડી'}, બ્લોક / સર્વે નં: {member?.block_no || member?.blockNo || '૧૨/અ'}
          </Typography>
          <Typography variant="body2" sx={{ pl: 2 }}>
            તા. ઓલપાડ, જી. સુરત.
          </Typography>
        </Box>

        {/* Notice Subject & Body */}
        {noticeType === 'ઉઘરાણી નોટિસ' ? (
          <Box sx={{ lineHeight: 1.8 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              વિષય: નાણાકીય વર્ષ {activeYear} ના પિયાત પાણી બિલની બાકી રકમ ભરપાઈ કરવા બાબત.
            </Typography>
            <Typography variant="body1" paragraph>
              જય ભારત સાથે જણાવવાનું કે, આપણી મંડળીના રેકર્ડ મુજબ આપના નામે ચાલુ વર્ષ તથા અગાઉના વર્ષનું પિયાત પાણી બિલ પેટે કુલ <b>₹ {effectiveDueAmount.toLocaleString('gu-IN')}</b> ભરવાના બાકી બોલે છે.
            </Typography>
            <Typography variant="body1" paragraph>
              આ પત્ર મળ્યેથી દિન <b>{daysLimit}</b> ની અંદર સદર રકમ મંડળીની ઓફિસે રૂબરૂ આવીને રોકડેથી જમા કરાવી પહોંચ મેળવી લેવી.
            </Typography>
            <Typography variant="body1" paragraph>
              જો નિયત મુદતમાં રકમ ભરપાઈ નહીં કરવામાં આવે તો મંડળીના પેટા નિયમ અને સહકારી કાયદા મુજબ આગળના પિયતનું પાણી આપવાનું બંધ કરવામાં આવશે તથા કાયદેસરની વસૂલાત કાર્યવાહી હાથ ધરાશે જેની ગંભીર નોંધ લેશો.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ lineHeight: 1.8 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              વિષય: વર્ષ આખરની ખાતા બાકી ચકાસણી અને ખાતરી પત્ર (Balance Confirmation).
            </Typography>
            <Typography variant="body1" paragraph>
              સવિનય જણાવવાનું કે, વર્ષ {activeYear} ના વાર્ષિક ઓડિટ અન્વયે આપના ખાતાની બાકી સિલક <b>₹ {effectiveDueAmount.toLocaleString('gu-IN')} (ઉધાર લેણાં)</b> બોલે છે.
            </Typography>
            <Typography variant="body1" paragraph>
              ઉપરોક્ત રકમ જો આપના ચોપડા મુજબ માન્ય હોય તો નીચે આપેલ સ્લીપમાં આપની સહી કરી મંડળી ઓફિસમાં પરત જમા કરાવશો.
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Official Signatures */}
        <PrintSignatures />

        {noticeType === 'ખાતા ખાતરી પત્રક' && (
          <Box sx={{ mt: 5, p: 2, border: '1px dashed #777', borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', mb: 1 }}>
              -- સભાસદની ખાતરી સ્લીપ (પરત આપવાની) --
            </Typography>
            <Typography variant="body2">
              હું <b>{member?.member_name_guj || member?.name}</b> ખાતરી આપું છું કે મંડળીના ચોપડે બોલતી બાકી રકમ ₹ {effectiveDueAmount.toLocaleString('gu-IN')} મને માન્ય છે.
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Typography variant="body2">_________________________</Typography>
              <Typography variant="caption">સભાસદની સહી / અંગૂઠાનું નિશાન</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
