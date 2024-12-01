import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  ViewList as TemplateIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      title: 'Workflows',
      icon: <PlayArrowIcon />,
      path: '/workflows',
      children: [
        {
          title: 'Active Workflows',
          path: '/workflows?status=active',
        },
        {
          title: 'Draft Workflows',
          path: '/workflows?status=draft',
        },
      ],
    },
    {
      title: 'History',
      icon: <HistoryIcon />,
      path: '/history',
    },
    {
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
    },
    {
      title: 'Templates',
      icon: <TemplateIcon />,
      path: '/templates',
    },
  ];

  return (
    <List component="nav">
      {menuItems.map((item) => (
        <React.Fragment key={item.path}>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => {
              if (item.children) {
                setOpen(!open);
              } else {
                navigate(item.path);
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
            {item.children && (open ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
          {item.children && (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItemButton
                    key={child.path}
                    sx={{ pl: 4 }}
                    selected={location.pathname + location.search === child.path}
                    onClick={() => navigate(child.path)}
                  >
                    <ListItemText primary={child.title} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      ))}
      <Divider sx={{ my: 2 }} />
      <ListItemButton onClick={() => navigate('/settings')}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
    </List>
  );
}; 