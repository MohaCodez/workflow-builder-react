import { useState } from 'react';
import { executeWorkflow } from '../services/workflowExecutionService';
import { validateWorkflow } from '../services/workflowValidationService';
import { useNotification } from './useNotification';

export const useWorkflowExecution = () => {
  const [executing, setExecuting] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState(null);
  const notify = useNotification();

  const execute = async (workflow) => {
    if (!workflow?.id) {
      notify.warning('Please select a workflow first');
      return null;
    }

    const validation = validateWorkflow({
      nodes: workflow.nodes,
      edges: workflow.edges,
    });

    if (!validation.isValid) {
      notify.error('Workflow validation failed');
      validation.errors.forEach(error => {
        notify.error(error);
      });
      return null;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        notify.warning(warning);
      });
    }

    try {
      setExecuting(true);
      const result = await executeWorkflow(workflow.id);
      notify.success('Workflow execution started');
      setCurrentExecutionId(result.executionId);
      return result.executionId;
    } catch (error) {
      console.error('Error executing workflow:', error);
      notify.error('Error executing workflow');
      return null;
    } finally {
      setExecuting(false);
    }
  };

  return {
    executing,
    currentExecutionId,
    execute,
  };
}; 