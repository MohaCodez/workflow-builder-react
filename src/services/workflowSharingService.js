import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

export const shareWorkflow = async (workflowId, shareData) => {
  try {
    const { email, role } = shareData;
    const shareDoc = await addDoc(collection(db, 'workflow-shares'), {
      workflowId,
      email,
      role,
      createdAt: new Date().toISOString(),
    });
    return { id: shareDoc.id, ...shareData };
  } catch (error) {
    console.error('Error sharing workflow:', error);
    throw error;
  }
};

export const getWorkflowShares = async (workflowId) => {
  try {
    const q = query(
      collection(db, 'workflow-shares'),
      where('workflowId', '==', workflowId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting workflow shares:', error);
    throw error;
  }
};

export const updateShare = async (shareId, updates) => {
  try {
    const shareRef = doc(db, 'workflow-shares', shareId);
    await updateDoc(shareRef, updates);
    return { id: shareId, ...updates };
  } catch (error) {
    console.error('Error updating share:', error);
    throw error;
  }
};

export const removeShare = async (shareId) => {
  try {
    await deleteDoc(doc(db, 'workflow-shares', shareId));
    return true;
  } catch (error) {
    console.error('Error removing share:', error);
    throw error;
  }
};

export const createWorkflowTemplate = async (workflow) => {
  try {
    const templateData = {
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      category: workflow.category,
      isPublic: workflow.isPublic || false,
      createdBy: workflow.userId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'workflow-templates'), templateData);
    return { id: docRef.id, ...templateData };
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const getWorkflowTemplates = async (options = {}) => {
  try {
    const { category, isPublic } = options;
    let q = query(collection(db, 'workflow-templates'));

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (isPublic !== undefined) {
      q = query(q, where('isPublic', '==', isPublic));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
};

export const updateTemplate = async (templateId, updates) => {
  try {
    const templateRef = doc(db, 'workflow-templates', templateId);
    await updateDoc(templateRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { id: templateId, ...updates };
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (templateId) => {
  try {
    await deleteDoc(doc(db, 'workflow-templates', templateId));
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}; 