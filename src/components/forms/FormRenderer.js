import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

export const FormRenderer = ({ fields, onSubmit, loading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = 'This field is required';
      }

      if (formData[field.id]) {
        switch (field.type) {
          case 'email':
            if (!/\S+@\S+\.\S+/.test(formData[field.id])) {
              newErrors[field.id] = 'Invalid email address';
            }
            break;
          case 'number':
            if (isNaN(formData[field.id])) {
              newErrors[field.id] = 'Must be a number';
            }
            break;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (fieldId, value) => {
    const newValue = value === '' ? undefined : value;
    
    setFormData(prev => {
      const newData = { ...prev };
      if (newValue === undefined) {
        delete newData[fieldId];
      } else {
        newData[fieldId] = newValue;
      }
      return newData;
    });

    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: undefined
      }));
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            required={field.required}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="number"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            required={field.required}
          />
        );

      case 'select':
        return (
          <FormControl 
            fullWidth 
            error={!!errors[field.id]}
            required={field.required}
          >
            <Select
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                {field.placeholder || 'Select an option'}
              </MenuItem>
              {field.options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors[field.id] && (
              <FormHelperText>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl 
            component="fieldset"
            error={!!errors[field.id]}
            required={field.required}
          >
            <RadioGroup
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
            >
              {field.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {errors[field.id] && (
              <FormHelperText>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl 
            error={!!errors[field.id]}
            required={field.required}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData[field.id] || false}
                  onChange={(e) => handleChange(field.id, e.target.checked)}
                />
              }
              label={field.label}
            />
            {errors[field.id] && (
              <FormHelperText>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {fields.map((field) => (
          <Box key={field.id}>
            {renderField(field)}
          </Box>
        ))}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </Box>
    </form>
  );
}; 