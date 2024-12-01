import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Stack } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { saveWorkflow } from '../../services/workflowService';
import { nodeTypes } from './nodes/nodeTypes';
import WorkflowToolbar from './WorkflowToolbar';
import NodeConfigDialog from './dialogs/NodeConfigDialog';
import { useNotification } from '../../hooks/useNotification';

export const WorkflowCanvas = ({ selectedWorkflow, setSelectedWorkflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    if (selectedWorkflow) {
      // Format nodes to include necessary handlers
      const formattedNodes = selectedWorkflow.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: (updatedData) => handleNodeDataChange(node.id, updatedData),
        },
      }));
      setNodes(formattedNodes);
      setEdges(selectedWorkflow.edges || []);
    }
  }, [selectedWorkflow]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position: { x: 250, y: nodes.length * 100 + 100 },
      data: { 
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        onChange: (updatedData) => handleNodeDataChange(newNode.id, updatedData),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setConfigDialogOpen(true);
  };

  const handleNodeDataChange = (nodeId, updatedData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updatedData,
                onChange: node.data.onChange,
              },
            }
          : node
      )
    );
  };

  const handleConfigSave = async (updatedNode) => {
    try {
      if (!updatedNode.data?.label) {
        notify.error('Node name is required');
        return;
      }

      // Clean the node data
      const cleanNode = {
        ...updatedNode,
        data: {
          label: updatedNode.data.label || '',
          type: updatedNode.data.type,
          triggerType: updatedNode.data.triggerType,
          actionType: updatedNode.data.actionType,
          formId: updatedNode.data.formId,
          field: updatedNode.data.field,
          operator: updatedNode.data.operator,
          value: updatedNode.data.value,
          config: updatedNode.data.config,
          onChange: (newData) => handleNodeDataChange(updatedNode.id, newData),
        },
      };

      setNodes((nds) =>
        nds.map((node) =>
          node.id === cleanNode.id ? cleanNode : node
        )
      );

      notify.success('Node configuration saved');
      setConfigDialogOpen(false);
    } catch (error) {
      console.error('Error saving node configuration:', error);
      notify.error('Failed to save node configuration');
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      if (!nodes.length) {
        notify.warning('Workflow must contain at least one node');
        return;
      }

      // Clean nodes data before saving
      const cleanNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label || '',
          type: node.data.type,
          triggerType: node.data.triggerType,
          actionType: node.data.actionType,
          formId: node.data.formId,
          field: node.data.field,
          operator: node.data.operator,
          value: node.data.value,
          config: node.data.config,
        },
      }));

      const workflowData = {
        ...(selectedWorkflow || {}),
        nodes: cleanNodes,
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        })),
        name: selectedWorkflow?.name || 'New Workflow',
        description: selectedWorkflow?.description || '',
        userId: user.uid,
      };

      const workflowId = await saveWorkflow(workflowData);
      
      if (!selectedWorkflow?.id) {
        setSelectedWorkflow({
          ...workflowData,
          id: workflowId,
          nodes: cleanNodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onChange: (newData) => handleNodeDataChange(node.id, newData),
            },
          })),
        });
        notify.success('Workflow created successfully');
      } else {
        notify.success('Workflow saved successfully');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      notify.error('Error saving workflow');
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
      <WorkflowToolbar onAddNode={handleAddNode} />
      <Stack
        direction="row"
        spacing={2}
        sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}
      >
        <Button variant="contained" onClick={handleSaveWorkflow}>
          Save Workflow
        </Button>
      </Stack>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <NodeConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        node={selectedNode}
        onSave={handleConfigSave}
      />
    </Box>
  );
}; 