import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { getForm, submitFormResponse } from '../../services/formService';
import { FormRenderer } from './FormRenderer';
import { useNotification } from '../../hooks/useNotification';

export const FormView = () => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { formId } = useParams();
  const notify = useNotification();

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const formData = await getForm(formId);
      setForm(formData);
    } catch (error) {
      notify.error('Error loading form');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await submitFormResponse(formId, formData);
      setSubmitted(true);
      notify.success('Form submitted successfully');
    } catch (error) {
      notify.error('Error submitting form');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Form not found</Alert>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Thank you!
          </Typography>
          <Typography color="text.secondary">
            Your response has been recorded.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setSubmitted(false)}
            sx={{ mt: 2 }}
          >
            Submit Another Response
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {form.title}
        </Typography>
        {form.description && (
          <Typography color="text.secondary" paragraph>
            {form.description}
          </Typography>
        )}
        <FormRenderer
          fields={form.fields}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </Paper>
    </Box>
  );
}; 