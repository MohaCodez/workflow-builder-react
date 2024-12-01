import React from 'react';
import { Handle } from 'reactflow';
import { Paper, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const ActionNode = ({ data }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 150,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: '#e3f2fd',
      }}
    >
      <Handle type="target" position="top" />
      <PlayArrowIcon color="primary" />
      <Typography variant="body1">{data.label}</Typography>
      <Handle type="source" position="bottom" />
    </Paper>
  );
};

export default ActionNode; 