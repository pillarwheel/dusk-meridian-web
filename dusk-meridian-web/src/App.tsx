import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IMXAuthProvider } from '@/contexts/IMXAuthContext';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Map } from '@/pages/Map';
import { Marketplace } from '@/pages/Marketplace';
import { Dashboard } from '@/pages/Dashboard';
import { Character } from '@/pages/Character';
import { CharacterDetail } from '@/pages/CharacterDetail';
import { CharacterCreationPage } from '@/pages/CharacterCreation';
import { Codex } from '@/pages/Codex';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { Settlement } from '@/pages/Settlement';
import { SettlementTesting } from '@/pages/SettlementTesting';
import { MapMovement } from '@/pages/MapMovement';
import { Redirect } from '@/pages/Redirect';
import { Logout } from '@/pages/Logout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROUTES } from '@/utils/constants';
import './App.css';

// Import debug utilities for development
if (import.meta.env.DEV) {
  import('@/utils/authDebug');
  import('@/utils/authTest');
  import('@/utils/serverDiagnostic');
  import('@/utils/authStateCheck');
  import('@/utils/tokenDebug');
  import('@/utils/tokenTransformer');
  import('@/utils/backendDiagnostic');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <IMXAuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path="/redirect" element={<Redirect />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path={ROUTES.HOME} element={<Home />} />
                      <Route path={ROUTES.MAP} element={<Map />} />
                      <Route path={ROUTES.MAP_MOVEMENT} element={<MapMovement />} />
                      <Route path={ROUTES.MARKETPLACE} element={<Marketplace />} />
                      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                      <Route path={ROUTES.CHARACTER} element={<Character />} />
                      <Route path={ROUTES.CHARACTER_CREATE} element={<CharacterCreationPage />} />
                      <Route path={`${ROUTES.CHARACTER}/:id`} element={<CharacterDetail />} />
                      <Route path={ROUTES.CODEX} element={<Codex />} />
                      <Route path={ROUTES.PROFILE} element={<Profile />} />
                      <Route path={ROUTES.SETTLEMENT} element={<Settlement />} />
                      <Route path={ROUTES.SETTLEMENT_TESTING} element={<SettlementTesting />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </IMXAuthProvider>
  );
}

export default App;