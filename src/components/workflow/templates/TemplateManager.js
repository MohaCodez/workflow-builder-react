import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ContentCopy as CloneIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { getTemplateCategories, getTemplatesByCategory, getAllTemplates } from '../../../templates';
import { useNotification } from '../../../hooks/useNotification';
import { useNavigate } from 'react-router-dom';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

export const TemplateManager = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const notify = useNotification();
  const navigate = useNavigate();
  const categories = ['all', ...getTemplateCategories()];

  const getDisplayTemplates = () => {
    return selectedCategory === 'all' 
      ? getAllTemplates()
      : getTemplatesByCategory(selectedCategory);
  };

  const handleTemplateSelect = (template) => {
    try {
      onSelectTemplate(template);
      navigate('/workflows/new');
    } catch (error) {
      notify.error('Error loading template');
      console.error('Error:', error);
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Workflow Templates
      </Typography>

      <Tabs
        value={categories.indexOf(selectedCategory)}
        onChange={(e, index) => setSelectedCategory(categories[index])}
        sx={{ mb: 3 }}
      >
        {categories.map((category) => (
          <Tab 
            key={category} 
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        {getDisplayTemplates().map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.name}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[2],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography 
                  color="text.secondary" 
                  variant="body2"
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: 60,
                  }}
                >
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={template.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {template.isPublic && (
                    <Chip 
                      label="Public"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Tooltip title="Preview">
                  <IconButton 
                    size="small"
                    onClick={() => handlePreview(template)}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  startIcon={<CloneIcon />}
                  onClick={() => handleTemplateSelect(template)}
                  variant="contained"
                  size="small"
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Template Preview Dialog */}
      <Dialog
        open={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewTemplate?.name} - Preview
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            {previewTemplate && (
              <ReactFlow
                nodes={previewTemplate.nodes}
                edges={previewTemplate.edges}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                panOnScroll={false}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {previewTemplate?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTemplate(null)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleTemplateSelect(previewTemplate);
              setPreviewTemplate(null);
            }}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 