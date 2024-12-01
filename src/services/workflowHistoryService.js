import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';

export const getWorkflowExecutions = async (workflowId, options = {}) => {
  try {
    const { limit: limitCount = 50, status } = options;
    let q = query(
      collection(db, 'workflow-executions'),
      where('workflowId', '==', workflowId),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting workflow executions:', error);
    throw error;
  }
};

export const getExecutionDetails = async (executionId) => {
  try {
    const executionDoc = await getDoc(doc(db, 'workflow-executions', executionId));
    if (!executionDoc.exists()) {
      throw new Error('Execution not found');
    }
    return { id: executionDoc.id, ...executionDoc.data() };
  } catch (error) {
    console.error('Error getting execution details:', error);
    throw error;
  }
};

export const getWorkflowAnalytics = async (workflowId, timeRange = '7d') => {
  try {
    const analytics = {
      totalExecutions: 0,
      successRate: 0,
      averageDuration: 0,
      executionsByStatus: {
        completed: 0,
        failed: 0,
        running: 0,
      },
      executionsByDay: {},
      mostCommonErrors: {},
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const q = query(
      collection(db, 'workflow-executions'),
      where('workflowId', '==', workflowId),
      where('startTime', '>=', startDate.toISOString()),
      orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const executions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    analytics.totalExecutions = executions.length;

    executions.forEach(execution => {
      // Count by status
      analytics.executionsByStatus[execution.status] = 
        (analytics.executionsByStatus[execution.status] || 0) + 1;

      // Group by day
      const day = execution.startTime.split('T')[0];
      analytics.executionsByDay[day] = 
        (analytics.executionsByDay[day] || 0) + 1;

      // Track errors
      if (execution.error) {
        analytics.mostCommonErrors[execution.error] = 
          (analytics.mostCommonErrors[execution.error] || 0) + 1;
      }
    });

    // Calculate success rate
    const completed = analytics.executionsByStatus.completed || 0;
    analytics.successRate = completed / analytics.totalExecutions * 100;

    return analytics;
  } catch (error) {
    console.error('Error getting workflow analytics:', error);
    throw error;
  }
};

export const getNodePerformance = async (workflowId, timeRange) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const q = query(
      collection(db, 'workflow-executions'),
      where('workflowId', '==', workflowId),
      where('startTime', '>=', startDate.toISOString()),
      orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const executions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Process node performance data
    const nodeStats = {};
    executions.forEach(execution => {
      Object.entries(execution.nodes || {}).forEach(([nodeId, nodeData]) => {
        if (!nodeStats[nodeId]) {
          nodeStats[nodeId] = {
            id: nodeId,
            name: nodeData.name || nodeId,
            successful: 0,
            failed: 0,
            totalDuration: 0,
            totalExecutions: 0,
          };
        }

        nodeStats[nodeId].totalExecutions++;
        if (nodeData.status === 'completed') {
          nodeStats[nodeId].successful++;
        } else if (nodeData.status === 'error') {
          nodeStats[nodeId].failed++;
        }

        if (nodeData.startTime && nodeData.endTime) {
          const duration = (new Date(nodeData.endTime) - new Date(nodeData.startTime)) / 1000;
          nodeStats[nodeId].totalDuration += duration;
        }
      });
    });

    // Calculate final metrics
    return Object.values(nodeStats).map(node => ({
      ...node,
      successRate: ((node.successful / node.totalExecutions) * 100).toFixed(1),
      errorRate: ((node.failed / node.totalExecutions) * 100).toFixed(1),
      avgDuration: (node.totalDuration / node.totalExecutions).toFixed(2),
    }));
  } catch (error) {
    console.error('Error getting node performance:', error);
    throw error;
  }
};

export const getExecutionTrends = async (workflowId, timeRange) => {
  // Implementation for getting execution trends over time
  // Similar to the above, but group by date and calculate daily metrics
};

export const getErrorDistribution = async (workflowId, timeRange) => {
  // Implementation for getting error type distribution
  // Group errors by type and count occurrences
}; 