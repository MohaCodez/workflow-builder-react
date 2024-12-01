import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const WorkflowDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Workflow Builder
      </Typography>
      <Typography variant="body1" paragraph>
        Get started by creating a new workflow or using one of our templates.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/workflows/new')}
          sx={{ mr: 2 }}
        >
          Create New Workflow
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/templates')}
        >
          Browse Templates
        </Button>
      </Box>
    </Box>
  );
}; 