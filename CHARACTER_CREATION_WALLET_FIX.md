# Character Creation Wallet Fix

## Problem

When navigating to `http://localhost:8080/character/create`, you see:
> **Wallet Connection Required**
> You need to connect your wallet to create a character. Character creation requires NFT validation for access control.

## Root Cause

**File**: `src/pages/CharacterCreation.tsx:10`

```typescript
const { user, walletAddress, isConnected } = useIMXAuth();
```

The code is trying to destructure `isConnected` from the IMX auth context, but **this property doesn't exist** in the `IMXAuthContext`.

Looking at `src/contexts/IMXAuthContext.tsx:15-22`, the available properties are:
- `user`
- `isAuthenticated` ✅ (NOT `isConnected`)
- `isLoading`
- `error`
- `walletAddress`
- `provider`

## Solution Options

### Option 1: Remove Wallet Requirement (Recommended for Development)

If you don't actually need wallet connection for character creation during development, simply remove the wallet check:

**File**: `src/pages/CharacterCreation.tsx`

**Change line 10** from:
```typescript
const { user, walletAddress, isConnected } = useIMXAuth();
```

To:
```typescript
const { user, walletAddress, isAuthenticated } = useIMXAuth();
```

**Remove lines 49-78** (the entire wallet check block), OR change line 50 from:
```typescript
if (!isConnected || !walletAddress) {
```

To:
```typescript
// Optionally skip wallet requirement for development
// if (!walletAddress) {
if (false) {  // Always skip wallet check
```

This will allow character creation without a wallet.

---

### Option 2: Add Wallet Connect Button (If Wallet IS Required)

If wallet connection is actually required for NFT validation, update the page to:
1. Use the correct `isAuthenticated` property
2. Add a "Connect Wallet" button that calls `connectWallet()`

**File**: `src/pages/CharacterCreation.tsx`

**Replace** the entire file with:

```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Wallet } from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { CharacterCreation } from '@/components/characterCreation/CharacterCreation';
import { ROUTES } from '@/utils/constants';

export const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, walletAddress, isAuthenticated, connectWallet } = useIMXAuth();

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

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      if (address) {
        console.log('✅ Wallet connected:', address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
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

  // Show wallet connection requirement if wallet address is not available
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
                onClick={handleConnectWallet}
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
```

**Key Changes**:
1. ✅ Changed `isConnected` to `isAuthenticated` (line 10)
2. ✅ Added `connectWallet` to destructuring (line 10)
3. ✅ Created `handleConnectWallet` function (lines 37-44)
4. ✅ Changed check from `!isConnected || !walletAddress` to just `!walletAddress` (line 60)
5. ✅ Changed "Refresh Page" button to "Connect Wallet" with actual wallet connection (lines 72-76)

---

### Option 3: Make Wallet Optional

If you want character creation to work both with and without a wallet:

**File**: `src/pages/CharacterCreation.tsx`

Simply remove the entire wallet check block (lines 49-78) and pass `walletAddress || ''` to the component:

```typescript
return (
  <CharacterCreation
    walletAddress={walletAddress || ''}  // Pass empty string if no wallet
    onCharacterCreated={handleCharacterCreated}
    onCancel={handleCancel}
  />
);
```

---

## Recommendation

For **development/testing**, use **Option 1** (remove the check).

For **production**, use **Option 2** (add Connect Wallet button).

The current code has a bug (`isConnected` doesn't exist), which is why you're stuck on the wallet screen even if you're authenticated.

---

## Testing

After applying the fix:

1. Navigate to `http://localhost:8080/character/create`
2. You should either:
   - **Option 1**: See the character creation form directly
   - **Option 2**: See a "Connect Wallet" button that actually works
   - **Option 3**: See the character creation form with optional wallet

---

## Related Files

- `src/pages/CharacterCreation.tsx` - Main page (needs fix)
- `src/contexts/IMXAuthContext.tsx` - Auth context (defines available properties)
- `src/components/characterCreation/CharacterCreation.tsx` - Actual creation form component
