import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export const saveWorkflow = async (workflow) => {
  try {
    if (!workflow || !workflow.userId) {
      throw new Error('Invalid workflow data');
    }

    // Helper function to clean undefined values
    const cleanObject = (obj) => {
      const cleaned = {};
      Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleaned[key] = value;
        }
      });
      return cleaned;
    };

    // Clean and structure the workflow data
    const cleanWorkflow = {
      name: workflow.name || 'New Workflow',
      description: workflow.description || '',
      userId: workflow.userId,
      nodes: workflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position || { x: 0, y: 0 },
        data: cleanObject({
          label: node.data.label || '',
          type: node.data.type,
          triggerType: node.data.triggerType,
          actionType: node.data.actionType,
          formId: node.data.formId,
          field: node.data.field,
          operator: node.data.operator,
          value: node.data.value,
          config: node.data.config ? cleanObject(node.data.config) : undefined,
        }),
      })),
      edges: (workflow.edges || []).map(edge => cleanObject({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      })),
      updatedAt: serverTimestamp(),
    };

    let workflowId = workflow.id;

    if (workflowId) {
      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, cleanWorkflow);
    } else {
      cleanWorkflow.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'workflows'), cleanWorkflow);
      workflowId = docRef.id;
    }

    return workflowId;
  } catch (error) {
    console.error('Error saving workflow:', error);
    throw new Error(`Failed to save workflow: ${error.message}`);
  }
};

export const getWorkflow = async (workflowId) => {
  try {
    const workflowRef = doc(db, 'workflows', workflowId);
    const workflowSnap = await getDoc(workflowRef);
    
    if (!workflowSnap.exists()) {
      throw new Error('Workflow not found');
    }

    const data = workflowSnap.data();
    return {
      id: workflowSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
    };
  } catch (error) {
    console.error('Error getting workflow:', error);
    throw error;
  }
};

export const getUserWorkflows = async (userId) => {
  try {
    const q = query(
      collection(db, 'workflows'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null,
    }));
  } catch (error) {
    console.error('Error getting workflows:', error);
    throw error;
  }
};

export const deleteWorkflow = async (workflowId) => {
  try {
    await deleteDoc(doc(db, 'workflows', workflowId));
    return true;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

export const createPurchaseRequestWorkflow = async (userId) => {
  try {
    // First check if workflow already exists
    const workflowsQuery = query(
      collection(db, 'workflows'),
      where('userId', '==', userId),
      where('type', '==', 'purchase-request')
    );
    
    const querySnapshot = await getDocs(workflowsQuery);
    
    // If workflow exists, return it
    if (!querySnapshot.empty) {
      const existingWorkflow = querySnapshot.docs[0];
      return {
        id: existingWorkflow.id,
        ...existingWorkflow.data()
      };
    }

    // If not, create new workflow
    const workflowData = {
      type: 'purchase-request',
      name: 'Purchase Request Approval',
      description: 'Purchase request approval workflow with manager approval',
      userId: userId,
      nodes: [
        {
          id: 'trigger_1',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: {
            label: 'Purchase Request Form',
            type: 'form',
            triggerType: 'form',
            formId: 'purchase-request-form',
          }
        },
        {
          id: 'action_1',
          type: 'action',
          position: { x: 250, y: 150 },
          data: {
            label: 'Manager Approval',
            actionType: 'approval',
            assignee: {
              type: 'user',
              value: userId,
            },
          }
        },
        {
          id: 'condition_1',
          type: 'condition',
          position: { x: 250, y: 250 },
          data: {
            label: 'Check Decision',
            field: 'decision',
            operator: 'equals',
            value: 'Approve',
          }
        },
        {
          id: 'action_2',
          type: 'action',
          position: { x: 100, y: 350 },
          data: {
            label: 'Send Approval Notification',
            actionType: 'notification',
            config: {
              template: 'purchase_request_approved',
              channel: 'email',
            }
          }
        },
        {
          id: 'action_3',
          type: 'action',
          position: { x: 400, y: 350 },
          data: {
            label: 'Send Rejection Notification',
            actionType: 'notification',
            config: {
              template: 'purchase_request_rejected',
              channel: 'email',
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'trigger_1', target: 'action_1' },
        { id: 'e2', source: 'action_1', target: 'condition_1' },
        { id: 'e3', source: 'condition_1', target: 'action_2', label: 'Approved' },
        { id: 'e4', source: 'condition_1', target: 'action_3', label: 'Rejected' },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'workflows'), workflowData);
    return { id: docRef.id, ...workflowData };
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}; 