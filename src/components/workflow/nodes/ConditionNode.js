import React from 'react';
import { Handle } from 'reactflow';
import { Paper, Typography } from '@mui/material';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const ConditionNode = ({ data }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 150,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: '#fff3e0',
      }}
    >
      <Handle type="target" position="top" />
      <DeviceHubIcon color="warning" />
      <Typography variant="body1">{data.label}</Typography>
      <Handle type="source" position="bottom" id="a" />
      <Handle type="source" position="right" id="b" />
    </Paper>
  );
};

export default ConditionNode; 