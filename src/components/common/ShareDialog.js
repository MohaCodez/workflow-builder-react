import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { useNotification } from '../../hooks/useNotification';

const ShareDialog = ({ open, onClose, title, shareUrl }) => {
  const notify = useNotification();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify.success('Link copied to clipboard');
    } catch (error) {
      notify.error('Failed to copy link');
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Share Link
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={handleCopy} color="primary">
              <CopyIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog; 