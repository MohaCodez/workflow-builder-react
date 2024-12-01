import { db, functions } from '../config/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getWorkflow } from './workflowService';
import { auth } from '../config/firebase';

export const executeWorkflow = async (workflowId, formData = null) => {
  try {
    const workflow = await getWorkflow(workflowId);
    const triggerNode = workflow.nodes.find(node => node.type === 'trigger');
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    if (triggerNode?.data?.triggerType === 'form') {
      if (!formData) {
        throw new Error('Form data is required for form trigger');
      }

      // Store execution data
      const executionData = {
        workflowId,
        status: 'started',
        triggerType: 'form',
        formData,
        startedAt: serverTimestamp(),
        userId: user.uid,
        assignedTo: user.uid, // Assign to current user
        variables: {
          currentUser: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
        },
      };

      const executionRef = await addDoc(collection(db, 'workflow-executions'), executionData);
      return executionRef.id;
    }
  } catch (error) {
    console.error('Error executing workflow:', error);
    throw new Error('Failed to execute workflow');
  }
};

export const getExecutionStatus = async (executionId) => {
  try {
    const executionRef = doc(db, 'workflow-executions', executionId);
    const executionSnap = await getDoc(executionRef);
    
    if (!executionSnap.exists()) {
      throw new Error('Execution not found');
    }

    const executionData = executionSnap.data();
    return {
      id: executionId,
      status: executionData.status,
      startTime: executionData.startTime,
      endTime: executionData.endTime,
      nodes: executionData.nodes || {},
      error: executionData.error,
      result: executionData.result,
    };
  } catch (error) {
    console.error('Error getting execution status:', error);
    throw error;
  }
};

export const getExecutionLogs = async (executionId) => {
  try {
    const logsRef = doc(db, 'workflow-executions', executionId, 'logs', 'main');
    const logsSnap = await getDoc(logsRef);
    return logsSnap.exists() ? logsSnap.data().entries : [];
  } catch (error) {
    console.error('Error getting execution logs:', error);
    throw error;
  }
};

export const getWorkflowStatus = async (workflowId) => {
  try {
    const workflowRef = doc(db, 'workflows', workflowId);
    const workflowSnap = await getDoc(workflowRef);
    return workflowSnap.exists() ? workflowSnap.data().status : null;
  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw error;
  }
};

export const setBreakpoint = async (executionId, nodeId, enabled) => {
  try {
    const breakpointRef = doc(db, 'workflow-executions', executionId, 'breakpoints', nodeId);
    await updateDoc(breakpointRef, { enabled });
    return true;
  } catch (error) {
    console.error('Error setting breakpoint:', error);
    throw error;
  }
};

export const resumeExecution = async (executionId, options = {}) => {
  try {
    const resumeFunction = httpsCallable(functions, 'resumeWorkflowExecution');
    const result = await resumeFunction({ executionId, ...options });
    return result.data;
  } catch (error) {
    console.error('Error resuming execution:', error);
    throw error;
  }
}; 