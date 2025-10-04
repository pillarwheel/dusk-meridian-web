# Immutable X Passport Integration Guide

**Date:** 2025-10-04
**Status:** ✓ Implemented and Active

## Overview

This document describes the integration of Immutable X (IMX) Passport for Web3 authentication and wallet management in the Dusk Meridian web frontend. IMX Passport provides OAuth-based authentication, wallet connectivity, and blockchain transaction signing.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration](#configuration)
3. [Authentication Flow](#authentication-flow)
4. [Wallet Association](#wallet-association)
5. [Character-to-Wallet Binding](#character-to-wallet-binding)
6. [API Integration](#api-integration)
7. [Code Examples](#code-examples)
8. [Unity Integration Guide](#unity-integration-guide)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

---

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐      ┌────────────────────────┐  │
│  │ IMXAuthContext   │◄────►│ imxPassportService     │  │
│  │ (State Manager)  │      │ (Passport SDK Wrapper) │  │
│  └────────┬─────────┘      └──────────┬─────────────┘  │
│           │                            │                 │
│  ┌────────▼─────────┐      ┌──────────▼─────────────┐  │
│  │ useIMXAuth Hook  │      │  IMX Passport SDK      │  │
│  │ (Components)     │      │  (@imtbl/sdk)          │  │
│  └──────────────────┘      └────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (C#)                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  POST /api/auth/immutable-login                          │
│  POST /api/auth/connect-wallet                           │
│  POST /api/nft/validate-nfts                             │
│  POST /api/character/create                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Key Files

**Frontend:**
- `src/services/imxPassport.ts` - IMX Passport SDK wrapper service
- `src/contexts/IMXAuthContext.tsx` - React context for authentication state
- `src/api/endpoints/auth.ts` - Backend authentication API calls
- `src/api/endpoints/characterCreation.ts` - Character creation with wallet validation

**Backend:**
- `GameServer/Controllers/AuthController.cs` - Authentication endpoints
- `GameServer/Controllers/NFTController.cs` - NFT validation endpoints
- `GameServer/Controllers/CharacterController.cs` - Character creation endpoints

---

## Configuration

### Environment Variables

Create a `.env` file in `dusk-meridian-web/` with the following variables:

```bash
# IMX Passport Configuration
VITE_IMX_CLIENT_ID=your_imx_client_id_here
VITE_IMX_PUBLISHABLE_KEY=your_imx_publishable_key_here
VITE_IMX_ENVIRONMENT=SANDBOX  # or PRODUCTION
VITE_CHAIN_ID=13371  # IMX zkEVM testnet chain ID

# API Configuration
VITE_API_URL=http://localhost:5105/api
```

### IMX Passport Setup

1. **Register your application** at [Immutable Developer Hub](https://hub.immutable.com/)
2. **Create a Passport client** and obtain:
   - Client ID
   - Publishable Key
3. **Configure redirect URIs:**
   - Development: `http://localhost:8080/redirect`
   - Production: `https://yourdomain.com/redirect`
4. **Set logout redirect URIs:**
   - Development: `http://localhost:8080/logout`
   - Production: `https://yourdomain.com/logout`

### Passport Initialization

The `imxPassportService` initializes automatically on app load:

```typescript
// src/services/imxPassport.ts (simplified)
class IMXPassportService {
  private passportInstance: passport.Passport | null = null;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_IMX_CLIENT_ID,
      publishableKey: import.meta.env.VITE_IMX_PUBLISHABLE_KEY,
      environment: import.meta.env.VITE_IMX_ENVIRONMENT,
      redirectUri: `${window.location.origin}/redirect`,
      logoutRedirectUri: `${window.location.origin}/logout`,
    };

    this.initialize();
  }

  private initialize() {
    this.passportInstance = new passport.Passport({
      baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: this.config.publishableKey,
      },
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri,
      logoutRedirectUri: this.config.logoutRedirectUri,
      audience: 'platform_api',
      scope: 'openid offline_access email transact',
    });
  }
}
```

---

## Authentication Flow

### Login Process

```
┌────────┐                 ┌──────────┐               ┌─────────┐
│ User   │                 │ Frontend │               │ IMX     │
└───┬────┘                 └────┬─────┘               └────┬────┘
    │                           │                          │
    │ 1. Click "Login with IMX" │                          │
    │──────────────────────────►│                          │
    │                           │                          │
    │                           │ 2. passport.login()      │
    │                           │─────────────────────────►│
    │                           │                          │
    │                           │   3. OAuth redirect      │
    │◄──────────────────────────┼──────────────────────────┤
    │                           │                          │
    │ 4. User authenticates     │                          │
    │──────────────────────────────────────────────────────►
    │                           │                          │
    │                           │   5. Callback with code  │
    │                           ◄──────────────────────────┤
    │                           │                          │
    │                           │ 6. loginCallback()       │
    │                           │─────────────────────────►│
    │                           │                          │
    │                           │ 7. Access + ID tokens    │
    │                           ◄──────────────────────────┤
    │                           │                          │
    │                           │ 8. Get user info         │
    │                           │─────────────────────────►│
    │                           │                          │
    │                           │ 9. User profile          │
    │                           ◄──────────────────────────┤
    │                           │                          │
    │ 10. Authenticated         │                          │
    │◄──────────────────────────┤                          │
    │                           │                          │
```

### Frontend Implementation

```typescript
// Using the IMXAuthContext
import { useIMXAuth } from '@/contexts/IMXAuthContext';

function LoginButton() {
  const { login, isAuthenticated, user } = useIMXAuth();

  const handleLogin = async () => {
    try {
      await login();
      console.log('User logged in:', user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isAuthenticated) {
    return <div>Welcome, {user?.nickname || user?.email}</div>;
  }

  return <button onClick={handleLogin}>Login with IMX Passport</button>;
}
```

### Backend Authentication

After IMX Passport login, the frontend sends tokens to the backend:

```typescript
// src/api/endpoints/auth.ts
async loginWithImmutable(accessToken: string, idToken: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/immutable-login', {
    accessToken,
    idToken,
  });
  return response.data;
}
```

Backend validates the IMX tokens and creates a session:

```csharp
// GameServer/Controllers/AuthController.cs
[HttpPost("immutable-login")]
public async Task<IActionResult> ImmutableLogin([FromBody] ImmutableLoginRequest request)
{
    // Validate IMX tokens
    var userInfo = await _imxService.ValidateToken(request.AccessToken);

    // Get or create user account
    var user = await _userService.GetOrCreateUserByIMXId(userInfo.Sub);

    // Create session
    var session = await _sessionService.CreateSession(user.Id);

    return Ok(new LoginResponse
    {
        AccessToken = session.Token,
        User = user
    });
}
```

---

## Wallet Association

### Connecting Wallet

After authentication, users can connect their IMX wallet to access blockchain features:

```typescript
// Component example
import { useIMXAuth } from '@/contexts/IMXAuthContext';

function WalletConnectButton() {
  const { connectWallet, walletAddress, isAuthenticated } = useIMXAuth();

  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      console.log('Wallet connected:', address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login first</div>;
  }

  if (walletAddress) {
    return <div>Wallet: {walletAddress}</div>;
  }

  return <button onClick={handleConnect}>Connect Wallet</button>;
}
```

### Wallet Connection Flow

```
┌────────┐              ┌──────────┐              ┌─────────┐
│ User   │              │ Frontend │              │ IMX     │
└───┬────┘              └────┬─────┘              └────┬────┘
    │                        │                         │
    │ 1. Click "Connect"     │                         │
    │───────────────────────►│                         │
    │                        │                         │
    │                        │ 2. connectEvm()         │
    │                        │────────────────────────►│
    │                        │                         │
    │                        │ 3. Request accounts     │
    │                        │────────────────────────►│
    │                        │                         │
    │                        │ 4. Wallet address       │
    │                        ◄─────────────────────────┤
    │                        │                         │
    │                        │ 5. Send to backend      │
    │                        │─────────────────────────┼──►Backend
    │                        │                         │
    │                        │ 6. Association saved    │
    │                        ◄─────────────────────────┼───┤
    │                        │                         │
    │ 7. Wallet connected    │                         │
    │◄───────────────────────┤                         │
    │                        │                         │
```

### Backend Wallet Association

```csharp
// GameServer/Controllers/AuthController.cs
[HttpPost("connect-wallet")]
[Authorize]
public async Task<IActionResult> ConnectWallet([FromBody] ConnectWalletRequest request)
{
    var userId = GetCurrentUserId();

    // Verify signature to prove wallet ownership
    var isValid = await _walletService.VerifySignature(
        request.Address,
        request.Message,
        request.Signature
    );

    if (!isValid)
    {
        return BadRequest("Invalid signature");
    }

    // Associate wallet with user account
    await _walletService.AssociateWallet(userId, request.Address);

    return Ok();
}
```

---

## Character-to-Wallet Binding

### NFT-Gated Character Creation

Characters can be created with NFT validation to unlock bonuses:

```typescript
// Character creation with NFT validation
import { characterCreationApi } from '@/api/endpoints/characterCreation';
import { useIMXAuth } from '@/contexts/IMXAuthContext';

function CharacterCreation() {
  const { walletAddress } = useIMXAuth();
  const [nftBonuses, setNftBonuses] = useState(null);

  // Step 1: Validate NFTs
  useEffect(() => {
    if (walletAddress) {
      loadNFTBonuses();
    }
  }, [walletAddress]);

  const loadNFTBonuses = async () => {
    const bonuses = await characterCreationApi.getNFTBonuses(walletAddress);
    setNftBonuses(bonuses);
  };

  // Step 2: Create character
  const createCharacter = async (characterData) => {
    const request = {
      ...characterData,
      walletAddress: walletAddress,  // Links character to wallet
    };

    const response = await characterCreationApi.createCharacter(request);
    console.log('Character created:', response.characterId);
  };
}
```

### NFT Validation Response

```typescript
// Example NFT validation response
interface NFTValidationResponse {
  hasNFTs: boolean;
  nftCount: number;
  highestTier: number;
  nfts: Array<{
    tokenId: string;
    tier: number;
    name: string;
    imageUrl: string;
  }>;
}

// Example NFT bonuses
interface NFTBonuses {
  attributePointBonus: number;    // Extra attribute points
  skillPointBonus: number;         // Extra skill slots
  characterSlotBonus: number;      // Extra character slots
  specialAbilities: string[];      // Unlocked abilities
  unlockedCustomizations: string[]; // Cosmetic unlocks
}
```

### Character-Wallet Database Schema

```sql
-- Characters table includes wallet association
CREATE TABLE Characters (
    character_id INTEGER PRIMARY KEY,
    character_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    wallet_address TEXT,  -- IMX wallet address
    nft_tier INTEGER,     -- NFT tier used for creation
    created_at DATETIME,
    ...
);

-- WalletToCharacter mapping table
CREATE TABLE WalletToCharacter (
    wallet_address TEXT NOT NULL,
    character_id INTEGER NOT NULL,
    bound_at DATETIME NOT NULL,
    PRIMARY KEY (wallet_address, character_id),
    FOREIGN KEY (character_id) REFERENCES Characters(character_id)
);
```

---

## API Integration

### Backend Endpoints

#### Authentication

**POST /api/auth/immutable-login**
```json
// Request
{
  "accessToken": "eyJhbGciOiJSUzI1...",
  "idToken": "eyJhbGciOiJSUzI1..."
}

// Response
{
  "accessToken": "backend_session_token",
  "user": {
    "userId": "user_123",
    "email": "user@example.com",
    "walletAddress": "0x..."
  }
}
```

#### Wallet Connection

**POST /api/auth/connect-wallet**
```json
// Request
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "message": "Sign this message to verify wallet ownership"
}

// Response
{
  "userId": "user_123",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "verified": true
}
```

#### NFT Validation

**GET /api/nft/validate-nfts?walletAddress=0x...**
```json
// Response
{
  "hasNFTs": true,
  "nftCount": 3,
  "highestTier": 3,
  "nfts": [
    {
      "tokenId": "123",
      "tier": 3,
      "name": "Elite Character Slot",
      "imageUrl": "https://..."
    }
  ]
}
```

**GET /api/nft/bonuses?walletAddress=0x...**
```json
// Response
{
  "attributePointBonus": 5,
  "skillPointBonus": 2,
  "characterSlotBonus": 1,
  "specialAbilities": ["double_xp", "fast_travel"],
  "unlockedCustomizations": ["elite_armor", "epic_mount"]
}
```

#### Character Creation

**POST /api/character/create**
```json
// Request
{
  "characterName": "Valara Sunfire",
  "race": "High Elf",
  "class": "Mage",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "attributes": {
    "strength": 10,
    "dexterity": 12,
    "intelligence": 18,
    "wisdom": 15,
    "constitution": 14,
    "charisma": 16
  },
  "skills": ["arcane_mastery", "elemental_control"],
  "useNFTBonuses": true
}

// Response
{
  "characterId": 137416,
  "characterName": "Valara Sunfire",
  "success": true,
  "bonusesApplied": {
    "attributePoints": 5,
    "skillSlots": 2
  }
}
```

---

## Code Examples

### Complete Login Flow

```typescript
// Full authentication and wallet connection example
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { authApi } from '@/api/endpoints/auth';

function CompleteAuthFlow() {
  const { login, connectWallet, user, walletAddress, isAuthenticated } = useIMXAuth();
  const [backendSession, setBackendSession] = useState(null);

  // Step 1: Login with IMX Passport
  const handleLogin = async () => {
    try {
      await login();  // This opens IMX OAuth flow
      console.log('IMX authentication successful');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Step 2: Authenticate with backend (automatic after IMX login)
  useEffect(() => {
    if (user?.accessToken && user?.idToken) {
      authenticateBackend();
    }
  }, [user]);

  const authenticateBackend = async () => {
    try {
      const response = await authApi.loginWithImmutable(
        user.accessToken!,
        user.idToken!
      );
      setBackendSession(response);
      console.log('Backend authentication successful');
    } catch (error) {
      console.error('Backend auth failed:', error);
    }
  };

  // Step 3: Connect wallet
  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();

      // Get signature for verification
      const message = `Verify wallet ownership for ${user?.email}`;
      const provider = await imxPassportService.getProvider();
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Send to backend
      await authApi.connectWallet(address, signature, message);
      console.log('Wallet connected and verified');
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <div>
      {!isAuthenticated && (
        <button onClick={handleLogin}>Login with IMX</button>
      )}

      {isAuthenticated && !walletAddress && (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      )}

      {walletAddress && (
        <div>
          <p>User: {user?.email}</p>
          <p>Wallet: {walletAddress}</p>
        </div>
      )}
    </div>
  );
}
```

### Character Creation with NFT Bonuses

```typescript
// Complete character creation with NFT validation
import { characterCreationApi } from '@/api/endpoints/characterCreation';
import { useIMXAuth } from '@/contexts/IMXAuthContext';

function CharacterCreationWizard() {
  const { walletAddress } = useIMXAuth();
  const [nftBonuses, setNftBonuses] = useState(null);
  const [characterData, setCharacterData] = useState({
    name: '',
    race: '',
    class: '',
    attributes: {},
    skills: []
  });

  // Load NFT bonuses
  useEffect(() => {
    if (walletAddress) {
      loadBonuses();
    }
  }, [walletAddress]);

  const loadBonuses = async () => {
    const bonuses = await characterCreationApi.getNFTBonuses(walletAddress!);
    setNftBonuses(bonuses);
  };

  // Calculate total attribute points
  const totalAttributePoints = useMemo(() => {
    let base = 80;  // Base points
    if (nftBonuses?.attributePointBonus) {
      base += nftBonuses.attributePointBonus;
    }
    return base;
  }, [nftBonuses]);

  // Create character
  const handleCreate = async () => {
    try {
      const response = await characterCreationApi.createCharacter({
        ...characterData,
        walletAddress: walletAddress!,
        useNFTBonuses: true
      });

      console.log('Character created:', response.characterId);
      // Navigate to character
    } catch (error) {
      console.error('Creation failed:', error);
    }
  };

  return (
    <div>
      <h1>Create Character</h1>

      {nftBonuses && (
        <div className="nft-bonuses">
          <h2>NFT Bonuses</h2>
          <p>Attribute Points: +{nftBonuses.attributePointBonus}</p>
          <p>Skill Slots: +{nftBonuses.skillPointBonus}</p>
          <p>Character Slots: +{nftBonuses.characterSlotBonus}</p>
        </div>
      )}

      <div>
        <p>Total Attribute Points: {totalAttributePoints}</p>
        {/* Character creation form */}
      </div>

      <button onClick={handleCreate}>Create Character</button>
    </div>
  );
}
```

---

## Unity Integration Guide

### Unity C# IMX Integration

Unity clients can integrate IMX Passport using the Immutable Unity SDK:

```csharp
using System;
using System.Threading.Tasks;
using UnityEngine;
using Immutable.Passport;

public class IMXAuthManager : MonoBehaviour
{
    private Passport passport;
    private string walletAddress;

    [SerializeField] private string clientId = "your_client_id";
    [SerializeField] private string publishableKey = "your_publishable_key";
    [SerializeField] private string environment = "SANDBOX";

    async void Start()
    {
        await InitializePassport();
    }

    private async Task InitializePassport()
    {
        try
        {
            passport = await Passport.Init(clientId);
            Debug.Log("Passport initialized");
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to initialize Passport: {ex.Message}");
        }
    }

    public async Task<bool> Login()
    {
        try
        {
            // Login with Passport
            var credentials = await passport.Login();

            Debug.Log($"User logged in: {credentials.Email}");

            // Get wallet address
            walletAddress = await passport.GetAddress();
            Debug.Log($"Wallet address: {walletAddress}");

            // Send tokens to backend
            await AuthenticateWithBackend(
                credentials.AccessToken,
                credentials.IdToken
            );

            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Login failed: {ex.Message}");
            return false;
        }
    }

    private async Task AuthenticateWithBackend(string accessToken, string idToken)
    {
        string url = "http://localhost:5105/api/auth/immutable-login";

        var requestData = new
        {
            accessToken = accessToken,
            idToken = idToken
        };

        string jsonData = JsonUtility.ToJson(requestData);

        using (var request = UnityWebRequest.Post(url, ""))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            await request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Backend authentication successful");
                var response = JsonUtility.FromJson<LoginResponse>(request.downloadHandler.text);
                PlayerPrefs.SetString("session_token", response.accessToken);
            }
            else
            {
                Debug.LogError($"Backend auth failed: {request.error}");
            }
        }
    }

    public async Task<bool> ConnectWallet()
    {
        try
        {
            // Connect wallet (may trigger UI)
            await passport.ConnectEvm();

            walletAddress = await passport.GetAddress();
            Debug.Log($"Wallet connected: {walletAddress}");

            // Verify wallet ownership
            string message = $"Verify wallet for Unity client";
            string signature = await passport.SignMessage(message);

            // Send to backend
            await SendWalletToBackend(walletAddress, signature, message);

            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Wallet connection failed: {ex.Message}");
            return false;
        }
    }

    private async Task SendWalletToBackend(string address, string signature, string message)
    {
        string url = "http://localhost:5105/api/auth/connect-wallet";

        var requestData = new
        {
            address = address,
            signature = signature,
            message = message
        };

        string jsonData = JsonUtility.ToJson(requestData);
        string sessionToken = PlayerPrefs.GetString("session_token");

        using (var request = UnityWebRequest.Post(url, ""))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {sessionToken}");

            await request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Wallet connected to backend");
            }
            else
            {
                Debug.LogError($"Wallet connection failed: {request.error}");
            }
        }
    }
}

[Serializable]
public class LoginResponse
{
    public string accessToken;
    public UserData user;
}

[Serializable]
public class UserData
{
    public string userId;
    public string email;
    public string walletAddress;
}
```

### Unity Character Creation with NFT Validation

```csharp
using System;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

public class UnityCharacterCreation : MonoBehaviour
{
    private string walletAddress;
    private NFTBonuses nftBonuses;

    [Serializable]
    public class NFTBonuses
    {
        public int attributePointBonus;
        public int skillPointBonus;
        public int characterSlotBonus;
        public string[] specialAbilities;
    }

    public async Task LoadNFTBonuses(string wallet)
    {
        string url = $"http://localhost:5105/api/nft/bonuses?walletAddress={wallet}";

        using (var request = UnityWebRequest.Get(url))
        {
            await request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                nftBonuses = JsonUtility.FromJson<NFTBonuses>(request.downloadHandler.text);
                Debug.Log($"NFT Bonuses loaded: +{nftBonuses.attributePointBonus} attributes");
            }
        }
    }

    public async Task<int> CreateCharacter(CharacterData character)
    {
        string url = "http://localhost:5105/api/character/create";
        string sessionToken = PlayerPrefs.GetString("session_token");

        var requestData = new
        {
            characterName = character.name,
            race = character.race,
            @class = character.characterClass,
            walletAddress = walletAddress,
            attributes = character.attributes,
            skills = character.skills,
            useNFTBonuses = true
        };

        string jsonData = JsonUtility.ToJson(requestData);

        using (var request = UnityWebRequest.Post(url, ""))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {sessionToken}");

            await request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                var response = JsonUtility.FromJson<CreateCharacterResponse>(request.downloadHandler.text);
                Debug.Log($"Character created: {response.characterId}");
                return response.characterId;
            }
            else
            {
                Debug.LogError($"Character creation failed: {request.error}");
                return -1;
            }
        }
    }
}

[Serializable]
public class CharacterData
{
    public string name;
    public string race;
    public string characterClass;
    public AttributeData attributes;
    public string[] skills;
}

[Serializable]
public class AttributeData
{
    public int strength;
    public int dexterity;
    public int intelligence;
    public int wisdom;
    public int constitution;
    public int charisma;
}

[Serializable]
public class CreateCharacterResponse
{
    public int characterId;
    public string characterName;
    public bool success;
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Chain is not set up" Error

**Symptom:** Error when connecting wallet or getting provider

**Cause:** IMX zkEVM chain not configured properly

**Solution:**
```typescript
// Ensure VITE_CHAIN_ID is set correctly
VITE_CHAIN_ID=13371  // IMX zkEVM testnet
```

#### 2. Token Validation Failed

**Symptom:** IMX tokens marked as invalid

**Cause:** Token format or expiration issues

**Solution:**
```typescript
// Check token validation in browser console
const validation = validateIMXToken(token);
console.log('Validation:', validation);

// Tokens expire after 1 hour - refresh if needed
const freshToken = await imxPassportService.getAccessToken();
```

#### 3. NFT Validation Returns Empty

**Symptom:** `hasNFTs: false` even though wallet has NFTs

**Cause:** Backend not querying IMX API correctly, or wallet on wrong network

**Solution:**
- Verify wallet address is correct
- Check backend IMX API configuration
- Ensure NFTs are on correct network (testnet vs mainnet)

#### 4. Redirect Loop After Login

**Symptom:** Infinite redirect between app and IMX OAuth

**Cause:** Redirect URI mismatch

**Solution:**
```typescript
// Verify redirect URI matches exactly in:
// 1. IMX Developer Hub settings
// 2. Frontend configuration
redirectUri: `${window.location.origin}/redirect`
```

### Debug Mode

Enable debug logging:

```typescript
// Set in browser console
localStorage.setItem('imx_debug', 'true');

// View detailed logs
console.log('IMX Token:', localStorage.getItem('imx_access_token'));
console.log('Wallet Address:', localStorage.getItem('imx_wallet_address'));
```

---

## Security Considerations

### Token Storage

✅ **Do:**
- Store tokens in `localStorage` for persistence
- Validate tokens before use
- Clear tokens on logout

❌ **Don't:**
- Store tokens in cookies without HttpOnly flag
- Send tokens in URL parameters
- Log tokens to console in production

### Wallet Verification

Always verify wallet ownership before associating with accounts:

```typescript
// Request signature
const message = `Verify wallet ownership for ${userId}`;
const signature = await provider.request({
  method: 'personal_sign',
  params: [message, walletAddress]
});

// Backend verifies signature
const isValid = await verifySignature(walletAddress, message, signature);
```

### Backend Token Validation

```csharp
// Validate IMX tokens on backend
public async Task<bool> ValidateIMXToken(string accessToken)
{
    // Verify with IMX API
    var response = await httpClient.GetAsync(
        $"https://api.sandbox.immutable.com/userinfo",
        new { Authorization = $"Bearer {accessToken}" }
    );

    return response.IsSuccessStatusCode;
}
```

### Rate Limiting

Implement rate limiting on sensitive endpoints:

```csharp
[HttpPost("connect-wallet")]
[RateLimit(MaxRequests = 10, TimeWindow = 60)] // 10 requests per minute
public async Task<IActionResult> ConnectWallet(...)
```

---

## Related Documentation

### Frontend
- IMX Passport Service: `src/services/imxPassport.ts`
- Auth Context: `src/contexts/IMXAuthContext.tsx`
- Auth API: `src/api/endpoints/auth.ts`
- Character Creation API: `src/api/endpoints/characterCreation.ts`

### Backend
- Auth Controller: `GameServer/Controllers/AuthController.cs`
- NFT Controller: `GameServer/Controllers/NFTController.cs`
- Character Controller: `GameServer/Controllers/CharacterController.cs`

### External Resources
- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEvm/products/passport)
- [Immutable Developer Hub](https://hub.immutable.com/)
- [IMX SDK GitHub](https://github.com/immutable/ts-immutable-sdk)

---

## Summary

| Feature | Status | Notes |
|---------|--------|-------|
| IMX Passport Login | ✅ Implemented | OAuth-based authentication |
| Wallet Connection | ✅ Implemented | EVM wallet via Passport |
| Token Management | ✅ Implemented | Access & ID tokens stored securely |
| Backend Integration | ✅ Implemented | JWT session tokens |
| NFT Validation | ✅ Implemented | Validates owned NFTs for bonuses |
| Character-Wallet Binding | ✅ Implemented | Characters linked to wallet addresses |
| Unity SDK Integration | 📋 Documented | Code examples provided above |

**Status:** ✅ Production Ready (Web Frontend)
**Unity Status:** 📋 Integration guide complete, awaiting Unity implementation
