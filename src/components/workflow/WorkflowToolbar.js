import React from 'react';
import { Paper, Button, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const WorkflowToolbar = ({ onAddNode }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        padding: 2,
      }}
    >
      <Stack spacing={2}>
        <Button
          variant="contained"
          startIcon={<PowerSettingsNewIcon />}
          onClick={() => onAddNode('trigger')}
        >
          Add Trigger
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => onAddNode('action')}
        >
          Add Action
        </Button>
        <Button
          variant="contained"
          startIcon={<DeviceHubIcon />}
          onClick={() => onAddNode('condition')}
        >
          Add Condition
        </Button>
      </Stack>
    </Paper>
  );
};

export default WorkflowToolbar; 