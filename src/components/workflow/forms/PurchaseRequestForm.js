import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';

export const PurchaseRequestForm = {
  id: 'purchase-request-form',
  title: 'Purchase Request Form',
  description: 'Submit a purchase request for approval',
  fields: [
    {
      id: 'requester_name',
      type: 'text',
      label: 'Requester Name',
      required: true,
    },
    {
      id: 'requester_email',
      type: 'email',
      label: 'Requester Email',
      required: true,
    },
    {
      id: 'department',
      type: 'select',
      label: 'Department',
      required: true,
      options: ['IT', 'HR', 'Finance', 'Marketing', 'Operations'],
    },
    {
      id: 'item_name',
      type: 'text',
      label: 'Item Name',
      required: true,
    },
    {
      id: 'item_description',
      type: 'text',
      label: 'Item Description',
      required: true,
      multiline: true,
      rows: 3,
    },
    {
      id: 'quantity',
      type: 'number',
      label: 'Quantity',
      required: true,
      min: 1,
    },
    {
      id: 'unit_price',
      type: 'number',
      label: 'Unit Price ($)',
      required: true,
      min: 0,
    },
    {
      id: 'total_amount',
      type: 'number',
      label: 'Total Amount ($)',
      required: true,
      readOnly: true,
      computed: (values) => (values.quantity || 0) * (values.unit_price || 0),
    },
    {
      id: 'urgency',
      type: 'select',
      label: 'Urgency Level',
      required: true,
      options: ['Low', 'Medium', 'High', 'Critical'],
    },
    {
      id: 'justification',
      type: 'text',
      label: 'Business Justification',
      required: true,
      multiline: true,
      rows: 4,
    },
  ],
}; 