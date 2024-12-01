const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.executeWorkflow = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { workflowId } = data;
  
  try {
    // Create execution record
    const executionRef = await db.collection('workflow-executions').add({
      workflowId,
      userId: context.auth.uid,
      status: 'running',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      nodes: {},
    });

    // Get workflow data
    const workflowDoc = await db.collection('workflows').doc(workflowId).get();
    const workflow = workflowDoc.data();

    // Execute nodes in sequence
    const result = await executeNodes(workflow.nodes, workflow.edges, executionRef);

    // Update execution status
    await executionRef.update({
      status: 'completed',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      result,
    });

    return { success: true, executionId: executionRef.id };
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

async function executeNodes(nodes, edges, executionRef) {
  const nodeResults = {};
  const startNode = nodes.find(node => node.type === 'trigger');
  
  async function executeNode(node) {
    try {
      // Update node status
      await executionRef.update({
        [`nodes.${node.id}`]: {
          status: 'running',
          startTime: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      let result;
      switch (node.type) {
        case 'trigger':
          result = await executeTrigger(node);
          break;
        case 'action':
          result = await executeAction(node);
          break;
        case 'condition':
          result = await evaluateCondition(node);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      nodeResults[node.id] = result;

      // Update node status
      await executionRef.update({
        [`nodes.${node.id}`]: {
          status: 'completed',
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          result,
        },
      });

      // Find and execute next nodes
      const nextEdges = edges.filter(edge => edge.source === node.id);
      for (const edge of nextEdges) {
        const nextNode = nodes.find(n => n.id === edge.target);
        if (nextNode) {
          if (node.type === 'condition') {
            // Only follow the path that matches the condition result
            if ((edge.sourceHandle === 'a' && result) || 
                (edge.sourceHandle === 'b' && !result)) {
              await executeNode(nextNode);
            }
          } else {
            await executeNode(nextNode);
          }
        }
      }
    } catch (error) {
      await executionRef.update({
        [`nodes.${node.id}`]: {
          status: 'error',
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message,
        },
      });
      throw error;
    }
  }

  await executeNode(startNode);
  return nodeResults;
}

async function executeTrigger(node) {
  const { subType, config } = node.data;
  switch (subType) {
    case 'form':
      return { formId: config.formId };
    case 'schedule':
      return { cronExpression: config.cronExpression };
    case 'webhook':
      return { endpoint: config.endpoint };
    default:
      throw new Error(`Unknown trigger type: ${subType}`);
  }
}

async function executeAction(node) {
  const { subType, config } = node.data;
  switch (subType) {
    case 'email':
      return await sendEmail(config);
    case 'database':
      return await performDatabaseOperation(config);
    case 'api':
      return await makeApiCall(config);
    default:
      throw new Error(`Unknown action type: ${subType}`);
  }
}

async function evaluateCondition(node) {
  const { subType, config } = node.data;
  switch (subType) {
    case 'comparison':
      return evaluateComparison(config);
    case 'logical':
      return evaluateLogicalExpression(config);
    default:
      throw new Error(`Unknown condition type: ${subType}`);
  }
}

// Helper functions for specific operations
async function sendEmail(config) {
  // Implement email sending logic using a service like SendGrid
  return { sent: true, to: config.to };
}

async function performDatabaseOperation(config) {
  const { collection, operation, data } = config;
  const collectionRef = db.collection(collection);

  switch (operation) {
    case 'create':
      const docRef = await collectionRef.add(data);
      return { id: docRef.id };
    case 'update':
      await collectionRef.doc(data.id).update(data);
      return { updated: true };
    case 'delete':
      await collectionRef.doc(data.id).delete();
      return { deleted: true };
    default:
      throw new Error(`Unknown database operation: ${operation}`);
  }
}

async function makeApiCall(config) {
  const { url, method, headers, body } = config;
  // Implement API call logic
  return { url, method, success: true };
}

function evaluateComparison(config) {
  const { field, operator, value } = config;
  // Implement comparison logic
  return true; // Placeholder
}

function evaluateLogicalExpression(config) {
  const { expression } = config;
  // Implement logical expression evaluation
  return true; // Placeholder
} 