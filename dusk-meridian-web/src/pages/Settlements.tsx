import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import { settlementApi } from '@/api/endpoints/settlement';
import { SettlementListItem } from '@/api/types/settlement-new';
import { API_ENDPOINTS } from '@/utils/constants';

export const Settlements: React.FC = () => {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState<SettlementListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🏘️ Loading settlements...');
      const data = await settlementApi.getPublicSettlements();
      console.log('🏘️ Settlements loaded:', data);
      setSettlements(data || []);
    } catch (err) {
      console.error('Failed to load settlements:', err);
      setError('Failed to load settlements. Please check if the game server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettlementClick = (settlement: SettlementListItem) => {
    navigate(`/settlement/${settlement.settlement_id}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settlements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Settlements</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="text-left bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <p className="text-xs font-mono">Endpoint: /settlements/public</p>
            <p className="text-xs font-mono">Server: {API_ENDPOINTS.BASE_URL}</p>
          </div>
          <button
            onClick={loadSettlements}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Public Settlements</h2>
          <p className="text-muted-foreground mb-6">
            There are currently no settlements available for public viewing.
          </p>
          <button
            onClick={loadSettlements}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Public Settlements</h1>
            <p className="text-muted-foreground">
              {settlements.length} settlement{settlements.length !== 1 ? 's' : ''} available for exploration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settlements.map((settlement) => (
            <div
              key={settlement.settlement_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
              onClick={() => handleSettlementClick(settlement)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{settlement.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    settlement.settlement_type === 'City' ? 'bg-blue-100 text-blue-800' :
                    settlement.settlement_type === 'Town' ? 'bg-green-100 text-green-800' :
                    settlement.settlement_type === 'Village' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {settlement.settlement_type}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Population:</span>
                    <span className="font-medium text-gray-900">{settlement.population.toLocaleString()}</span>
                  </div>

                  {settlement.sub_region && (
                    <div className="flex justify-between">
                      <span>Region:</span>
                      <span className="font-medium text-gray-900">{settlement.sub_region}</span>
                    </div>
                  )}

                  {settlement.government_type && (
                    <div className="flex justify-between">
                      <span>Government:</span>
                      <span className="font-medium text-gray-900">{settlement.government_type}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Trade Importance:</span>
                    <div className="flex">
                      {[...Array(10)].map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 mr-1 rounded-full ${
                            i < settlement.trade_importance ? 'bg-yellow-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Coordinates: ({settlement.x_coordinate.toFixed(1)}, {settlement.y_coordinate.toFixed(1)})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Public Settlements</h2>
          <p className="text-gray-600">There are currently no settlements available for public viewing.</p>
        </div>
      )}
    </div>
  );
};