import { nodeConfigs } from '../components/workflow/nodes/nodeConfigs';

const validateNodeConfig = (node) => {
  const errors = [];
  const nodeConfig = nodeConfigs[node.type];
  
  if (!nodeConfig) {
    errors.push(`Invalid node type: ${node.type}`);
    return errors;
  }

  if (!node.data?.label) {
    errors.push(`Node ${node.id}: Name is required`);
  }

  if (node.type !== 'trigger' && !node.data?.subType) {
    errors.push(`Node ${node.id}: Type configuration is required`);
    return errors;
  }

  if (node.data?.subType) {
    const fields = nodeConfig.fields[node.data.subType];
    fields?.forEach(field => {
      if (field.required && !node.data.config?.[field.name]) {
        errors.push(`Node ${node.id}: ${field.label} is required`);
      }

      // Validate field types
      if (node.data.config?.[field.name]) {
        const value = node.data.config[field.name];
        switch (field.type) {
          case 'json':
            try {
              if (typeof value === 'string') {
                JSON.parse(value);
              }
            } catch (error) {
              errors.push(`Node ${node.id}: ${field.label} must be valid JSON`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`Node ${node.id}: ${field.label} must be an array`);
            }
            break;
          // Add more type validations as needed
        }
      }
    });
  }

  return errors;
};

export const validateWorkflow = (workflow) => {
  const errors = [];
  const warnings = [];

  // Basic validation
  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push('Workflow must contain at least one node');
    return { isValid: false, errors, warnings };
  }

  // Validate trigger nodes
  const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Workflow must have at least one trigger node');
  } else if (triggerNodes.length > 1) {
    warnings.push('Multiple trigger nodes may cause unexpected behavior');
  }

  // Validate each node's configuration
  workflow.nodes.forEach(node => {
    const nodeErrors = validateNodeConfig(node);
    errors.push(...nodeErrors);
  });

  // Validate connections
  const nodeIds = new Set(workflow.nodes.map(node => node.id));
  workflow.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Invalid connection: source node ${edge.source} not found`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Invalid connection: target node ${edge.target} not found`);
    }

    // Validate node connection compatibility
    const sourceNode = workflow.nodes.find(n => n.id === edge.source);
    const targetNode = workflow.nodes.find(n => n.id === edge.target);
    if (sourceNode && targetNode) {
      if (!isValidConnection(sourceNode, targetNode)) {
        errors.push(`Invalid connection: ${sourceNode.type} nodes cannot connect to ${targetNode.type} nodes`);
      }
    }
  });

  // Check for cycles
  if (hasCycle(workflow.nodes, workflow.edges)) {
    errors.push('Workflow contains cycles, which are not allowed');
  }

  // Check for disconnected nodes
  const connectedNodes = getConnectedNodes(workflow.nodes, workflow.edges);
  const disconnectedNodes = workflow.nodes.filter(node => !connectedNodes.has(node.id));
  if (disconnectedNodes.length > 0) {
    warnings.push(`Found ${disconnectedNodes.length} disconnected nodes`);
  }

  // Check for end nodes
  const endNodes = workflow.nodes.filter(node => {
    const outgoingEdges = workflow.edges.filter(edge => edge.source === node.id);
    return outgoingEdges.length === 0 && node.type !== 'trigger';
  });

  if (endNodes.length === 0) {
    warnings.push('Workflow has no end nodes');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

const isValidConnection = (sourceNode, targetNode) => {
  const validConnections = {
    trigger: ['action', 'condition'],
    action: ['action', 'condition'],
    condition: ['action'],
  };

  return validConnections[sourceNode.type]?.includes(targetNode.type) || false;
};

const hasCycle = (nodes, edges) => {
  const visited = new Set();
  const recursionStack = new Set();

  const dfs = (nodeId) => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
};

const getConnectedNodes = (nodes, edges) => {
  const connectedNodes = new Set();
  const triggerNodes = nodes.filter(node => node.type === 'trigger');

  const traverse = (nodeId) => {
    connectedNodes.add(nodeId);
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    outgoingEdges.forEach(edge => {
      if (!connectedNodes.has(edge.target)) {
        traverse(edge.target);
      }
    });
  };

  triggerNodes.forEach(node => traverse(node.id));
  return connectedNodes;
}; 