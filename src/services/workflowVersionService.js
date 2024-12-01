import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

export const createVersion = async (workflow) => {
  try {
    const versionData = {
      workflowId: workflow.id,
      nodes: workflow.nodes,
      edges: workflow.edges,
      version: workflow.version || 1,
      createdAt: new Date().toISOString(),
      createdBy: workflow.userId,
      description: workflow.versionDescription || '',
      status: 'draft', // draft, published, archived
    };

    const docRef = await addDoc(collection(db, 'workflow-versions'), versionData);
    return { id: docRef.id, ...versionData };
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
};

export const getVersions = async (workflowId) => {
  try {
    const q = query(
      collection(db, 'workflow-versions'),
      where('workflowId', '==', workflowId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting versions:', error);
    throw error;
  }
};

export const getVersion = async (versionId) => {
  try {
    const versionDoc = await getDoc(doc(db, 'workflow-versions', versionId));
    if (versionDoc.exists()) {
      return { id: versionDoc.id, ...versionDoc.data() };
    }
    throw new Error('Version not found');
  } catch (error) {
    console.error('Error getting version:', error);
    throw error;
  }
};

export const publishVersion = async (versionId) => {
  try {
    const versionRef = doc(db, 'workflow-versions', versionId);
    const versionDoc = await getDoc(versionRef);
    const version = versionDoc.data();

    // Archive current published version
    const q = query(
      collection(db, 'workflow-versions'),
      where('workflowId', '==', version.workflowId),
      where('status', '==', 'published'),
      limit(1)
    );
    const publishedVersions = await getDocs(q);
    
    for (const doc of publishedVersions.docs) {
      await doc.ref.update({ status: 'archived' });
    }

    // Publish new version
    await versionRef.update({
      status: 'published',
      publishedAt: new Date().toISOString()
    });

    return { id: versionId, ...version, status: 'published' };
  } catch (error) {
    console.error('Error publishing version:', error);
    throw error;
  }
}; 