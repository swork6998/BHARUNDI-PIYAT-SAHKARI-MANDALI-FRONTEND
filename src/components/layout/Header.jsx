import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, MenuItem,
  Chip, Button, Tooltip, Menu
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  WaterDrop as WaterDropIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export default function Header({ onToggleSidebar }) {
  const {
    societyInfo,
    activeSeason,
    user,
    logout
  } = useApp();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" className="no-print" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1b5e20' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: { xs: 1, sm: 2 } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
          <WaterDropIcon sx={{ fontSize: { xs: 22, sm: 28 }, color: '#81c784', flexShrink: 0 }} />
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                fontSize: { xs: '0.85rem', sm: '1.15rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {societyInfo.name}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: 'rgba(255,255,255,0.85)',
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.75rem'
              }}
            >
              {societyInfo.sub_title} | નોંધણી નં: {societyInfo.reg_no}
            </Typography>
          </Box>
        </Box>

        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
          {/* Season Chip */}
          <Chip
            label={activeSeason}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              display: { xs: 'none', sm: 'flex' }
            }}
          />

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Desktop Button */}
            <Tooltip title="વપરાશકર્તા એકાઉન્ટ">
              <Button
                color="inherit"
                onClick={handleMenu}
                startIcon={<AccountCircle />}
                sx={{ textTransform: 'none', display: { xs: 'none', sm: 'flex' } }}
              >
                {user?.full_name || 'એડમિન'}
              </Button>
            </Tooltip>

            {/* Mobile Icon Button */}
            <Tooltip title="વપરાશકર્તા એકાઉન્ટ">
              <IconButton
                color="inherit"
                onClick={handleMenu}
                size="small"
                sx={{ display: { xs: 'flex', sm: 'none' }, p: 0.5 }}
              >
                <AccountCircle fontSize="medium" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{ mt: 1 }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold' }}>
                {user?.full_name || 'એડમિન'} ({user?.role || 'એડમિનિસ્ટ્રેટર'})
              </MenuItem>
              <MenuItem onClick={logout} sx={{ color: 'error.main', gap: 1 }}>
                <LogoutIcon fontSize="small" />
                લૉગઆઉટ (Logout)
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
