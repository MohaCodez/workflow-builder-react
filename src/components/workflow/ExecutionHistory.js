import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import { getWorkflowExecutions } from '../../services/workflowHistoryService';
import { useAsyncData } from '../../hooks/useAsyncData';
import { LoadingOverlay } from '../common/LoadingOverlay';

const ExecutionHistory = ({ workflowId }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const { data: executions = [], loading } = useAsyncData(
    () => workflowId ? getWorkflowExecutions(workflowId) : Promise.resolve([]),
    [workflowId]
  );

  if (!workflowId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Please select a workflow to view its execution history
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return <LoadingOverlay />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      default: return 'default';
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Execution ID</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {executions.length > 0 ? (
            executions.map((execution) => (
              <React.Fragment key={execution.id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setExpandedRow(
                        expandedRow === execution.id ? null : execution.id
                      )}
                    >
                      {expandedRow === execution.id ? 
                        <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{execution.id}</TableCell>
                  <TableCell>
                    {new Date(execution.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {execution.endTime ? 
                      `${(new Date(execution.endTime) - new Date(execution.startTime)) / 1000}s` 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={execution.status}
                      color={getStatusColor(execution.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={expandedRow === execution.id}>
                      <Box p={2}>
                        <Typography variant="h6" gutterBottom>
                          Node Execution Details
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Node ID</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Duration</TableCell>
                              <TableCell>Result/Error</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(execution.nodes || {}).map(([nodeId, nodeData]) => (
                              <TableRow key={nodeId}>
                                <TableCell>{nodeId}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={nodeData.status}
                                    color={getStatusColor(nodeData.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {nodeData.endTime ? 
                                    `${(new Date(nodeData.endTime) - new Date(nodeData.startTime)) / 1000}s` 
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  {nodeData.error || 
                                    (nodeData.result && JSON.stringify(nodeData.result))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="text.secondary">
                  No executions found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export { ExecutionHistory }; 