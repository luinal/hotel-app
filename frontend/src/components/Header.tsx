'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          marginLeft={{ xs: 2, sm: 8 }} 
          fontSize={28} 
          variant="h6" 
          component="h1" 
          color="primary" 
          fontWeight={700} 
          sx={{ flexGrow: 1 }}
        >
          HotelApp
        </Typography>
        <Box>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 