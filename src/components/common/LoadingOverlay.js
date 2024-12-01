import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingOverlay = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      minHeight: 200,
    }}
  >
    <CircularProgress />
  </Box>
); 