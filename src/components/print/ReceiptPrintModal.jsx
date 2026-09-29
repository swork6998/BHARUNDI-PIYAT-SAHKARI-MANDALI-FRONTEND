import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../../context/AppContext';

const ReceiptPrintModal = ({ open, onClose, receipt }) => {
  const { societyInfo } = useApp();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          રોકડ રસીદ પહોંચ પ્રિન્ટ
        </Typography>
        <Button startIcon={<CloseIcon />} onClick={onClose} color="inherit">
          બંધ કરો
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }} className="print-page">
        <Box sx={{ border: '2px solid #004D40', p: 2.5, borderRadius: 2 }}>
          {/* મથાળું */}
          <Box sx={{ textAlign: 'center', mb: 1.5, borderBottom: '1px solid #004D40', pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#004D40' }}>
              {societyInfo.name}
            </Typography>
            <Typography variant="caption" display="block">
              {societyInfo.subTitle} | રજી. નં: {societyInfo.regNo}
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 700, bgcolor: '#e6fffa', py: 0.2 }}>
              રોકડ રસીદ / પહોંચ (RECEIPT)
            </Typography>
          </Box>

          {/* રસીદ વિગત */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2"><strong>રસીદ નં:</strong> {receipt.receiptNo}</Typography>
            <Typography variant="body2"><strong>તારીખ:</strong> {receipt.date}</Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>સભાસદ નં:</strong> {receipt.memberNo} | <strong>નામ:</strong> {receipt.memberName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>ગામ:</strong> {receipt.villageName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>ચૂકવણી પદ્ધતિ:</strong> {receipt.payMode}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>વિગત / શેરો:</strong> {receipt.narration}
            </Typography>
          </Box>

          {/* રકમ બોક્સ */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              my: 2,
              bgcolor: '#f1f5f9',
              border: '1px dashed #004D40',
              borderRadius: 1.5,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              મળેલ કુલ રકમ:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#00695C' }}>
              ₹ {Number(receipt.amount).toLocaleString('en-IN')}/-
            </Typography>
          </Box>

          {/* સહી */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ borderTop: '1px dashed #000', px: 2, pt: 0.5 }}>
                નાણાં આપનારની સહી
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ borderTop: '1px dashed #000', px: 2, pt: 0.5 }}>
                નાણાં સ્વીકારનાર / મંત્રી શ્રી
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }} className="no-print">
        <Button onClick={onClose} variant="outlined" color="inherit">
          રદ કરો
        </Button>
        <Button onClick={handlePrint} variant="contained" color="primary" startIcon={<PrintIcon />}>
          રસીદ પ્રિન્ટ કરો
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptPrintModal;
