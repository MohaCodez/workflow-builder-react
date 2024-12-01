import React from 'react';
import { Handle } from 'reactflow';
import { Paper, Typography } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const TriggerNode = ({ data }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 150,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: '#f3e5f5',
      }}
    >
      <Handle type="source" position="bottom" />
      <PowerSettingsNewIcon color="secondary" />
      <Typography variant="body1">{data.label}</Typography>
    </Paper>
  );
};

export default TriggerNode; 