import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as StepIcon,
  BugReport as DebugIcon,
} from '@mui/icons-material';
import { getExecutionLogs, setBreakpoint, resumeExecution } from '../../../services/workflowExecutionService';

const ExecutionDebugger = ({ executionId, nodes }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (executionId) {
      const interval = setInterval(loadLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [executionId]);

  const loadLogs = async () => {
    try {
      const executionLogs = await getExecutionLogs(executionId);
      setLogs(executionLogs);
      setVariables(executionLogs.variables || {});
    } catch (error) {
      console.error('Error loading execution logs:', error);
    }
  };

  const handleBreakpointToggle = async (nodeId) => {
    try {
      const newBreakpoints = new Set(breakpoints);
      if (breakpoints.has(nodeId)) {
        newBreakpoints.delete(nodeId);
        await setBreakpoint(executionId, nodeId, false);
      } else {
        newBreakpoints.add(nodeId);
        await setBreakpoint(executionId, nodeId, true);
      }
      setBreakpoints(newBreakpoints);
    } catch (error) {
      console.error('Error toggling breakpoint:', error);
    }
  };

  const handleResume = async () => {
    try {
      await resumeExecution(executionId);
      setIsPaused(false);
    } catch (error) {
      console.error('Error resuming execution:', error);
    }
  };

  const handleStepOver = async () => {
    try {
      await resumeExecution(executionId, { stepMode: true });
    } catch (error) {
      console.error('Error stepping over:', error);
    }
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Logs" />
        <Tab label="Variables" />
        <Tab label="Breakpoints" />
      </Tabs>

      {/* Logs Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2, mt: 2, maxHeight: 400, overflow: 'auto' }}>
          {logs.map((log, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                {new Date(log.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography>{log.message}</Typography>
              {log.data && (
                <pre style={{ margin: 0, background: '#f5f5f5', padding: 8 }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </Box>
          ))}
        </Paper>
      )}

      {/* Variables Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(variables).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <pre style={{ margin: 0 }}>
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </pre>
                  </TableCell>
                  <TableCell>{typeof value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Breakpoints Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          {nodes.map((node) => (
            <Accordion key={node.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    size="small"
                    color={breakpoints.has(node.id) ? 'secondary' : 'default'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBreakpointToggle(node.id);
                    }}
                  >
                    <DebugIcon />
                  </IconButton>
                  <Typography>{node.data.label}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Condition"
                  fullWidth
                  size="small"
                  placeholder="Enter condition for breakpoint"
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* Debug Controls */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          onClick={handleResume}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<StepIcon />}
          onClick={handleStepOver}
          disabled={!isPaused}
        >
          Step Over
        </Button>
      </Box>
    </Box>
  );
};

export default ExecutionDebugger; 