import React, { useState } from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 280;

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 960);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7f6' }}>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1 }}>
          {children}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          className="no-print"
          sx={{
            py: 2,
            px: 3,
            mt: 'auto',
            bgcolor: '#ffffff',
            borderTop: '1px solid #e0e6e0',
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.85rem'
          }}
        >
          © {new Date().getFullYear()} શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ (તા. ઓલપાડ, જી. સુરત) | સર્વ હક સ્વાધીન
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
