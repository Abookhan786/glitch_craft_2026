import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Challenge from './pages/Challenge';
import Scoreboard from './pages/Scoreboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

const PrivateRoute = ({ children }) => {
  const { team, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>;
  return team ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { team, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!team) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/challenges" />;
  return children;
};

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '62px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/challenges" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/challenges/:id" element={<PrivateRoute><Challenge /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
