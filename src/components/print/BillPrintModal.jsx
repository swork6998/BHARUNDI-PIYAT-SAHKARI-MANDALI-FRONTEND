import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../../context/AppContext';

const BillPrintModal = ({ open, onClose, bill, billData }) => {
  const { societyInfo, activeYear } = useApp();
  const billObj = bill || billData;

  if (!billObj) return null;

  const handlePrint = () => {
    window.print();
  };

  const billNumber = billObj.billNo || billObj.bill_no || billObj.entryNo || billObj.entry_no || (billObj.id ? `B-${billObj.id}` : '-');
  const memberNumber = billObj.memberNo || billObj.member_code || '-';
  const memberName = billObj.memberName || billObj.member_name_guj || billObj.member_name || '-';
  const villageName = billObj.villageName || billObj.village_name_guj || billObj.village || 'ભારૂંડી';
  const billDate = billObj.billDate || billObj.entryDate || billObj.bill_date || billObj.entry_date || '-';
  const season = billObj.season || billObj.season_name || '-';
  const blockNo = billObj.blockNo || billObj.block_no || '૧';
  const category = billObj.category || 'સભાસદ';
  const yearName = billObj.year || billObj.year_name || activeYear || '૨૦૨૪-૨૦૨૫';

  const cropName = billObj.cropName || billObj.crop_name_guj || billObj.crop || '-';
  const waterType = billObj.waterType || billObj.water_type || 'વહેતા પાણી';
  const area = billObj.area ?? billObj.area_vigha ?? 1;
  const paniCount = billObj.paniCount ?? billObj.pani_count ?? 1;
  const rate = billObj.rate ?? 150;
  const baseAmount = billObj.baseAmount ?? billObj.base_amount ?? (area * paniCount * rate);
  const cess20 = billObj.cess20 ?? billObj.cess_20 ?? (baseAmount * 0.2);
  const totalAmount = billObj.totalAmount ?? billObj.total_amount ?? (baseAmount + cess20);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          પિયત પાણી બિલ પ્રિન્ટ પ્રીવ્યૂ
        </Typography>
        <Button startIcon={<CloseIcon />} onClick={onClose} color="inherit">
          બંધ કરો
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }} className="print-page">
        {/* બિલ હેડર */}
        <Box sx={{ textAlign: 'center', mb: 2, borderBottom: '2px double #000', pb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#004D40', letterSpacing: 0.5 }}>
            {societyInfo?.name || 'શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {societyInfo?.subTitle || societyInfo?.address || 'મુ.પો. ભારૂંડી, તા. ગોંડલ, જી. રાજકોટ'} | રજી. નં: {societyInfo?.regNo || societyInfo?.reg_no || '૧૨૩૪'}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700, textDecoration: 'underline' }}>
            પિયત પાણી વપરાશ બિલ / પાવતી (નાણાકીય વર્ષ: {yearName})
          </Typography>
        </Box>

        {/* બિલ અને ખેડૂત વિગત */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: '0.95rem' }}>
          <Box>
            <Typography variant="body2"><strong>બિલ નં:</strong> {billNumber}</Typography>
            <Typography variant="body2"><strong>સભાસદ નં:</strong> {memberNumber}</Typography>
            <Typography variant="body2"><strong>ખેડૂતનું નામ:</strong> {memberName}</Typography>
            <Typography variant="body2"><strong>ગામ:</strong> {villageName}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2"><strong>તારીખ:</strong> {billDate}</Typography>
            <Typography variant="body2"><strong>ઋતુ:</strong> {season}</Typography>
            <Typography variant="body2"><strong>બ્લોક નં:</strong> {blockNo}</Typography>
            <Typography variant="body2"><strong>હોદ્દો:</strong> {category}</Typography>
          </Box>
        </Box>

        {/* પાણી વિગત કોષ્ટક */}
        <Table sx={{ border: '1px solid #000', mb: 2 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f1f5f9' }}>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }}>ક્રમ</TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }}>પાકનું નામ</TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }}>પિયત પદ્ધતિ</TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }} align="right">વિસ્તાર (વીઘા)</TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }} align="right">પાણી ફેરી</TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }} align="right">દર (₹)</TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700 }} align="right">રકમ (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ border: '1px solid #000' }}>૧</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{cropName}</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{waterType}</TableCell>
              <TableCell sx={{ border: '1px solid #000' }} align="right">{area}</TableCell>
              <TableCell sx={{ border: '1px solid #000' }} align="right">{paniCount}</TableCell>
              <TableCell sx={{ border: '1px solid #000' }} align="right">₹ {Number(rate).toFixed(2)}</TableCell>
              <TableCell sx={{ border: '1px solid #000' }} align="right">₹ {Number(baseAmount).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} sx={{ border: '1px solid #000', fontWeight: 600 }} align="right">
                સ્થાનિક પિયત સેસ (૨૦% સરકારી સેસ):
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 600 }} align="right">
                ₹ {Number(cess20).toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell colSpan={6} sx={{ border: '1px solid #000', fontWeight: 800, fontSize: '1rem' }} align="right">
                કુલ ચૂકવવાપાત્ર રકમ:
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 800, fontSize: '1.05rem', color: '#00695C' }} align="right">
                ₹ {Number(totalAmount).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* સૂચનાઓ અને સહી */}
        <Box sx={{ mt: 4, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box sx={{ fontSize: '0.82rem', color: '#475569' }}>
            <Typography variant="caption" display="block">૧. બિલ મળ્યેથી ૧૫ દિવસમાં મંડળી ઓફિસે નાણાં જમા કરાવી રસીદ મેળવી લેવી.</Typography>
            <Typography variant="caption" display="block">૨. ચેક / ડ્રાફ્ટ મંડળીના નામનો જ આપવો.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 6, textAlign: 'center' }}>
            <Box>
              <Box sx={{ height: 40 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, borderTop: '1px dashed #000', px: 2 }}>
                મંત્રી શ્રી ની સહી
              </Typography>
            </Box>
            <Box>
              <Box sx={{ height: 40 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, borderTop: '1px dashed #000', px: 2 }}>
                પ્રમુખ શ્રી ની સહી
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }} className="no-print">
        <Button onClick={onClose} variant="outlined" color="inherit">
          બંધ કરો
        </Button>
        <Button onClick={handlePrint} variant="contained" color="primary" startIcon={<PrintIcon />}>
          બિલ પ્રિન્ટ કરો (A4 / A5)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillPrintModal;
