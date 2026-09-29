import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Alert,
  Tooltip
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const PiyatMultiEntryPage = () => {
  const { members, crops, rates, addPiyatEntry } = useData();
  const { activeYear, activeSeason, showToast, isYearLocked, checkCanModify } = useApp();
  const navigate = useNavigate();

  // પ્રારંભિક ૨ પંક્તિઓ
  const [rows, setRows] = useState([
    {
      id: 1,
      memberId: members[0]?.id || 1,
      blockNo: '૪૫/૧',
      cropId: crops[0]?.id || 1,
      area: 3.0,
      paniCount: 2,
      waterType: 'વહેતા પાણી',
    },
    {
      id: 2,
      memberId: members[1]?.id || 2,
      blockNo: '૮૨',
      cropId: crops[1]?.id || 2,
      area: 2.5,
      paniCount: 2,
      waterType: 'વહેતા પાણી',
    },
  ]);

  const handleAddRow = () => {
    if (!checkCanModify('નવી લાઈન ઉમેરો')) return;
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        memberId: members[0]?.id || 1,
        blockNo: '૧',
        cropId: crops[0]?.id || 1,
        area: 2.0,
        paniCount: 1,
        waterType: 'વહેતા પાણી',
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    if (!checkCanModify('લાઈન દૂર કરો')) return;
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowChange = (id, field, value) => {
    if (isYearLocked) return;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // ગણતરી હેલ્પર
  const calculateRowTotal = (row) => {
    const mem = members.find((m) => m.id === Number(row.memberId));
    const rateObj = rates.find((r) => (r.crop_id || r.cropId) === Number(row.cropId));
    let rate = 300;
    if (rateObj) {
      rate = mem?.category === 'સભાસદ' ? (rateObj.sabhasad_rate || rateObj.sabhasadRate) : (rateObj.nominal_rate || rateObj.nominalRate);
    }
    const base = Number(row.area) * Number(row.paniCount) * (Number(rate) || 300);
    const cess = Math.round(base * 0.2);
    return { rate: Number(rate) || 300, base, cess, total: base + cess };
  };

  const handleSaveAll = () => {
    if (!checkCanModify('તમામ એન્ટ્રી સાચવો')) return;

    rows.forEach((row, index) => {
      const mem = members.find((m) => m.id === Number(row.memberId));
      const crop = crops.find((c) => c.id === Number(row.cropId));
      const { rate, base, cess, total } = calculateRowTotal(row);

      addPiyatEntry({
        entryNo: (Date.now() + index).toString().slice(-4),
        entryDate: new Date().toISOString().split('T')[0],
        year: activeYear,
        season: activeSeason,
        memberId: row.memberId,
        memberNo: mem ? (mem.member_code || mem.memberNo) : '૧',
        memberName: mem ? (mem.name || mem.member_name_guj) : '',
        villageName: mem ? (mem.villageName || mem.village_name_guj) : '',
        category: mem ? mem.category : 'સભાસદ',
        blockNo: row.blockNo,
        cropId: row.cropId,
        cropName: crop ? crop.name : '',
        area: Number(row.area),
        waterType: row.waterType,
        paniCount: Number(row.paniCount),
        rate,
        baseAmount: base,
        cess20: cess,
        totalAmount: total,
        isBilled: false,
        billNo: '',
        billDate: '',
        paidAmount: 0,
        status: 'બિલ બાકી',
      });
    });

    showToast(`કુલ ${rows.length} પિયત એન્ટ્રીઓ સફળતાપૂર્વક સાચવવામાં આવી!`);
    navigate('/piyat/bill-list');
  };

  const totalGridAmount = rows.reduce(
    (sum, r) => sum + calculateRowTotal(r).total,
    0
  );

  return (
    <Box>
      <PageHeader
        title="ઝડપી મલ્ટી પિયત ગ્રીડ એન્ટ્રી (સ્પ્રેડશીટ મોડલ)"
        subtitle="એક સાથે ૨૦ થી ૫૦ ખેડૂતોની પિયત એન્ટ્રીઓ ઝડપથી ટાઈપ કરો (વારંવાર સેવ કર્યા વગર)"
        breadcrumb="પિયત / મલ્ટી એન્ટ્રી"
        icon={<DynamicFormIcon sx={{ fontSize: 28 }} />}
        actions={
          <Box sx={{ display: 'flex', gap: 1.5 }} className="no-print">
            <Button
              variant="outlined"
              color="primary"
              disabled={isYearLocked}
              startIcon={<AddCircleIcon />}
              onClick={handleAddRow}
            >
              નવી રો (લાઈન) ઉમેરો
            </Button>
            <Tooltip title={isYearLocked ? "પાછલું વર્ષ લૉક હોવાથી સાચવી શકાશે નહીં" : ""}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isYearLocked}
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAll}
                >
                  તમામ એન્ટ્રી સાચવો (Batch Save)
                </Button>
              </span>
            </Tooltip>
          </Box>
        }
      />

      {isYearLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2.5 }}>
          <b>પાછલું વર્ષ લૉક છે ({activeYear}):</b> ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. નવી પિયત એન્ટ્રી ઉમેરી શકાશે નહીં.
        </Alert>
      )}

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}>ક્રમ</TableCell>
                <TableCell width={240}>ખેડૂત (સભાસદ)</TableCell>
                <TableCell width={100}>બ્લોક નં</TableCell>
                <TableCell width={160}>પાક</TableCell>
                <TableCell width={100}>વિસ્તાર</TableCell>
                <TableCell width={100}>પાણી ફેરી</TableCell>
                <TableCell width={150}>પદ્ધતિ</TableCell>
                <TableCell align="right" width={90}>દર (₹)</TableCell>
                <TableCell align="right" width={110}>રકમ (₹)</TableCell>
                <TableCell align="center" width={70} className="no-print">કાઢી નાખો</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                const { rate, total } = calculateRowTotal(row);
                return (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontWeight: 700 }}>{idx + 1}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        disabled={isYearLocked}
                        value={row.memberId}
                        onChange={(e) =>
                          handleRowChange(row.id, 'memberId', e.target.value)
                        }
                      >
                        {members.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            ({m.member_code || m.memberNo}) {m.name || m.member_name_guj}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        disabled={isYearLocked}
                        value={row.blockNo}
                        onChange={(e) =>
                          handleRowChange(row.id, 'blockNo', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        disabled={isYearLocked}
                        value={row.cropId}
                        onChange={(e) =>
                          handleRowChange(row.id, 'cropId', e.target.value)
                        }
                      >
                        {crops.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        disabled={isYearLocked}
                        value={row.area}
                        onChange={(e) =>
                          handleRowChange(row.id, 'area', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        disabled={isYearLocked}
                        value={row.paniCount}
                        onChange={(e) =>
                          handleRowChange(row.id, 'paniCount', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        disabled={isYearLocked}
                        value={row.waterType}
                        onChange={(e) =>
                          handleRowChange(row.id, 'waterType', e.target.value)
                        }
                      >
                        <MenuItem value="વહેતા પાણી">વહેતા પાણી</MenuItem>
                        <MenuItem value="મોટર / ઉદવહન">મોટર / ઉદવહન</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹ {rate}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#00695C' }}>
                      ₹ {total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell align="center" className="no-print">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={rows.length <= 1 || isYearLocked}
                        onClick={() => handleRemoveRow(row.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ગ્રીડ સરવાળો બાર */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          કુલ એન્ટ્રીઓ: {rows.length} ખેડૂતો
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#00695C' }}>
          આ બેચનો કુલ સરવાળો: ₹ {totalGridAmount.toLocaleString('en-IN')}
        </Typography>
      </Box>

      {/* સત્તાવાર પ્રિન્ટ સહીઓ */}
      <PrintSignatures />
    </Box>
  );
};

export default PiyatMultiEntryPage;
