import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File Upload' },
];

export const FormBuilder = ({ formData, onChange }) => {
  const [selectedField, setSelectedField] = useState(null);

  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      options: [],
      placeholder: '',
    };
    onChange({
      ...formData,
      fields: [...(formData.fields || []), newField],
    });
  };

  const handleFieldChange = (fieldId, updates) => {
    onChange({
      ...formData,
      fields: formData.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };

  const handleDeleteField = (fieldId) => {
    onChange({
      ...formData,
      fields: formData.fields.filter(field => field.id !== fieldId),
    });
  };

  const moveField = (index, direction) => {
    const newFields = [...formData.fields];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      onChange({
        ...formData,
        fields: newFields,
      });
    }
  };

  const renderFieldEditor = (field, index) => {
    return (
      <Card 
        key={field.id}
        variant="outlined" 
        sx={{ 
          mb: 2,
          border: selectedField?.id === field.id ? '2px solid primary.main' : undefined,
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <IconButton 
                  size="small" 
                  onClick={() => moveField(index, -1)}
                  disabled={index === 0}
                >
                  <UpIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => moveField(index, 1)}
                  disabled={index === formData.fields.length - 1}
                >
                  <DownIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={field.type}
                  label="Type"
                  onChange={(e) => handleFieldChange(field.id, { type: e.target.value })}
                >
                  {FIELD_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Label"
                value={field.label}
                onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Placeholder"
                value={field.placeholder}
                onChange={(e) => handleFieldChange(field.id, { placeholder: e.target.value })}
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton 
                color="error" 
                onClick={() => handleDeleteField(field.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>

          {(field.type === 'select' || field.type === 'radio') && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              {field.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...field.options];
                      newOptions[index] = e.target.value;
                      handleFieldChange(field.id, { options: newOptions });
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newOptions = field.options.filter((_, i) => i !== index);
                      handleFieldChange(field.id, { options: newOptions });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  handleFieldChange(field.id, {
                    options: [...(field.options || []), ''],
                  });
                }}
              >
                Add Option
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Form Title"
          value={formData.title || ''}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Form Description"
          value={formData.description || ''}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        {(formData.fields || []).map((field, index) => renderFieldEditor(field, index))}
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddField}
        sx={{ mt: 2 }}
      >
        Add Field
      </Button>
    </Box>
  );
}; 