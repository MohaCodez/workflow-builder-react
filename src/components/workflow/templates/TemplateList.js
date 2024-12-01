import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility as PreviewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PreviewDialog } from './PreviewDialog';

export const TemplateList = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const templates = [
    {
      id: 'purchase_request',
      name: 'Purchase Request Approval',
      description: 'Standard purchase request approval workflow with multiple approval levels based on amount',
      category: 'Approval Process',
      isPublic: true,
      tags: ['Approval Process', 'Public'],
      nodes: [
        {
          id: 'trigger',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: { label: 'Form Submission' },
        },
        {
          id: 'condition',
          type: 'condition',
          position: { x: 250, y: 150 },
          data: { label: 'Amount Check' },
        },
        {
          id: 'approval1',
          type: 'action',
          position: { x: 100, y: 250 },
          data: { label: 'Manager Approval' },
        },
        {
          id: 'approval2',
          type: 'action',
          position: { x: 400, y: 250 },
          data: { label: 'Director Approval' },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger', target: 'condition' },
        { id: 'e2', source: 'condition', target: 'approval1' },
        { id: 'e3', source: 'condition', target: 'approval2' },
      ],
    },
    // Add more templates here
  ];

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Workflow Templates
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => {}}
          sx={{ mr: 1 }}
        >
          All
        </Button>
        <Button
          variant="outlined"
          onClick={() => {}}
        >
          Approval Process
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {template.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color={tag === 'Public' ? 'success' : 'primary'}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Preview">
                  <IconButton onClick={() => handlePreview(template)}>
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PreviewDialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </Box>
  );
}; 