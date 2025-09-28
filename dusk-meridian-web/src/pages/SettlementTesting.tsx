import React from 'react';
import { SettlementTestDashboard } from '@/components/testing/SettlementTestDashboard';

export const SettlementTesting: React.FC = () => {
  return (
    <div className="h-screen bg-background">
      <SettlementTestDashboard className="h-full" />
    </div>
  );
};