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
  MenuItem,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  shareWorkflow,
  getWorkflowShares,
  updateShare,
  removeShare,
} from '../../../services/workflowSharingService';

const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

const ShareDialog = ({ open, onClose, workflowId }) => {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [editingShare, setEditingShare] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && workflowId) {
      loadShares();
    }
  }, [open, workflowId]);

  const loadShares = async () => {
    try {
      setLoading(true);
      const sharesList = await getWorkflowShares(workflowId);
      setShares(sharesList);
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareWorkflow(workflowId, { email, role });
      setEmail('');
      setRole('viewer');
      await loadShares();
    } catch (error) {
      console.error('Error sharing workflow:', error);
    }
  };

  const handleUpdateShare = async (shareId) => {
    try {
      await updateShare(shareId, { role: editingShare.role });
      setEditingShare(null);
      await loadShares();
    } catch (error) {
      console.error('Error updating share:', error);
    }
  };

  const handleRemoveShare = async (shareId) => {
    try {
      await removeShare(shareId);
      await loadShares();
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Workflow</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add new collaborator
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              size="small"
              sx={{ width: 120 }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleShare}>
              Share
            </Button>
          </Box>
        </Box>
        <Divider />
        <List>
          {shares.map((share) => (
            <ListItem key={share.id}>
              {editingShare?.id === share.id ? (
                <>
                  <ListItemText
                    primary={share.email}
                    secondary={
                      <TextField
                        select
                        value={editingShare.role}
                        onChange={(e) =>
                          setEditingShare({ ...editingShare, role: e.target.value })
                        }
                        size="small"
                      >
                        {roles.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleUpdateShare(share.id)}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => setEditingShare(null)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </>
              ) : (
                <>
                  <ListItemText
                    primary={share.email}
                    secondary={roles.find((r) => r.value === share.role)?.label}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setEditingShare(share)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveShare(share.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </>
              )}
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

export default ShareDialog; 