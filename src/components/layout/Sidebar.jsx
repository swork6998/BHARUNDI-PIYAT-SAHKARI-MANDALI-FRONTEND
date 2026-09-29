import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Box, Divider, Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  PriceChange as PriceChangeIcon,
  WaterDrop as WaterDropIcon,
  PieChart as PieChartIcon,
  AccountBalance as AccountBalanceIcon,
  ReceiptLong as ReceiptLongIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  CalendarMonth,
  LocationCity,
  Waves,
  Grass,
  AccountBalanceWallet,
  MenuBook,
  Print,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

export default function Sidebar({ open, onClose }) {
  const navigate = useLocation();
  const routerNavigate = useNavigate();
  const currentPath = navigate.pathname;

  const [expandedMenu, setExpandedMenu] = useState({
    masters: currentPath.startsWith('/masters'),
    members: currentPath.startsWith('/members'),
    piyat: currentPath.startsWith('/piyat'),
    shares: currentPath.startsWith('/shares'),
    accounts: currentPath.startsWith('/accounts'),
    transactions: currentPath.startsWith('/transactions'),
    reports: currentPath.startsWith('/reports'),
    utilities: currentPath.startsWith('/utilities')
  });

  const toggleSection = (key) => {
    setExpandedMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNav = (path) => {
    routerNavigate(path);
    if (window.innerWidth < 900 && onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#ffffff',
          borderRight: '1px solid #e0e6e0'
        }
      }}
    >
      <Toolbar />
      <Box sx={{ overflowY: 'auto', py: 1 }}>
        <List component="nav" dense>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton
              selected={currentPath === '/'}
              onClick={() => handleNav('/')}
              sx={{
                '&.Mui-selected': { bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 'bold' }
              }}
            >
              <ListItemIcon sx={{ color: currentPath === '/' ? 'primary.main' : 'inherit' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="મુખપૃષ્ઠ (Dashboard)" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* ૧. માસ્ટર્સ સંચાલન */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('masters')}>
              <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
              <ListItemText primary="૧. માસ્ટર્સ સંચાલન" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.masters ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.masters} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/masters/year'} onClick={() => handleNav('/masters/year')}>
                <ListItemText primary="• નાણાકીય વર્ષ માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/company'} onClick={() => handleNav('/masters/company')}>
                <ListItemText primary="• મંડળી પ્રોફાઇલ માહિતી" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/villages'} onClick={() => handleNav('/masters/villages')}>
                <ListItemText primary="• ગામ માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/canals'} onClick={() => handleNav('/masters/canals')}>
                <ListItemText primary="• કેનાલ / નહેર માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/sub-canals'} onClick={() => handleNav('/masters/sub-canals')}>
                <ListItemText primary="• પેટા કેનાલ / કાંસ માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/crops'} onClick={() => handleNav('/masters/crops')}>
                <ListItemText primary="• પાક માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/seasons'} onClick={() => handleNav('/masters/seasons')}>
                <ListItemText primary="• ઋતુ માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/masters/banks'} onClick={() => handleNav('/masters/banks')}>
                <ListItemText primary="• બેંક માસ્ટર" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૨. સભાસદ સંચાલન */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('members')}>
              <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="૨. સભાસદ સંચાલન" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.members ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.members} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/members'} onClick={() => handleNav('/members')}>
                <ListItemText primary="• સભાસદ યાદી" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/members/new'} onClick={() => handleNav('/members/new')}>
                <ListItemText primary="• નવો સભાસદ ફોર્મ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/members/land'} onClick={() => handleNav('/members/land')}>
                <ListItemText primary="• જમીન & કેનાલ વિગત" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/members/opening'} onClick={() => handleNav('/members/opening')}>
                <ListItemText primary="• સભાસદ શરૂઆત બાકી" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૩. ભાવ પત્રક દર */}
          <ListItem disablePadding>
            <ListItemButton selected={currentPath === '/rates'} onClick={() => handleNav('/rates')}>
              <ListItemIcon><PriceChangeIcon color="secondary" /></ListItemIcon>
              <ListItemText primary="૩. ભાવ પત્રક દર (Bhav Patrak)" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>

          {/* ૪. પિયાત અને બિલિંગ */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('piyat')}>
              <ListItemIcon><WaterDropIcon color="info" /></ListItemIcon>
              <ListItemText primary="૪. પિયાત કામગીરી & બિલિંગ" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.piyat ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.piyat} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/piyat/single'} onClick={() => handleNav('/piyat/single')}>
                <ListItemText primary="• સિંગલ પિયાત એન્ટ્રી (૨૦% સેસ)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/piyat/multi'} onClick={() => handleNav('/piyat/multi')}>
                <ListItemText primary="• મલ્ટીપલ એન્ટ્રી ગ્રીડ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/piyat/generate-bills'} onClick={() => handleNav('/piyat/generate-bills')}>
                <ListItemText primary="• બિલ જનરેશન પ્રક્રિયા" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/piyat/bills'} onClick={() => handleNav('/piyat/bills')}>
                <ListItemText primary="• પિયાત બિલો યાદી & પ્રિન્ટ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/piyat/reports'} onClick={() => handleNav('/piyat/reports')}>
                <ListItemText primary="• પિયાત આકારણી અહેવાલો" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૫. શેર મૂડી અને ડિવિડન્ડ */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('shares')}>
              <ListItemIcon><PieChartIcon color="warning" /></ListItemIcon>
              <ListItemText primary="૫. શેર મૂડી & ડિવિડન્ડ" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.shares ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.shares} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/shares/entry'} onClick={() => handleNav('/shares/entry')}>
                <ListItemText primary="• શેર ફાળવણી એન્ટ્રી" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/shares/transfer'} onClick={() => handleNav('/shares/transfer')}>
                <ListItemText primary="• શેર ફેરબદલ (Transfer)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/shares/return'} onClick={() => handleNav('/shares/return')}>
                <ListItemText primary="• શેર પરત / રદ્દીકરણ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/shares/ledger'} onClick={() => handleNav('/shares/ledger')}>
                <ListItemText primary="• શેર રજીસ્ટર & લેજર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/shares/dividend'} onClick={() => handleNav('/shares/dividend')}>
                <ListItemText primary="• શેર ડિવિડન્ડ પત્રક" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૬. ખાતાવહી માસ્ટર્સ */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('accounts')}>
              <ListItemIcon><AccountBalanceIcon color="primary" /></ListItemIcon>
              <ListItemText primary="૬. ખાતાવહી માસ્ટર્સ" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.accounts ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.accounts} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/accounts/groups'} onClick={() => handleNav('/accounts/groups')}>
                <ListItemText primary="• ખાતા ગ્રુપ માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/accounts/general'} onClick={() => handleNav('/accounts/general')}>
                <ListItemText primary="• જનરલ ખાતાવહી (Hdmst)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/accounts/sub'} onClick={() => handleNav('/accounts/sub')}>
                <ListItemText primary="• પેટા ખાતાવહી (Famst)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/accounts/receipt-books'} onClick={() => handleNav('/accounts/receipt-books')}>
                <ListItemText primary="• રસીદ બુક માસ્ટર" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/accounts/opening'} onClick={() => handleNav('/accounts/opening')}>
                <ListItemText primary="• ખાતા શરૂઆત બાકી (FM000)" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૭. વ્યવહારો અને રોજમેળ */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('transactions')}>
              <ListItemIcon><ReceiptLongIcon color="success" /></ListItemIcon>
              <ListItemText primary="૭. વ્યવહારો & રોજમેળ" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.transactions ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.transactions} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/transactions/receipt'} onClick={() => handleNav('/transactions/receipt')}>
                <ListItemText primary="• રોકડ રસીદ એન્ટ્રી" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/transactions/voucher'} onClick={() => handleNav('/transactions/voucher')}>
                <ListItemText primary="• વાઉચર એન્ટ્રી (ચૂકવણી/કોન્ટ્રા)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/transactions/rojmel'} onClick={() => handleNav('/transactions/rojmel')}>
                <ListItemText primary="• દૈનિક રોજમેળ (Day Book)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/transactions/rojmel-edit'} onClick={() => handleNav('/transactions/rojmel-edit')}>
                <ListItemText primary="• રોજમેળ સુધારો & રદ્દીકરણ" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૮. નાણાકીય અહેવાલો */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('reports')}>
              <ListItemIcon><AssessmentIcon color="secondary" /></ListItemIcon>
              <ListItemText primary="૮. નાણાકીય અહેવાલો" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.reports ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.reports} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/reports/rojmel'} onClick={() => handleNav('/reports/rojmel')}>
                <ListItemText primary="• રોજમેળ પત્રક પ્રિન્ટ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/ledger'} onClick={() => handleNav('/reports/ledger')}>
                <ListItemText primary="• મુખ્ય ખાતાવહી (Ledger)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/member-ledger'} onClick={() => handleNav('/reports/member-ledger')}>
                <ListItemText primary="• સભાસદ ખાતાવહી પત્રક" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/trial-balance'} onClick={() => handleNav('/reports/trial-balance')}>
                <ListItemText primary="• કાચું સરવૈયું (Trial Balance)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/trading'} onClick={() => handleNav('/reports/trading')}>
                <ListItemText primary="• વેપાર ખાતું (Trading A/c)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/profit-loss'} onClick={() => handleNav('/reports/profit-loss')}>
                <ListItemText primary="• નફા-નુકસાન ખાતું (P&L)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/balance-sheet'} onClick={() => handleNav('/reports/balance-sheet')}>
                <ListItemText primary="• પાકું સરવૈયું (Balance Sheet)" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/tarij'} onClick={() => handleNav('/reports/tarij')}>
                <ListItemText primary="• વાર્ષિક તારીજ પત્રક" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/reports/notices'} onClick={() => handleNav('/reports/notices')}>
                <ListItemText primary="• ઉઘરાણી નોટિસ & ખાતરી પત્ર" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* ૯. યુટિલિટીઝ અને સુરક્ષા */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSection('utilities')}>
              <ListItemIcon><SettingsIcon color="action" /></ListItemIcon>
              <ListItemText primary="૯. યુટિલિટીઝ & સુરક્ષા" primaryTypographyProps={{ fontWeight: 600 }} />
              {expandedMenu.utilities ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedMenu.utilities} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense sx={{ pl: 2 }}>
              <ListItemButton selected={currentPath === '/utilities/users'} onClick={() => handleNav('/utilities/users')}>
                <ListItemText primary="• વપરાશકર્તા સંચાલન" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/utilities/change-password'} onClick={() => handleNav('/utilities/change-password')}>
                <ListItemText primary="• પાસવર્ડ બદલો" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/utilities/year-end'} onClick={() => handleNav('/utilities/year-end')}>
                <ListItemText primary="• વર્ષ આખર કેરી ફોરવર્ડ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/utilities/lock'} onClick={() => handleNav('/utilities/lock')}>
                <ListItemText primary="• હિસાબ લોક / પિરિયડ લોક" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/utilities/audit'} onClick={() => handleNav('/utilities/audit')}>
                <ListItemText primary="• સિસ્ટમ ઓડિટ લૉગ્સ" />
              </ListItemButton>
              <ListItemButton selected={currentPath === '/utilities/backup'} onClick={() => handleNav('/utilities/backup')}>
                <ListItemText primary="• ડેટાબેઝ બેકઅપ & રીસ્ટોર" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
}
