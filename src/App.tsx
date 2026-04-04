import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth & Base
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// User (Patient) Pages
import UserDashboard from "./pages/UserDashboard";
import ChatPage from "./pages/ChatPage";
import StressCheck from "./pages/StressCheck";
import Exercises from "./pages/Exercises";
import RelaxMusic from "./pages/RelaxMusic";
import Relaxation from "./pages/Relaxation";
import Games from "./pages/Games";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import Appearance from "./pages/Appearance";
import Notifications from "./pages/Notifications";
import Privacy from "./pages/Privacy";
import TermsPolicy from "./pages/TermsPolicy";
import HelpSupport from "./pages/HelpSupport";
import UserMessages from "./pages/UserMessages";

// Psychiatrist Pages
import PsychiatristDashboard from "./pages/PsychiatristDashboard";
import PsychiatristSettings from "./pages/PsychiatristSettings";
import ScheduleManager from "./pages/ScheduleManager";
import MessagesCenter from "./pages/MessagesCentre";
import PatientManagement from "./pages/PatientManagement";
import PatientDetails from "./pages/PatientDetails";
import NotificationsCenter from "./pages/NotificationsCenter";
import ClinicalReports from "./pages/ClinicalReports";
import SessionInterface from "./pages/SessionInterface";
import EmergencyAlertDetails from "./pages/EmergencyAlertDetails";
import ClinicalNotes from "./pages/ClinicalNotes";
import AddPatient from "./pages/AddPatient";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Path */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* 🧑‍🤝‍🧑 Patient (User) Dashboard Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute allowedRoles={['user']}><ChatPage /></ProtectedRoute>} />
          <Route path="/stress" element={<ProtectedRoute allowedRoles={['user']}><StressCheck /></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute allowedRoles={['user']}><Exercises /></ProtectedRoute>} />
          <Route path="/music" element={<ProtectedRoute allowedRoles={['user']}><RelaxMusic /></ProtectedRoute>} />
          <Route path="/relaxation" element={<ProtectedRoute allowedRoles={['user']}><Relaxation /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute allowedRoles={['user']}><Games /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['user']}><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />
          <Route path="/clinical-chat" element={<ProtectedRoute allowedRoles={['user']}><UserMessages /></ProtectedRoute>} />
          
          {/* User Feature Details */}
          <Route path="/appearance" element={<ProtectedRoute allowedRoles={['user']}><Appearance /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={['user']}><Notifications /></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute allowedRoles={['user']}><Privacy /></ProtectedRoute>} />
          <Route path="/terms-policy" element={<ProtectedRoute allowedRoles={['user']}><TermsPolicy /></ProtectedRoute>} />
          <Route path="/help-support" element={<ProtectedRoute allowedRoles={['user']}><HelpSupport /></ProtectedRoute>} />
          
          {/* 🩺 Psychiatrist Platform Protected Routes */}
          <Route path="/psychiatrist/*" element={
            <ProtectedRoute allowedRoles={['psychiatrist']}>
              <Routes>
                <Route index element={<PsychiatristDashboard />} />
                <Route path="settings" element={<PsychiatristSettings />} />
                <Route path="schedule" element={<ScheduleManager />} />
                <Route path="messages" element={<MessagesCenter />} />
                <Route path="patients" element={<PatientManagement />} />
                <Route path="add-patient" element={<AddPatient />} />
                <Route path="patient/:id" element={<PatientDetails />} />
                <Route path="notifications" element={<NotificationsCenter />} />
                <Route path="reports" element={<ClinicalReports />} />
                <Route path="session/:id" element={<SessionInterface />} />
                <Route path="alert/:id" element={<EmergencyAlertDetails />} />
                <Route path="notes/:patientId" element={<ClinicalNotes />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* 🛡️ Admin Core Protected Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminDashboard />} />
                <Route path="settings" element={<AdminDashboard />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* System Diagnostics */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

