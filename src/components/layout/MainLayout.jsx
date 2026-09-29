import React, { useState, useEffect } from 'react';
import { Box, Container, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 280;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Sync sidebar state when screen breakpoint changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Automatically close sidebar on route navigation on mobile devices
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7f6', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: isMobile ? '100%' : (sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%'),
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          })
        }}
      >
        <Toolbar />
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 2, sm: 3 },
            px: { xs: 1.5, sm: 3 },
            flexGrow: 1,
            minWidth: 0,
            width: '100%'
          }}
        >
          {children}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          className="no-print"
          sx={{
            py: 2,
            px: { xs: 1.5, sm: 3 },
            mt: 'auto',
            bgcolor: '#ffffff',
            borderTop: '1px solid #e0e6e0',
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.85rem' }
          }}
        >
          © {new Date().getFullYear()} શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ (તા. ઓલપાડ, જી. સુરત) | સર્વ હક સ્વાધીન
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
