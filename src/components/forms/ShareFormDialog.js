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
import { generateFormShareLink } from '../../services/formService';

export const ShareFormDialog = ({ open, onClose, formId }) => {
  const notify = useNotification();
  const shareUrl = generateFormShareLink(formId);

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
      <DialogTitle>Share Form</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" gutterBottom>
          Share this link to collect responses
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Anyone with this link can submit responses to your form.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleCopy}>
          Copy Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 