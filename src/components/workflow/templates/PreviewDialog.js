import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../nodes/nodeTypes';

export const PreviewDialog = ({ open, onClose, template }) => {
  if (!template) return null;

  // Format nodes for preview
  const previewNodes = template.nodes.map(node => ({
    ...node,
    draggable: false,
    selectable: false,
  }));

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {template.name}
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" paragraph>
          {template.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {template.tags?.map((tag) => (
            <Typography
              key={tag}
              variant="caption"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              {tag}
            </Typography>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ height: 400 }}>
          <ReactFlow
            nodes={previewNodes}
            edges={template.edges || []}
            nodeTypes={nodeTypes}
            fitView
            zoomOnScroll={false}
            panOnScroll={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 