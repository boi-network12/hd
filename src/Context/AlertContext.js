import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const handleClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={2000}
        onClose={handleClose}
        sx={{ zIndex: 9999 }}
      >
        <Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
