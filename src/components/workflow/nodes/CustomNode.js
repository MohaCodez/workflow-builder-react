import React from 'react';
import { Handle } from 'reactflow';
import { Paper, Typography } from '@mui/material';

const CustomNode = ({ data }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 150,
        textAlign: 'center',
        borderRadius: 2,
      }}
    >
      <Handle type="target" position="top" />
      <Typography variant="body1">{data.label}</Typography>
      <Handle type="source" position="bottom" />
    </Paper>
  );
};

export default CustomNode; 