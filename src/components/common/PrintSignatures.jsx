import React from 'react';
import { Box, Typography } from '@mui/material';

export default function PrintSignatures() {
  return (
    <Box
      className="print-only print-signatures"
      sx={{
        display: 'none',
        mt: 4,
        pt: 2,
        justifyContent: 'space-between',
        width: '100%'
      }}
    >
      <Box sx={{ textAlign: 'center', width: '22%', borderTop: '1px solid #000', pt: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '9pt', color: '#000' }}>
          તૈયાર કરનાર ક્લાર્ક
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', width: '22%', borderTop: '1px solid #000', pt: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '9pt', color: '#000' }}>
          તપાસનાર હિસાબનીશ
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', width: '22%', borderTop: '1px solid #000', pt: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '9pt', color: '#000' }}>
          માનદ મંત્રીશ્રી
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', width: '22%', borderTop: '1px solid #000', pt: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '9pt', color: '#000' }}>
          પ્રમુખશ્રી
        </Typography>
      </Box>
    </Box>
  );
}
