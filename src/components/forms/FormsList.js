import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { getUserForms, deleteForm, generateFormShareLink } from '../../services/formService';
import { ShareFormDialog } from './ShareFormDialog';

export const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    loadForms();
  }, [user]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const userForms = await getUserForms(user.uid);
      setForms(userForms);
    } catch (error) {
      notify.error('Error loading forms');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId) => {
    try {
      await deleteForm(formId);
      notify.success('Form deleted successfully');
      loadForms();
    } catch (error) {
      notify.error('Error deleting form');
      console.error('Error:', error);
    }
  };

  const handleShare = (form) => {
    setSelectedForm(form);
    setShareDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Forms</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/forms/new')}
        >
          Create Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {form.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {form.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Created: {new Date(form.createdAt?.seconds * 1000).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="View Responses">
                  <IconButton 
                    onClick={() => navigate(`/forms/${form.id}/responses`)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Form">
                  <IconButton 
                    onClick={() => navigate(`/forms/${form.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Form">
                  <IconButton onClick={() => handleShare(form)}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Form">
                  <IconButton 
                    color="error"
                    onClick={() => handleDelete(form.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ShareFormDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setSelectedForm(null);
        }}
        formId={selectedForm?.id}
      />
    </Box>
  );
}; 