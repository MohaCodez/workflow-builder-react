import { useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { executeWorkflow } from '../../services/workflowExecutionService';
import { useNotification } from '../../hooks/useNotification';

/* eslint-disable no-undef */
export const useFormResponseHandler = () => {
  const notify = useNotification();

  useEffect(() => {
    // Listen for new form responses
    const q = query(
      collection(db, 'form-responses'),
      where('processed', '==', false),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const response = {
            id: change.doc.id,
            ...change.doc.data()
          };

          try {
            // Find associated workflow
            const workflowsQuery = query(
              collection(db, 'workflows'),
              where('nodes', 'array-contains', {
                type: 'trigger',
                data: {
                  triggerType: 'form',
                  formId: response.formId
                }
              })
            );

            const workflowSnapshot = await getDocs(workflowsQuery);
            
            if (!workflowSnapshot.empty) {
              const workflow = {
                id: workflowSnapshot.docs[0].id,
                ...workflowSnapshot.docs[0].data()
              };

              // Execute workflow with form data
              await executeWorkflow(workflow.id, response.data);
              
              // Mark response as processed
              const responseRef = doc(db, 'form-responses', response.id);
              await updateDoc(responseRef, {
                processed: true,
                workflowExecutionId: workflow.id,
                processedAt: serverTimestamp()
              });

              notify.success('Workflow execution started');
            }
          } catch (error) {
            console.error('Error processing form response:', error);
            notify.error('Error starting workflow');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [notify]); // Add notify to dependency array
};
/* eslint-enable no-undef */ 