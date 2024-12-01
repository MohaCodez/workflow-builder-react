import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Tabs,
  Tab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Share as ShareIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Description as FormsIcon,
} from '@mui/icons-material';
import { WorkflowCanvas } from './WorkflowCanvas';
import { ExecutionHistory } from './ExecutionHistory';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import ShareDialog from './dialogs/ShareDialog';
import VersionDialog from './dialogs/VersionDialog';
import WorkflowList from './WorkflowList';
import { useWorkflowExecution } from '../../hooks/useWorkflowExecution';
import { ExecutionMonitor } from './execution/ExecutionMonitor';
import { TemplateManager } from './templates/TemplateManager';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FormsList } from '../forms/FormsList';
import { FormEditor } from '../forms/FormEditor';
import { FormResponses } from '../forms/FormResponses';
import { TemplateList } from './templates/TemplateList';
import { saveWorkflow } from '../../services/workflowService';
import Header from '../layout/Header';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 72;

const WorkflowLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [drawerCollapsed, setDrawerCollapsed] = useState(isTablet && !isMobile);

  useEffect(() => {
    setDrawerOpen(!isMobile);
    setDrawerCollapsed(isTablet && !isMobile);
  }, [isMobile, isTablet]);

  const getCurrentTab = () => {
    if (location.pathname.includes('/templates')) return 4;
    if (location.pathname.includes('/forms')) return 3;
    if (location.pathname.includes('/analytics')) return 2;
    if (location.pathname.includes('/history')) return 1;
    return 0;
  };

  const [currentTab, setCurrentTab] = useState(getCurrentTab());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [executionMonitorOpen, setExecutionMonitorOpen] = useState(false);
  const { executing, currentExecutionId, execute } = useWorkflowExecution();
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    setCurrentTab(getCurrentTab());
  }, [location]);

  const handleTabChange = (event, newValue) => {
    navigate(tabs[newValue].path);
  };

  const handleExecution = async () => {
    const executionId = await execute(selectedWorkflow);
    if (executionId) {
      setExecutionMonitorOpen(true);
    }
  };

  const speedDialActions = [
    { icon: <ShareIcon />, name: 'Share', onClick: () => setShareDialogOpen(true) },
    { icon: <SaveIcon />, name: 'Save Version', onClick: () => setVersionDialogOpen(true) },
    { icon: <PlayArrowIcon />, name: 'Execute', onClick: handleExecution },
  ];

  const renderContent = () => {
    if (!selectedWorkflow && currentTab !== 3) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Workflow Selected
          </Typography>
          <Typography color="text.secondary">
            Please select a workflow from the list or create a new one
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {/* Handle new workflow */}}
          >
            Create New Workflow
          </Button>
        </Box>
      );
    }

    switch (currentTab) {
      case 0:
        return <WorkflowCanvas 
          selectedWorkflow={selectedWorkflow} 
          setSelectedWorkflow={setSelectedWorkflow}
        />;
      case 1:
        return <ExecutionHistory workflowId={selectedWorkflow?.id} />;
      case 2:
        return <AnalyticsDashboard workflowId={selectedWorkflow?.id} />;
      case 3:
        return <TemplateManager onSelectTemplate={handleTemplateSelect} />;
      default:
        return null;
    }
  };

  const handleTemplateSelect = async (template) => {
    try {
      // Create a new workflow from template
      const newWorkflow = {
        name: `${template.name} Copy`,
        description: template.description,
        nodes: template.nodes.map(node => ({
          ...node,
          id: `${node.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })),
        edges: template.edges.map(edge => ({
          ...edge,
          id: `e${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })),
        userId: user.uid,
      };

      // Save the new workflow
      const workflowId = await saveWorkflow(newWorkflow);
      const createdWorkflow = {
        ...newWorkflow,
        id: workflowId,
      };

      setSelectedWorkflow(createdWorkflow);
      notify.success('Template applied successfully');
      navigate('/workflows');
    } catch (error) {
      console.error('Error applying template:', error);
      notify.error('Failed to apply template');
    }
  };

  const tabs = [
    { icon: <DashboardIcon />, label: "Canvas", path: "/workflows" },
    { icon: <HistoryIcon />, label: "History", path: "/history" },
    { icon: <AnalyticsIcon />, label: "Analytics", path: "/analytics" },
    { icon: <FormsIcon />, label: "Forms", path: "/forms" },
    { icon: <DashboardIcon />, label: "Templates", path: "/templates" }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header onToggleDrawer={() => setDrawerOpen(!drawerOpen)} />
      
      <Box sx={{ mt: '64px', display: 'flex', flex: 1 }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: drawerCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
              boxSizing: 'border-box',
              mt: '64px',
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none',
              '& .MuiList-root': {
                p: 0,
              },
            },
          }}
        >
          <IconButton
            onClick={() => setDrawerCollapsed(!drawerCollapsed)}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              right: 0,
              top: 0,
              zIndex: 1,
            }}
          >
            {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
          <WorkflowList
            onSelectWorkflow={setSelectedWorkflow}
            selectedWorkflowId={selectedWorkflow?.id}
            collapsed={drawerCollapsed}
          />
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: {
              xs: 0,
              sm: drawerCollapsed ? `${COLLAPSED_DRAWER_WIDTH}px` : `${DRAWER_WIDTH}px`,
            },
            width: {
              xs: '100%',
              sm: `calc(100% - ${drawerCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)`,
            },
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant={isTablet ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                py: 1,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                icon={tab.icon} 
                label={!isTablet && tab.label} 
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/workflows" replace />} />
              <Route 
                path="/workflows" 
                element={
                  <WorkflowCanvas 
                    selectedWorkflow={selectedWorkflow} 
                    setSelectedWorkflow={setSelectedWorkflow}
                  />
                } 
              />
              <Route path="/workflows/new" element={<WorkflowCanvas />} />
              <Route path="/workflows/:id" element={<WorkflowCanvas />} />
              <Route path="/history" element={<ExecutionHistory workflowId={selectedWorkflow?.id} />} />
              <Route path="/analytics" element={<AnalyticsDashboard workflowId={selectedWorkflow?.id} />} />
              <Route path="/forms" element={<FormsList />} />
              <Route path="/forms/new" element={<FormEditor />} />
              <Route path="/forms/:id" element={<FormEditor />} />
              <Route path="/forms/:id/responses" element={<FormResponses />} />
              <Route path="/templates" element={<TemplateList onSelectTemplate={handleTemplateSelect} />} />
            </Routes>
          </Box>

          <SpeedDial
            ariaLabel="Workflow Actions"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              '& .MuiFab-primary': {
                width: 48,
                height: 48,
              },
            }}
            icon={<SpeedDialIcon />}
          >
            {speedDialActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.onClick}
                sx={{
                  width: 40,
                  height: 40,
                }}
              />
            ))}
          </SpeedDial>

          <ShareDialog
            open={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            workflowId={selectedWorkflow?.id}
          />

          <VersionDialog
            open={versionDialogOpen}
            onClose={() => setVersionDialogOpen(false)}
            workflowId={selectedWorkflow?.id}
            onVersionSelect={(version) => {/* Handle version selection */}}
          />

          <ExecutionMonitor
            open={executionMonitorOpen}
            executionId={currentExecutionId}
            onClose={() => setExecutionMonitorOpen(false)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default WorkflowLayout; 