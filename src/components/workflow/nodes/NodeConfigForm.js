import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { nodeConfigs } from './nodeConfigs';

const NodeConfigForm = ({ node, onChange }) => {
  if (!node) return null;

  const config = nodeConfigs[node.type];
  if (!config) return null;

  const currentSubType = node.data?.subType;
  const currentConfig = node.data?.config || {};

  const handleSubTypeChange = (event) => {
    const newSubType = event.target.value;
    onChange({
      ...node,
      data: {
        ...node.data,
        subType: newSubType,
        config: {},
        label: `${newSubType.charAt(0).toUpperCase()}${newSubType.slice(1)} ${node.type}`,
      },
    });
  };

  const handleConfigChange = (field, value) => {
    const updatedConfig = {
      ...currentConfig,
      [field.name]: value,
    };

    onChange({
      ...node,
      data: {
        ...node.data,
        config: updatedConfig,
        label: node.data.label || `${node.type} - ${node.data.subType}`,
      },
    });
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            value={currentConfig[field.name] || field.defaultValue || ''}
            onChange={(e) => handleConfigChange(field, e.target.value)}
            required={field.required}
            margin="normal"
          />
        );
      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            type="number"
            label={field.label}
            value={currentConfig[field.name] || field.defaultValue || ''}
            onChange={(e) => handleConfigChange(field, parseFloat(e.target.value))}
            required={field.required}
            margin="normal"
          />
        );
      case 'select':
        return (
          <FormControl key={field.name} fullWidth margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={currentConfig[field.name] || field.defaultValue || ''}
              onChange={(e) => handleConfigChange(field, e.target.value)}
              label={field.label}
              required={field.required}
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'boolean':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Switch
                checked={currentConfig[field.name] || field.defaultValue || false}
                onChange={(e) => handleConfigChange(field, e.target.checked)}
              />
            }
            label={field.label}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configure {node.type}
      </Typography>
      
      {config.types && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select
            value={currentSubType || ''}
            onChange={handleSubTypeChange}
            label="Type"
            required
          >
            {config.types.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {currentSubType &&
        config.fields[currentSubType]?.map((field) => renderField(field))}
    </Box>
  );
};

export default NodeConfigForm; 