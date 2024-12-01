import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  IconButton,
  Box,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { shareTemplate, getTemplateShares, removeTemplateShare } from '../../../services/workflowSharingService';

const TemplateSharing = ({ open, onClose, templateId }) => {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && templateId) {
      loadShares();
      generateShareLink();
    }
  }, [open, templateId]);

  const loadShares = async () => {
    try {
      const sharesList = await getTemplateShares(templateId);
      setShares(sharesList);
    } catch (error) {
      console.error('Error loading shares:', error);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    setShareLink(`${baseUrl}/template/${templateId}`);
  };

  const handleShare = async () => {
    try {
      await shareTemplate(templateId, { email });
      setEmail('');
      await loadShares();
    } catch (error) {
      console.error('Error sharing template:', error);
    }
  };

  const handleRemoveShare = async (shareId) => {
    try {
      await removeTemplateShare(shareId);
      await loadShares();
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Template</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Share Link
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              value={shareLink}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
            />
            <IconButton onClick={handleCopyLink} color={copied ? 'success' : 'default'}>
              <CopyIcon />
            </IconButton>
          </Box>
          {copied && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Link copied to clipboard!
            </Alert>
          )}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Share with Users
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            disabled={!email}
          >
            Share
          </Button>
        </Box>

        <List>
          {shares.map((share) => (
            <ListItem key={share.id}>
              <ListItemText
                primary={share.email}
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={share.accessType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="textSecondary">
                      Shared on {new Date(share.sharedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveShare(share.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSharing; 