import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { FormBuilder } from './FormBuilder';
import { createForm, updateForm, getForm, generateFormShareLink } from '../../services/formService';
import { ShareFormDialog } from './ShareFormDialog';

export const FormEditor = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    fields: [],
  });
  const [loading, setLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const formData = await getForm(id);
      setForm(formData);
    } catch (error) {
      notify.error('Error loading form');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!form.title) {
        notify.error('Form title is required');
        return;
      }

      const formData = {
        ...form,
        userId: user.uid,
      };

      if (id) {
        await updateForm(id, formData);
        notify.success('Form updated successfully');
      } else {
        const newForm = await createForm(formData);
        navigate(`/forms/${newForm.id}`);
        notify.success('Form created successfully');
      }
    } catch (error) {
      notify.error('Error saving form');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/forms')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {id ? 'Edit Form' : 'Create Form'}
          </Typography>
          <Button
            startIcon={<ShareIcon />}
            onClick={() => setShareDialogOpen(true)}
            sx={{ mr: 1 }}
            disabled={!id}
          >
            Share
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <FormBuilder
            formData={form}
            onChange={setForm}
          />
        </Paper>
      </Box>

      <ShareFormDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        formId={id}
      />
    </Box>
  );
}; 