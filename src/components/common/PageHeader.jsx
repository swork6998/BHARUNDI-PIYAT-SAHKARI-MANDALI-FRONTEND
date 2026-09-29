import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Chip, Button, Tooltip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import PrintIcon from '@mui/icons-material/Print';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const PageHeader = ({
  title,
  subtitle,
  icon,
  actions,
  actionLabel,
  actionIcon,
  onAction,
  breadcrumb,
  showPrint = true,
  onPrint = null
}) => {
  const navigate = useNavigate();
  const { societyInfo, activeYear, isYearLocked } = useApp();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <>
      {/* ૧. સત્તાવાર પ્રિન્ટ હેડર (Official Print Letterhead - ફક્ત પ્રિન્ટ કરતી વખતે જ દેખાશે) */}
      <Box
        className="print-only"
        sx={{
          display: 'none',
          mb: 3,
          pb: 1.5,
          borderBottom: '2px solid #000',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '18pt', color: '#000', mb: 0.5 }}>
          {societyInfo?.name || 'શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '10.5pt', color: '#222' }}>
          {societyInfo?.sub_title || 'તા. ઓલપાડ, જી. સુરત (ગુજરાત)'} | નોંધણી નં: {societyInfo?.reg_no || 'સુરત / પીવાયટી / ૧૪૨૮૫ / ૧૯૮૫'}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', fontSize: '9pt', color: '#444', mt: 0.2 }}>
          પ્રમુખશ્રી: {societyInfo?.pramukh || 'રમેશભાઈ પટેલ'} | મંત્રીશ્રી: {societyInfo?.mantri || 'દિનેશભાઈ ચૌધરી'} | ફોન: {societyInfo?.phone || '૦૨૬૧-૨૪૫૬૮૯'}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.5,
            pt: 0.8,
            borderTop: '1px dashed #666',
            fontSize: '10pt',
            fontWeight: 700,
            color: '#000'
          }}
        >
          <span>અહેવાલ / પત્રક: {title}</span>
          <span>નાણાકીય વર્ષ: {activeYear}</span>
          <span>પ્રિન્ટ તારીખ: {new Date().toLocaleDateString('gu-IN')} {new Date().toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </Box>
      </Box>

      {/* ૨. સ્ક્રીન પર દેખાતું હેડર (Screen Page Header) */}
      <Box
        className="no-print"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
          p: { xs: 1.5, sm: 2.5 },
          bgcolor: '#ffffff',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, minWidth: 0, width: '100%' }}>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: 2,
                bgcolor: 'rgba(0, 105, 92, 0.1)',
                color: '#00695C',
                flexShrink: 0
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94a3b8' }} />}
              sx={{ mb: 0.5 }}
            >
              <Link
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', fontSize: { xs: '0.75rem', sm: '0.82rem' } }}
                onClick={() => navigate('/')}
              >
                <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                મુખપૃષ્ઠ
              </Link>
              {breadcrumb && (
                <Typography sx={{ color: '#00695C', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.82rem' } }}>
                  {breadcrumb}
                </Typography>
              )}
            </Breadcrumbs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                {title}
              </Typography>
              {isYearLocked && (
                <Tooltip title="આ પાછલું વર્ષ છે. ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. ફેરફાર શક્ય નથી.">
                  <Chip
                    icon={<LockIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
                    label="પાછલું વર્ષ (લૉક)"
                    size="small"
                    sx={{
                      bgcolor: '#d32f2f',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 22
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            {subtitle && (
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.78rem', sm: '0.85rem' }, mt: 0.3 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ઍક્શન બટનો અને પ્રિન્ટ બટન */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          {actionLabel && (
            <Button
              variant="contained"
              color="primary"
              startIcon={actionIcon}
              onClick={onAction}
              size="small"
              sx={{ flexGrow: { xs: 1, sm: 0 }, py: { xs: 0.8, sm: 0.8 } }}
            >
              {actionLabel}
            </Button>
          )}

          {actions}

          {showPrint && (
            <Tooltip title="આ પૃષ્ઠ / પત્રક પ્રિન્ટ કરો અથવા PDF તરીકે સાચવો">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                size="small"
                sx={{
                  fontWeight: 600,
                  borderColor: '#00695C',
                  color: '#00695C',
                  flexGrow: { xs: 1, sm: 0 },
                  py: { xs: 0.8, sm: 0.8 },
                  '&:hover': { bgcolor: 'rgba(0,105,92,0.08)', borderColor: '#004d40' }
                }}
              >
                પ્રિન્ટ / PDF
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PageHeader;
