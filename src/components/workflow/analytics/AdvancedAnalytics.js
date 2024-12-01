import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Info as InfoIcon } from '@mui/icons-material';
import { getWorkflowAnalytics, getNodePerformance } from '../../../services/workflowHistoryService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdvancedAnalytics = ({ workflowId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [nodePerformance, setNodePerformance] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workflowId) {
      loadAnalytics();
      loadNodePerformance();
    }
  }, [workflowId, timeRange]);

  const loadAnalytics = async () => {
    try {
      const data = await getWorkflowAnalytics(workflowId, timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadNodePerformance = async () => {
    try {
      const data = await getNodePerformance(workflowId, timeRange);
      setNodePerformance(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Overview
              <Tooltip title="Performance metrics for the selected time range">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{analytics?.totalExecutions}</Typography>
                  <Typography color="textSecondary">Total Executions</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{analytics?.successRate.toFixed(1)}%</Typography>
                  <Typography color="textSecondary">Success Rate</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{analytics?.averageExecutionTime}s</Typography>
                  <Typography color="textSecondary">Avg. Execution Time</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{analytics?.activeUsers}</Typography>
                  <Typography color="textSecondary">Active Users</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Node Performance Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Node Performance
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Node</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Avg. Duration</TableCell>
                  <TableCell>Error Rate</TableCell>
                  <TableCell>Total Executions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nodePerformance.map((node) => (
                  <TableRow key={node.id}>
                    <TableCell>{node.name}</TableCell>
                    <TableCell>{node.successRate}%</TableCell>
                    <TableCell>{node.avgDuration}s</TableCell>
                    <TableCell>{node.errorRate}%</TableCell>
                    <TableCell>{node.totalExecutions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Execution Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execution Trends
            </Typography>
            <Box height={300}>
              <ResponsiveContainer>
                <LineChart data={analytics?.executionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="successful" stroke="#00C49F" name="Successful" />
                  <Line type="monotone" dataKey="failed" stroke="#FF8042" name="Failed" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Error Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics?.errorDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics?.errorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedAnalytics; 