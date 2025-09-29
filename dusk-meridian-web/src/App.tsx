import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IMXAuthProvider } from '@/contexts/IMXAuthContext';
import { Login } from '@/pages/Login';
import { Redirect } from '@/pages/Redirect';
import { SettlementsList } from '@/pages/SettlementsList';
import { SettlementDetail } from '@/pages/SettlementDetail';
import { Home } from '@/pages/Home';
import { Layout } from '@/components/layout/Layout';
import { Character } from '@/pages/Character';
import { CharacterDetail } from '@/pages/CharacterDetail';
import { Map } from '@/pages/Map';
import { Marketplace } from '@/pages/Marketplace';
import { Dashboard } from '@/pages/Dashboard';
import { Codex } from '@/pages/Codex';
import { ROUTES } from '@/utils/constants';

// Create a simple error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: 'red' }}>Something went wrong</h1>
          <p>Error: {this.state.error?.message}</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <IMXAuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              {/* Auth routes without layout */}
              <Route path="/redirect" element={<Redirect />} />

              {/* Main routes with layout */}
              <Route element={<Layout />}>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.SETTLEMENTS} element={<SettlementsList />} />
                <Route path="/settlement/:id" element={<SettlementDetail />} />
                <Route path="/character/:id" element={<CharacterDetail />} />
                <Route path={ROUTES.CHARACTER} element={<Character />} />
                <Route path={ROUTES.MAP} element={<Map />} />
                <Route path={ROUTES.MARKETPLACE} element={<Marketplace />} />
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.CODEX} element={<Codex />} />
                <Route path="/*" element={<Home />} />
              </Route>
            </Routes>
          </Router>
        </QueryClientProvider>
      </IMXAuthProvider>
    </ErrorBoundary>
  );
}

export default App;