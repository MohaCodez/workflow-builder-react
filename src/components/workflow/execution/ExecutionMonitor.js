import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Alert,
  Button,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getExecutionStatus } from '../../../services/workflowExecutionService';
import { useNotification } from '../../../hooks/useNotification';

export const ExecutionMonitor = ({ open, executionId, onClose }) => {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notify = useNotification();

  const loadExecution = async () => {
    try {
      setLoading(true);
      const data = await getExecutionStatus(executionId);
      setExecution(data);
      setError(null);
    } catch (err) {
      setError('Error loading execution status');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (executionId && open) {
      loadExecution();
      const interval = setInterval(loadExecution, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [executionId, open]);

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <CircularProgress size={20} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Workflow Execution</Typography>
          <Box>
            <IconButton onClick={loadExecution} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && !execution ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : execution ? (
          <Box>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Status: {execution.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Started: {new Date(execution.startTime).toLocaleString()}
              </Typography>
              {execution.endTime && (
                <Typography variant="body2" color="text.secondary">
                  Completed: {new Date(execution.endTime).toLocaleString()}
                </Typography>
              )}
            </Box>

            <Stepper orientation="vertical">
              {Object.entries(execution.nodes || {}).map(([nodeId, node]) => (
                <Step key={nodeId} active={node.status === 'running'} completed={node.status === 'completed'}>
                  <StepLabel
                    StepIconComponent={() => getStepIcon(node.status)}
                    error={node.status === 'failed'}
                  >
                    {node.label}
                  </StepLabel>
                  <StepContent>
                    <Box py={1}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {node.status}
                      </Typography>
                      {node.error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {node.error}
                        </Alert>
                      )}
                      {node.result && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Result: {JSON.stringify(node.result)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}; 