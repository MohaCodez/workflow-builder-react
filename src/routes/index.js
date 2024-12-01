import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/auth/Login';
import DashboardLayout from '../components/layout/DashboardLayout';
import WorkflowDashboard from '../components/workflow/WorkflowDashboard';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import ExecutionHistory from '../components/workflow/ExecutionHistory';
import AnalyticsDashboard from '../components/workflow/AnalyticsDashboard';
import TemplateManager from '../components/workflow/templates/TemplateManager';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<WorkflowDashboard />} />
      <Route path="workflows">
        <Route index element={<WorkflowDashboard />} />
        <Route path="new" element={<WorkflowCanvas />} />
        <Route path=":id" element={<WorkflowCanvas />} />
        <Route path=":id/history" element={<ExecutionHistory />} />
        <Route path=":id/analytics" element={<AnalyticsDashboard />} />
      </Route>
      <Route path="templates" element={<TemplateManager />} />
    </Route>
  </Routes>
); 