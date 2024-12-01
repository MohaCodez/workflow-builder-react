import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getForm, getFormResponses, deleteFormResponse } from '../../services/formService';
import { getWorkflow, createPurchaseRequestWorkflow } from '../../services/workflowService';
import { useNotification } from '../../hooks/useNotification';
import { executeWorkflow } from '../../services/workflowExecutionService';
import { useFormResponseHandler } from './FormResponseHandler';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const useFirestoreConnection = () => {
  useEffect(() => {
    const enablePersistence = async () => {
      try {
        await db.enablePersistence();
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support persistence.');
        }
      }
    };
    enablePersistence();
  }, []);
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    const handleError = (error) => {
      console.error('Connection error:', error);
      setHasError(true);
      notify.error('Connection error. Please check your internet connection.');
    };

    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, [notify]);

  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          Connection error. Please check your internet connection or try disabling ad blockers.
        </Alert>
      </Box>
    );
  }

  return children;
};

const retryOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export const FormResponses = () => {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();
  const { user } = useAuth();

  useFirestoreConnection();

  useEffect(() => {
    if (!formId) {
      console.error('No form ID in URL params');
      notify.error('No form ID provided');
      navigate('/forms');
      return;
    }
    console.log('FormResponses mounted with formId:', formId);
    loadFormAndResponses();
  }, [formId]);

  const loadFormAndResponses = async () => {
    try {
      setLoading(true);
      console.log('Loading form with ID:', formId);

      // First get the form
      const formData = await getForm(formId);
      if (!formData) {
        throw new Error('Form not found');
      }
      console.log('Form data:', formData);
      setForm(formData);

      // Then get responses
      const responsesData = await getFormResponses(formId);
      console.log('Form responses:', responsesData);
      setResponses(responsesData || []);

    } catch (error) {
      console.error('Error loading form and responses:', error);
      notify.error(error.message || 'Error loading responses');
      if (error.message === 'Form not found') {
        navigate('/forms');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId) => {
    try {
      await deleteFormResponse(responseId);
      notify.success('Response deleted successfully');
      loadFormAndResponses();
    } catch (error) {
      notify.error('Error deleting response');
      console.error('Error:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      if (!form || !responses.length) return;

      const fields = form.fields.map(f => f.label);
      const csvContent = [
        fields.join(','), // Header
        ...responses.map(response => 
          fields.map(field => 
            JSON.stringify(response.data[field] || '')
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.title}_responses.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notify.error('Error exporting responses');
      console.error('Error:', error);
    }
  };

  const renderResponseValue = (value, type) => {
    if (value === undefined || value === null) return 'N/A';

    switch (type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'file':
        return value.name || value;
      default:
        return value.toString();
    }
  };

  const handleExecuteWorkflow = async (response) => {
    try {
      let workflow;
      
      // First, try to get existing workflow
      const workflowsQuery = query(
        collection(db, 'workflows'),
        where('userId', '==', user.uid),
        where('type', '==', 'purchase-request')
      );
      
      const querySnapshot = await getDocs(workflowsQuery);
      
      if (querySnapshot.empty) {
        // Create new workflow only if none exists
        workflow = await createPurchaseRequestWorkflow(user.uid);
        notify.success('Workflow created successfully');
      } else {
        // Use existing workflow
        const existingWorkflow = querySnapshot.docs[0];
        workflow = {
          id: existingWorkflow.id,
          ...existingWorkflow.data()
        };
      }

      // Execute workflow
      await executeWorkflow(workflow.id, response.data);
      
      // Update response status
      const responseRef = doc(db, 'form-responses', response.id);
      await updateDoc(responseRef, {
        workflowExecutionId: workflow.id,
        status: 'in_progress',
        processedAt: serverTimestamp()
      });

      notify.success('Workflow execution started');
      await loadFormAndResponses();
    } catch (error) {
      console.error('Error executing workflow:', error);
      notify.error('Error starting workflow');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/forms')}>
              Back to Forms
            </Button>
          }
        >
          Form not found
        </Alert>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/forms')}>
              <BackIcon />
            </IconButton>
            <Typography variant="h5">
              {form.title} - Responses
            </Typography>
          </Box>
          <Button
            startIcon={<DownloadIcon />}
            variant="contained"
            onClick={handleExportCSV}
            disabled={!responses.length}
          >
            Export CSV
          </Button>
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Submitted At</TableCell>
                  {form.fields?.map((field) => (
                    <TableCell key={field.id}>{field.label}</TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.length > 0 ? (
                  responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        {response.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      {form.fields?.map((field) => (
                        <TableCell key={field.id}>
                          {renderResponseValue(response.data[field.id], field.type)}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <TableCell>
                          {response.workflowExecutionId ? (
                            <Tooltip title="Workflow Started">
                              <Chip
                                label="In Progress"
                                color="primary"
                                size="small"
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Start Workflow">
                              <IconButton
                                color="primary"
                                onClick={() => handleExecuteWorkflow(response)}
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                        <Tooltip title="Delete Response">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteResponse(response.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={(form.fields?.length || 0) + 2} align="center">
                      <Typography color="text.secondary">
                        No responses yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </ErrorBoundary>
  );
}; 