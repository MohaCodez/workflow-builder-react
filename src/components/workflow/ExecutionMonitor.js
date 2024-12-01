import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { getWorkflowStatus } from '../../services/workflowExecutionService';

const ExecutionMonitor = ({ open, onClose, executionId }) => {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (executionId) {
      const interval = setInterval(async () => {
        try {
          const status = await getWorkflowStatus(executionId);
          setExecution(status);
          if (status.status !== 'running') {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error fetching execution status:', error);
        } finally {
          setLoading(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [executionId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Workflow Execution Status</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : execution ? (
          <List>
            {Object.entries(execution.nodes || {}).map(([nodeId, nodeStatus]) => (
              <ListItem key={nodeId}>
                <ListItemText
                  primary={`Node: ${nodeId}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Status: {nodeStatus.status}
                      </Typography>
                      {nodeStatus.error && (
                        <Typography component="span" variant="body2" color="error">
                          Error: {nodeStatus.error}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No execution data available</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExecutionMonitor; 