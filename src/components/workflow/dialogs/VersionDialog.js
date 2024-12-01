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
  Typography,
  Chip,
} from '@mui/material';
import {
  Publish as PublishIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { getVersions, publishVersion } from '../../../services/workflowVersionService';

const VersionDialog = ({ open, onClose, workflowId, onVersionSelect }) => {
  const [versions, setVersions] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && workflowId) {
      loadVersions();
    }
  }, [open, workflowId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const workflowVersions = await getVersions(workflowId);
      setVersions(workflowVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (versionId) => {
    try {
      await publishVersion(versionId);
      await loadVersions();
    } catch (error) {
      console.error('Error publishing version:', error);
    }
  };

  const handleRestore = (version) => {
    onVersionSelect(version);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Workflow Versions</DialogTitle>
      <DialogContent>
        <List>
          {versions.map((version) => (
            <ListItem key={version.id}>
              <ListItemText
                primary={
                  <>
                    Version {version.version}
                    <Chip
                      size="small"
                      label={version.status}
                      color={version.status === 'published' ? 'success' : 'default'}
                      sx={{ ml: 1 }}
                    />
                  </>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      Created: {new Date(version.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">{version.description}</Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                {version.status === 'draft' && (
                  <IconButton
                    edge="end"
                    onClick={() => handlePublish(version.id)}
                    title="Publish"
                  >
                    <PublishIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  onClick={() => handleRestore(version)}
                  title="Restore"
                >
                  <RestoreIcon />
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

export default VersionDialog; 