import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../hooks/useNotification';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { getUserForms } from '../../../services/formService';

const NodeConfigDialog = ({ open, onClose, node, onSave }) => {
  const [config, setConfig] = useState({
    label: '',
    type: '',
    ...node?.data,
  });
  const [forms, setForms] = useState([]);
  const notify = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    if (node) {
      setConfig({
        label: node.data?.label || '',
        type: node.type || '',
        ...node.data,
      });
    }
  }, [node]);

  useEffect(() => {
    if (open && node?.type === 'trigger') {
      loadForms();
    }
  }, [open, node]);

  const loadForms = async () => {
    try {
      const userForms = await getUserForms(user.uid);
      setForms(userForms);
    } catch (error) {
      console.error('Error loading forms:', error);
      notify.error('Failed to load forms');
    }
  };

  const validateConfig = () => {
    if (!config.label?.trim()) {
      return { isValid: false, error: 'Label is required' };
    }

    if (node.type === 'trigger') {
      if (!config.triggerType) {
        return { isValid: false, error: 'Trigger type is required' };
      }
      if (config.triggerType === 'form' && !config.formId) {
        return { isValid: false, error: 'Form selection is required' };
      }
      if (config.triggerType === 'schedule' && !config.schedule) {
        return { isValid: false, error: 'Schedule is required' };
      }
    }

    if (node.type === 'action') {
      if (!config.actionType) {
        return { isValid: false, error: 'Action type is required' };
      }
    }

    if (node.type === 'condition') {
      if (!config.field?.trim()) {
        return { isValid: false, error: 'Field is required' };
      }
      if (!config.operator) {
        return { isValid: false, error: 'Operator is required' };
      }
      if (config.value === undefined || config.value === '') {
        return { isValid: false, error: 'Value is required' };
      }
    }

    return { isValid: true };
  };

  const handleSave = () => {
    const validation = validateConfig();
    if (!validation.isValid) {
      notify.error(validation.error);
      return;
    }

    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        ...config,
      },
    };

    try {
      onSave(updatedNode);
      onClose();
    } catch (error) {
      console.error('Error saving node:', error);
      notify.error('Failed to save node configuration');
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure {node.type} Node</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Label"
            value={config.label || ''}
            onChange={(e) => setConfig({ ...config, label: e.target.value })}
            required
          />

          {node.type === 'trigger' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Trigger Type</InputLabel>
                <Select
                  value={config.triggerType || ''}
                  label="Trigger Type"
                  onChange={(e) => setConfig({ ...config, triggerType: e.target.value })}
                >
                  <MenuItem value="form">Form Submission</MenuItem>
                  <MenuItem value="schedule">Schedule</MenuItem>
                  <MenuItem value="webhook">Webhook</MenuItem>
                </Select>
              </FormControl>

              {config.triggerType === 'form' && (
                <FormControl fullWidth>
                  <InputLabel>Select Form</InputLabel>
                  <Select
                    value={config.formId || ''}
                    label="Select Form"
                    onChange={(e) => setConfig({ ...config, formId: e.target.value })}
                  >
                    {forms.map((form) => (
                      <MenuItem key={form.id} value={form.id}>
                        {form.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {config.triggerType === 'schedule' && (
                <TextField
                  fullWidth
                  label="Cron Expression"
                  value={config.schedule || ''}
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                  helperText="e.g., 0 9 * * * (every day at 9 AM)"
                />
              )}

              {config.triggerType === 'webhook' && (
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value={config.webhookUrl || ''}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  disabled
                  helperText="Webhook URL will be generated after saving"
                />
              )}
            </>
          )}

          {node.type === 'action' && (
            <FormControl fullWidth>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={config.actionType || ''}
                label="Action Type"
                onChange={(e) => setConfig({ ...config, actionType: e.target.value })}
              >
                <MenuItem value="approval">Approval</MenuItem>
                <MenuItem value="notification">Notification</MenuItem>
                <MenuItem value="api">API Call</MenuItem>
              </Select>
            </FormControl>
          )}

          {node.type === 'condition' && (
            <>
              <TextField
                fullWidth
                label="Field"
                value={config.field || ''}
                onChange={(e) => setConfig({ ...config, field: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={config.operator || ''}
                  label="Operator"
                  onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                >
                  <MenuItem value="equals">Equals</MenuItem>
                  <MenuItem value="notEquals">Not Equals</MenuItem>
                  <MenuItem value="greaterThan">Greater Than</MenuItem>
                  <MenuItem value="lessThan">Less Than</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Value"
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeConfigDialog; 