'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Close } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
  };
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Get authentication actions from the store
  const { login, register, isLoading, error } = useAuthStore();
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginEmail, loginPassword);
    if (!useAuthStore.getState().error) {
      onClose();
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(registerName, registerEmail, registerPassword);
    if (!useAuthStore.getState().error) {
      onClose();
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Conta de Usuário</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="fechar"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Login" {...a11yProps(0)} />
          <Tab label="Criar Conta" {...a11yProps(1)} />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleLoginSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
            <Box mt={2} textAlign="center">
              <Typography color="text.secondary" variant="body2">
                Email de demonstração: user@example.com
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Senha: password
              </Typography>
            </Box>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleRegisterSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome"
              type="text"
              autoComplete="name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Criar Conta'}
            </Button>
          </form>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog; 