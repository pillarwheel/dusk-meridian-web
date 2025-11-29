import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Wallet } from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { CharacterCreation } from '@/components/characterCreation/CharacterCreation';
import { ROUTES } from '@/utils/constants';

export const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, walletAddress, connectWallet } = useIMXAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
  }, [user, navigate]);

  const handleCharacterCreated = (character: any) => {
    console.log('✅ Character created successfully:', character);

    // Navigate to the new character's detail page
    if (character?.id) {
      navigate(`${ROUTES.CHARACTER}/${character.id}`);
    } else {
      // Fallback to character list
      navigate(ROUTES.CHARACTER);
    }
  };

  const handleCancel = () => {
    // Navigate back to character list
    navigate(ROUTES.CHARACTER);
  };

  // Show loading if user data is still being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show wallet connection requirement if not connected
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Wallet Connection Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to create a character. Character creation requires NFT validation for access control.
            </p>
            <div className="space-y-3">
              <button
                onClick={connectWallet}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Connect Wallet
              </button>
              <button
                onClick={handleCancel}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Back to Characters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CharacterCreation
      walletAddress={walletAddress}
      onCharacterCreated={handleCharacterCreated}
      onCancel={handleCancel}
    />
  );
};