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
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const MemberFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const {
    members,
    villages,
    canals,
    subCanals,
    addMember,
    updateMember,
    fetchVillages,
    fetchCanals,
    fetchMembers
  } = useData();
  const { showNotification, isYearLocked, activeYear } = useApp();

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchVillages();
    fetchCanals();
    fetchMembers();
  }, [fetchVillages, fetchCanals, fetchMembers]);

  // મુખ્ય ફોર્મ સ્ટેટ
  const [formData, setFormData] = useState({
    memberNo: (members?.length ? members.length + 1 : 1).toString(),
    name: '',
    fatherName: '',
    villageId: villages[0]?.id || 1,
    category: 'સભાસદ',
    phone: '',
    status: 'ચાલુ',
    joinDate: new Date().toISOString().split('T')[0],
    sharesCount: 10,
    shareAmount: 1000,
    openingBalance: 0,
    balanceType: 'જમા',
    bankName: '',
    bankAcNo: '',
    ifsc: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineeAge: '',
    blocks: [
      { id: Date.now(), blockNo: '૧', surveyNo: '', area: 2.0, canal: canals[0]?.name || '', subCanal: '', cultivator: 'પોતે' },
    ],
  });

  useEffect(() => {
    if (isEdit) {
      const existing = members.find((m) => m.id === Number(id));
      if (existing) {
        setFormData({
          ...existing,
          villageId: existing.village_id || existing.villageId || 1,
          memberNo: existing.member_no || existing.memberNo || '',
          fatherName: existing.father_name || existing.fatherName || '',
          joinDate: existing.join_date ? existing.join_date.split('T')[0] : existing.joinDate || '',
          sharesCount: existing.shares_count ?? existing.sharesCount ?? 10,
          shareAmount: existing.share_amount ?? existing.shareAmount ?? 1000,
          openingBalance: existing.opening_balance ?? existing.openingBalance ?? 0,
          balanceType: existing.balance_type || existing.balanceType || 'જમા',
          bankName: existing.bank_name || existing.bankName || '',
          bankAcNo: existing.bank_ac_no || existing.bankAcNo || '',
          nomineeName: existing.nominee_name || existing.nomineeName || '',
          nomineeRelation: existing.nominee_relation || existing.nomineeRelation || '',
          nomineeAge: existing.nominee_age || existing.nomineeAge || '',
          blocks: existing.blocks || [],
        });
      } else {
        // Fetch from API directly if not found in state
        fetch(`http://localhost:5000/api/members/${id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const m = data.data;
              setFormData({
                ...m,
                villageId: m.village_id || 1,
                memberNo: m.member_no || '',
                fatherName: m.father_name || '',
                joinDate: m.join_date ? m.join_date.split('T')[0] : '',
                sharesCount: m.shares_count ?? 10,
                shareAmount: m.share_amount ?? 1000,
                openingBalance: m.opening_balance ?? 0,
                balanceType: m.balance_type || 'જમા',
                bankName: m.bank_name || '',
                bankAcNo: m.bank_ac_no || '',
                nomineeName: m.nominee_name || '',
                nomineeRelation: m.nominee_relation || '',
                nomineeAge: m.nominee_age || '',
                blocks: m.blocks || [],
              });
            }
          })
          .catch(err => console.error('Error fetching member:', err));
      }
    }
  }, [id, isEdit, members]);

  // જમીન બ્લોક હેન્ડલર
  const handleAddBlock = () => {
    setFormData((prev) => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        { id: Date.now(), blockNo: '', surveyNo: '', area: 1.0, canal: canals[0]?.name || '', subCanal: '', cultivator: 'પોતે' },
      ],
    }));
  };

  const handleRemoveBlock = (blockId) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
  };

  const handleBlockChange = (blockId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)),
    }));
  };

  const handleSave = async () => {
    if (isYearLocked) {
      showNotification(`પાછલું વર્ષ (${activeYear}) લૉક હોવાથી ફેરફાર સાચવી શકાતો નથી.`, 'warning');
      return;
    }

    if (!formData.name || !formData.memberNo) {
      showNotification('કૃપા કરીને સભાસદ નંબર અને નામ દાખલ કરો.', 'warning');
      return;
    }

    const selectedVillage = villages.find((v) => v.id === Number(formData.villageId));
    const payload = {
      ...formData,
      villageName: selectedVillage ? selectedVillage.name : '',
    };

    try {
      if (isEdit) {
        const res = await updateMember(Number(id), payload);
        if (res && res.success) {
          showNotification('સભાસદ માહિતી સફળતાપૂર્વક સુધારી લેવાઈ!', 'success');
          navigate('/members/list');
        } else {
          showNotification(res?.message || 'સભાસદ સુધારવામાં ભૂલ આવી.', 'error');
        }
      } else {
        const res = await addMember(payload);
        if (res && res.success) {
          showNotification('નવા સભાસદ સફળતાપૂર્વક નોંધાયા!', 'success');
          navigate('/members/list');
        } else {
          showNotification(res?.message || 'સભાસદ ઉમેરવામાં ભૂલ આવી.', 'error');
        }
      }
    } catch (e) {
      showNotification('ભૂલ: ' + e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'સભાસદ વિગત સુધારો' : 'નવા સભાસદ નોંધણી ફોર્મ'}
        subtitle="સભાસદની વ્યક્તિગત, જમીન/બ્લોક, અને બેંક વારસદાર વિગતો દાખલ કરો"
        breadcrumb={isEdit ? 'સભાસદ / સુધારો' : 'સભાસદ / નવી નોંધણી'}
        icon={<PersonAddIcon sx={{ fontSize: 28 }} />}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/members/list')}
          >
            પાછા જાઓ
          </Button>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" sx={{ mb: 2.5, fontWeight: 'bold' }} className="no-print">
          પાછલું નાણાકીય વર્ષ ({activeYear}) લૉક કરેલું હોવાથી સભાસદ વિગતમાં કોઈ ફેરફાર કે નવો સભાસદ ઉમેરી શકાશે નહીં. ફક્ત વિગતો વાંચવા અને પ્રિન્ટ કરવા માટે ઉપલબ્ધ છે.
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }} className="no-print">
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="૧. સામાન્ય & સભ્યપદ વિગત" sx={{ fontWeight: 600 }} />
            <Tab label="૨. જમીન અને બ્લોક વિગત" sx={{ fontWeight: 600 }} />
            <Tab label="૩. બેંક & વારસદાર વિગત" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* ટેબ ૧: સામાન્ય & સભ્યપદ વિગત */}
          {activeTab === 0 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="સભાસદ નંબર (Member No)"
                  fullWidth
                  value={formData.memberNo}
                  onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label="સભાસદનું પૂરું નામ (ગુજરાતીમાં)"
                  fullWidth
                  placeholder="દા.ત. પટેલ રમેશભાઈ વલ્લભભાઈ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="પિતા / પતિનું નામ"
                  fullWidth
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="ગામ પસંદ કરો"
                  fullWidth
                  value={formData.villageId}
                  onChange={(e) => setFormData({ ...formData, villageId: e.target.value })}
                >
                  {villages.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name} ({v.taluka})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="સભ્યપદ શ્રેણી"
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="સભાસદ">સભાસદ (Member)</MenuItem>
                  <MenuItem value="નોમિનલ (બિન-સભાસદ)">નોમિનલ (Non-Member)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="મોબાઈલ નંબર"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="જોડાણ તારીખ"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="શરૂઆત બાકી રકમ (₹)"
                  type="number"
                  fullWidth
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="બાકી પ્રકાર (Balance Type)"
                  fullWidth
                  value={formData.balanceType}
                  onChange={(e) => setFormData({ ...formData, balanceType: e.target.value })}
                >
                  <MenuItem value="જમા">જમા (એડવાન્સ જમા)</MenuItem>
                  <MenuItem value="ઉધાર">ઉધાર (ખેડૂત પાસેથી લેણાં)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="ખાતા સ્થિતિ"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="ચાલુ">ચાલુ (Active)</MenuItem>
                  <MenuItem value="બંધ">બંધ (Inactive)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}

          {/* ટેબ ૨: જમીન અને બ્લોક વિગત */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#004D40' }}>
                  ખેતી જમીન, બ્લોક નંબર અને નહેર વિગત
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddBlock}
                >
                  નવો બ્લોક ઉમેરો
                </Button>
              </Box>

              <Table sx={{ border: '1px solid #e2e8f0', mb: 2 }}>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell>બ્લોક નં</TableCell>
                    <TableCell>સર્વે નં</TableCell>
                    <TableCell>વિસ્તાર (વીઘા)</TableCell>
                    <TableCell>મુખ્ય નહેર</TableCell>
                    <TableCell>ખેડનારનું નામ</TableCell>
                    <TableCell align="center">ક્રિયા</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.blocks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={b.blockNo}
                          onChange={(e) => handleBlockChange(b.id, 'blockNo', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={b.surveyNo}
                          onChange={(e) => handleBlockChange(b.id, 'surveyNo', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={b.area}
                          onChange={(e) => handleBlockChange(b.id, 'area', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={b.canal || canals[0]?.name}
                          onChange={(e) => handleBlockChange(b.id, 'canal', e.target.value)}
                          sx={{ minWidth: 160 }}
                        >
                          {canals.map((c) => (
                            <MenuItem key={c.id} value={c.name}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={b.cultivator}
                          onChange={(e) => handleBlockChange(b.id, 'cultivator', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={formData.blocks.length <= 1}
                          onClick={() => handleRemoveBlock(b.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* ટેબ ૩: બેંક & વારસદાર વિગત */}
          {activeTab === 2 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#004D40', mb: 1 }}>
                  બેંક ખાતાની વિગત (ડિવિડન્ડ અને પેમેન્ટ માટે)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="બેંકનું નામ"
                  fullWidth
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="ખાતા નંબર (A/C No)"
                  fullWidth
                  value={formData.bankAcNo}
                  onChange={(e) => setFormData({ ...formData, bankAcNo: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="IFSC કોડ"
                  fullWidth
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#004D40', mb: 1 }}>
                  વારસદાર (નોમિની) ની વિગત
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="વારસદારનું પૂરું નામ"
                  fullWidth
                  value={formData.nomineeName}
                  onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="સંબંધ (Relation)"
                  fullWidth
                  placeholder="પત્ની / પુત્ર / પુત્રી"
                  value={formData.nomineeRelation}
                  onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="ઉંમર (વર્ષ)"
                  type="number"
                  fullWidth
                  value={formData.nomineeAge}
                  onChange={(e) => setFormData({ ...formData, nomineeAge: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {/* સેવ બટન બાર */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 2 }} className="no-print">
            <Button variant="outlined" color="inherit" onClick={() => navigate('/members/list')}>
              રદ કરો
            </Button>
            <Tooltip title={isYearLocked ? `પાછલું વર્ષ (${activeYear}) લૉક હોવાથી સાચવી શકાશે નહીં.` : ''}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}
                  disabled={isYearLocked}
                  onClick={handleSave}
                >
                  સભાસદ વિગત સાચવો (Save Member)
                </Button>
              </span>
            </Tooltip>
          </Box>

          <PrintSignatures />
        </CardContent>
      </Card>
    </Box>
  );
};

export default MemberFormPage;
