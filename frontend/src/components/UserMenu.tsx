'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Badge
} from '@mui/material';
import { Person, ExitToApp } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth';
import { useFilterStore } from '@/store/filters';
import AuthDialog from './AuthDialog';

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  const { user, isAuthenticated, logout, favorites } = useAuthStore();
  const { favoriteOnly, setFavoriteOnly } = useFilterStore();
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLoginClick = () => {
    setAuthDialogOpen(true);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    // If favorite filter is on, turn it off when logging out
    if (favoriteOnly) {
      setFavoriteOnly(false);
    }
  };
  
  const closeAuthDialog = () => {
    setAuthDialogOpen(false);
  };
  
  return (
    <>
      {isAuthenticated ? (
        <Box>
          <IconButton
            onClick={handleMenuOpen}
            color="primary"
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1
            }}
          >
            <Badge
              badgeContent={favorites.length}
              color="primary"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              invisible={favorites.length === 0}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  width: 32, 
                  height: 32,
                  fontSize: '1rem'  
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Badge>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {user?.name || 'Usuário'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ''}
              </Typography>
            </Box>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ExitToApp fontSize="small" sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Person />}
          onClick={handleLoginClick}
          sx={{ borderRadius: 2 }}
        >
          Entrar
        </Button>
      )}
      
      <AuthDialog open={authDialogOpen} onClose={closeAuthDialog} />
    </>
  );
};

export default UserMenu; 