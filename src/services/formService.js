import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  increment,
  orderBy,
} from 'firebase/firestore';
import { executeWorkflow } from './workflowExecutionService';

export const createForm = async (form) => {
  try {
    const formData = {
      ...form,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'forms'), formData);
    return { id: docRef.id, ...formData };
  } catch (error) {
    console.error('Error creating form:', error);
    throw new Error('Failed to create form');
  }
};

export const getForm = async (formId) => {
  try {
    console.log('getForm called with ID:', formId);
    if (!formId) throw new Error('Form ID is required');

    const formRef = doc(db, 'forms', formId);
    const formSnap = await getDoc(formRef);
    
    if (!formSnap.exists()) {
      console.log('Form not found in database');
      throw new Error('Form not found');
    }

    const data = formSnap.data();
    console.log('Form data from database:', data);
    return {
      id: formSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
      lastResponseAt: data.lastResponseAt?.toDate?.() || null,
      fields: data.fields || [],
    };
  } catch (error) {
    console.error('Error in getForm:', error);
    throw error;
  }
};

export const submitFormResponse = async (formId, response) => {
  try {
    if (!formId) throw new Error('Form ID is required');
    if (!response) throw new Error('Response data is required');

    const responseData = {
      formId,
      data: response,
      submittedAt: serverTimestamp(),
      status: 'submitted',
      processed: false,
    };

    const docRef = await addDoc(collection(db, 'form-responses'), responseData);

    try {
      const workflowsQuery = query(
        collection(db, 'workflows'),
        where('nodes', 'array-contains', {
          type: 'trigger',
          data: {
            triggerType: 'form',
            formId: formId
          }
        })
      );

      const workflowSnapshot = await getDocs(workflowsQuery);
      
      if (!workflowSnapshot.empty) {
        const workflow = {
          id: workflowSnapshot.docs[0].id,
          ...workflowSnapshot.docs[0].data()
        };

        await executeWorkflow(workflow.id, response);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    }

    return {
      id: docRef.id,
      ...responseData,
      submittedAt: new Date(),
    };
  } catch (error) {
    console.error('Error submitting form response:', error);
    throw error;
  }
};

export const getFormResponses = async (formId) => {
  try {
    if (!formId) throw new Error('Form ID is required');

    const formRef = doc(db, 'forms', formId);
    const formSnap = await getDoc(formRef);
    
    if (!formSnap.exists()) {
      throw new Error('Form not found');
    }

    const q = query(
      collection(db, 'form-responses'),
      where('formId', '==', formId),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || null,
        data: data.data || {},
      };
    });
  } catch (error) {
    console.error('Error getting form responses:', error);
    throw error;
  }
};

export const generateFormShareLink = (formId) => {
  return `${window.location.origin}/forms/public/${formId}`;
};

export const deleteFormResponse = async (responseId) => {
  try {
    await deleteDoc(doc(db, 'form-responses', responseId));
    return true;
  } catch (error) {
    console.error('Error deleting form response:', error);
    throw new Error('Failed to delete form response');
  }
};

export const getUserForms = async (userId) => {
  try {
    const q = query(
      collection(db, 'forms'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user forms:', error);
    throw new Error('Failed to get user forms');
  }
};

export const updateForm = async (formId, updates) => {
  try {
    const formRef = doc(db, 'forms', formId);
    await updateDoc(formRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { id: formId, ...updates };
  } catch (error) {
    console.error('Error updating form:', error);
    throw new Error('Failed to update form');
  }
};

export const deleteForm = async (formId) => {
  try {
    // Delete the form
    await deleteDoc(doc(db, 'forms', formId));

    // Delete all responses associated with this form
    const responsesQuery = query(
      collection(db, 'form-responses'),
      where('formId', '==', formId)
    );
    const responsesSnapshot = await getDocs(responsesQuery);
    const deletePromises = responsesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    return true;
  } catch (error) {
    console.error('Error deleting form:', error);
    throw new Error('Failed to delete form');
  }
}; 