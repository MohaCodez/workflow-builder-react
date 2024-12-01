import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Typography,
  Box,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { getUserWorkflows, deleteWorkflow, saveWorkflow } from '../../services/workflowService';

export const WorkflowList = ({ onSelectWorkflow, selectedWorkflowId, collapsed }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    loadWorkflows();
  }, [user]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const userWorkflows = await getUserWorkflows(user.uid);
      setWorkflows(userWorkflows);
    } catch (error) {
      notify.error('Error loading workflows');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const newWorkflow = {
        name: 'New Workflow',
        description: '',
        nodes: [],
        edges: [],
        userId: user.uid,
      };

      const workflowId = await saveWorkflow(newWorkflow);
      const createdWorkflow = {
        ...newWorkflow,
        id: workflowId,
      };
      
      setWorkflows(prev => [...prev, createdWorkflow]);
      onSelectWorkflow(createdWorkflow);
      notify.success('New workflow created');
    } catch (error) {
      notify.error('Error creating workflow');
      console.error('Error:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await deleteWorkflow(workflowId);
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      if (selectedWorkflowId === workflowId) {
        onSelectWorkflow(null);
      }
      notify.success('Workflow deleted successfully');
    } catch (error) {
      notify.error('Error deleting workflow');
      console.error('Error:', error);
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event, workflow) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMenu(workflow);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedMenu(null);
  };

  return (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && <Typography variant="h6">My Workflows</Typography>}
        <Tooltip title="Create Workflow">
          <IconButton onClick={handleCreateWorkflow} color="primary">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <List>
        {workflows.map((workflow) => (
          <ListItem
            key={workflow.id}
            selected={workflow.id === selectedWorkflowId}
            onClick={() => onSelectWorkflow(workflow)}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(e) => handleOpenMenu(e, workflow)}
              >
                <MoreIcon />
              </IconButton>
            }
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText
              primary={workflow.name}
              secondary={!collapsed && workflow.description}
              primaryTypographyProps={{
                noWrap: true,
                sx: { pr: 2 }
              }}
              secondaryTypographyProps={{
                noWrap: true,
                sx: { pr: 2 }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleDeleteWorkflow(selectedMenu?.id);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WorkflowList; 