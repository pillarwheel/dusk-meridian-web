# Unity Integration Clarifications

**Date:** 2025-10-04
**Purpose:** Clarify what's already implemented vs. Unity team's requests

---

## Unity Team's Request Analysis

The Unity team requested the following "next steps":

### 1. ❓ Update Immutable Dashboard - Add Redirect URIs

**Unity Request:**
```
Add redirect URIs: unity://callback and unity://logout
Verify client ID matches InitPassport.cs
```

**Current Status:** ⚠️ **Platform-Specific Configuration**

**Clarification:**
- The **web frontend** already has redirect URIs configured:
  - `http://localhost:8080/redirect` (development)
  - `http://localhost:8080/logout` (development)

- The Unity URIs (`unity://callback` and `unity://logout`) are **Unity-specific** custom URL schemes
- These need to be added **in addition to** the web URIs, not as replacements
- Both platforms can use the **same IMX Client ID** but with **different redirect URIs**

**What Unity Needs:**
1. Go to [Immutable Developer Hub](https://hub.immutable.com/)
2. Navigate to your Passport client configuration
3. **Add** the following redirect URIs (don't remove existing web URIs):
   ```
   unity://callback
   unity://logout
   ```
4. Verify the Client ID in Unity's `InitPassport.cs` matches the web frontend's Client ID

**Web Frontend Configuration:**
```env
# .env file (already configured)
VITE_IMX_CLIENT_ID=cixZTDwIA66HE6EFE3W6ZwcNbd1QLWYu
VITE_IMX_PUBLISHABLE_KEY=pk_imapik-test-xxxxx
VITE_IMX_ENVIRONMENT=SANDBOX
```

**Unity Should Use:**
```csharp
// InitPassport.cs
private string clientId = "cixZTDwIA66HE6EFE3W6ZwcNbd1QLWYu"; // Same as web
private string redirectUri = "unity://callback";
private string logoutRedirectUri = "unity://logout";
```

---

### 2. ✅ Run Database Migration - PassportToCharacter

**Unity Request:**
```sql
INSERT INTO "PassportToCharacter" (passport_wallet_address, character_id, created_at)
VALUES ('0xe06b48766c74a65414836b5c97d905d4dd21cece', 1, NOW())
ON CONFLICT DO NOTHING;
```

**Current Status:** ✅ **ALREADY EXISTS**

**What's Actually in Database:**

```sql
-- Actual PassportToCharacter table schema
CREATE TABLE PassportToCharacter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imx_passport_id VARCHAR(255) NOT NULL UNIQUE,
    imx_email VARCHAR(255),
    wallet_address VARCHAR(42),
    character_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES Characters(character_id)
);
```

**Existing Data:**
```
id: 1
imx_passport_id: 644090537ac4f2910d7477d2
imx_email: filmmaker.steve@gmail.com
wallet_address: 0xe06b48766c74a65414836b5c97d905d4dd21cece
character_id: 1
created_at: 2025-09-28 11:29:31
updated_at: 2025-09-28 11:29:31
```

**Character Details:**
```
character_id: 1
character_name: Xyvaris Horoshko of the Sky
```

**Clarification:**

The Unity team's SQL is **incorrect** in two ways:

1. **Wrong column name:** They used `passport_wallet_address` but the actual column is `wallet_address`
2. **Missing required field:** The table requires `imx_passport_id` (the user's IMX sub ID)
3. **Already exists:** This exact mapping already exists in the database!

**Correct SQL (if you needed to insert):**
```sql
INSERT INTO PassportToCharacter (
    imx_passport_id,
    imx_email,
    wallet_address,
    character_id,
    created_at,
    updated_at
)
VALUES (
    '644090537ac4f2910d7477d2',  -- IMX Passport ID (sub)
    'filmmaker.steve@gmail.com',  -- IMX email
    '0xe06b48766c74a65414836b5c97d905d4dd21cece',  -- Wallet address
    1,  -- Character ID
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (imx_passport_id) DO NOTHING;
```

**But this is unnecessary because the data already exists!**

---

### 3. ⚠️ Test Authentication - Verify All 6 Steps

**Unity Request:**
```
- Start GameServer (localhost:5105)
- Run Unity Login scene
- Click Login button
- Verify console logs show all 6 steps completing successfully
```

**Current Status:** ⚠️ **Web Frontend Works - Unity Needs Testing**

**What's Already Working (Web Frontend):**

The web frontend has a fully functional IMX Passport integration:

1. ✅ IMX Passport initialization
2. ✅ OAuth login flow
3. ✅ Token exchange (access + ID tokens)
4. ✅ User profile retrieval
5. ✅ Wallet connection
6. ✅ Backend authentication (`POST /api/auth/immutable-login`)

**Web Frontend Login Flow:**
```typescript
// This works in production on the web
const { login, user, walletAddress } = useIMXAuth();

// 1. User clicks login
await login();

// 2. Redirects to IMX OAuth
// 3. User authenticates
// 4. Callback with tokens
// 5. Get user profile
// 6. Connect wallet

console.log('User:', user);
console.log('Wallet:', walletAddress);
```

**What Unity Should Verify:**

The Unity team needs to ensure their implementation follows the same flow:

**Expected Unity Console Output:**
```
Step 1: ✅ Passport initialized
Step 2: ✅ Login initiated
Step 3: ✅ OAuth callback received
Step 4: ✅ Tokens obtained (access + ID)
Step 5: ✅ User profile retrieved
Step 6: ✅ Backend authenticated
```

**Backend Endpoint (Already Implemented):**

```http
POST http://localhost:5105/api/auth/immutable-login
Content-Type: application/json

{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response:**
```json
{
  "accessToken": "backend_session_token_here",
  "user": {
    "userId": "user_123",
    "email": "filmmaker.steve@gmail.com",
    "walletAddress": "0xe06b48766c74a65414836b5c97d905d4dd21cece",
    "imxPassportId": "644090537ac4f2910d7477d2"
  }
}
```

---

## Summary of Corrections

| Unity Request | Status | Correction Needed |
|---------------|--------|-------------------|
| 1. Add Unity redirect URIs to IMX Dashboard | ⚠️ Needed | Add `unity://callback` and `unity://logout` to **existing** web URIs (don't replace) |
| 2. Run database migration | ✅ Already Done | Data already exists in `PassportToCharacter` table with correct schema |
| 3. Test authentication flow | ⚠️ Unity-Specific | Web frontend works; Unity needs to verify their implementation matches |

---

## Key Points for Unity Team

### 1. Database is Ready

The `PassportToCharacter` table **already exists** with:
- ✅ Correct schema
- ✅ Proper indexes
- ✅ Foreign key constraints
- ✅ Existing test data for wallet `0xe06b48766c74a65414836b5c97d905d4dd21cece`

**No migration needed!**

### 2. Backend API is Ready

The following endpoints are **already implemented and working**:

```
POST /api/auth/immutable-login       ✅ Implemented
POST /api/auth/connect-wallet        ✅ Implemented
GET  /api/nft/validate-nfts          ✅ Implemented
GET  /api/nft/bonuses                ✅ Implemented
POST /api/character/create           ✅ Implemented
```

**Unity can call these endpoints immediately!**

### 3. IMX Configuration Needs Unity URIs

The IMX Passport client needs **both** web and Unity redirect URIs:

**Current (Web Only):**
```
✅ http://localhost:8080/redirect
✅ http://localhost:8080/logout
```

**Add Unity URIs:**
```
❌ unity://callback  (MISSING - Unity needs to add)
❌ unity://logout     (MISSING - Unity needs to add)
```

Both can use the **same Client ID**: `cixZTDwIA66HE6EFE3W6ZwcNbd1QLWYu`

---

## Testing Checklist for Unity

### Pre-Flight Check

- [ ] GameServer is running on `localhost:5105`
- [ ] IMX Dashboard has Unity redirect URIs added
- [ ] Unity `InitPassport.cs` has correct Client ID
- [ ] Database has `PassportToCharacter` table (already exists)

### Unity Login Test

```csharp
// Unity test code
public async Task TestLogin()
{
    // 1. Initialize Passport
    Debug.Log("Step 1: Initializing Passport...");
    await Passport.Init(clientId);
    Debug.Log("✅ Step 1: Passport initialized");

    // 2. Login
    Debug.Log("Step 2: Starting login...");
    var credentials = await passport.Login();
    Debug.Log("✅ Step 2: Login complete");

    // 3. Get tokens
    Debug.Log("Step 3: Getting tokens...");
    string accessToken = credentials.AccessToken;
    string idToken = credentials.IdToken;
    Debug.Log("✅ Step 3: Tokens obtained");

    // 4. Get user profile
    Debug.Log("Step 4: Getting user profile...");
    string email = credentials.Email;
    Debug.Log($"✅ Step 4: User profile - {email}");

    // 5. Connect wallet
    Debug.Log("Step 5: Connecting wallet...");
    string walletAddress = await passport.GetAddress();
    Debug.Log($"✅ Step 5: Wallet connected - {walletAddress}");

    // 6. Authenticate with backend
    Debug.Log("Step 6: Authenticating with backend...");
    var response = await AuthenticateBackend(accessToken, idToken);
    Debug.Log($"✅ Step 6: Backend authenticated - Session token: {response.accessToken}");
}
```

### Expected Database State After Login

After a successful Unity login, verify the database:

```sql
-- Check if passport mapping exists
SELECT
    pc.id,
    pc.imx_passport_id,
    pc.imx_email,
    pc.wallet_address,
    pc.character_id,
    c.character_name
FROM PassportToCharacter pc
JOIN Characters c ON pc.character_id = c.character_id
WHERE pc.wallet_address = '0xe06b48766c74a65414836b5c97d905d4dd21cece';
```

**Expected Result:**
```
id: 1
imx_passport_id: 644090537ac4f2910d7477d2
imx_email: filmmaker.steve@gmail.com
wallet_address: 0xe06b48766c74a65414836b5c97d905d4dd21cece
character_id: 1
character_name: Xyvaris Horoshko of the Sky
```

---

## Common Unity Integration Mistakes

### ❌ Wrong: Using Web Redirect URIs in Unity
```csharp
// DON'T DO THIS
private string redirectUri = "http://localhost:8080/redirect";
```

### ✅ Correct: Using Unity Custom URL Scheme
```csharp
// DO THIS
private string redirectUri = "unity://callback";
```

### ❌ Wrong: Trying to Insert Duplicate Database Entry
```sql
-- This will fail because the data already exists
INSERT INTO PassportToCharacter (wallet_address, character_id, created_at)
VALUES ('0xe06b48766c74a65414836b5c97d905d4dd21cece', 1, NOW());
```

### ✅ Correct: Verify Existing Mapping
```sql
-- Check if mapping already exists
SELECT * FROM PassportToCharacter
WHERE wallet_address = '0xe06b48766c74a65414836b5c97d905d4dd21cece';
```

### ❌ Wrong: Using Incorrect Column Names
```sql
-- Column 'passport_wallet_address' does not exist
INSERT INTO PassportToCharacter (passport_wallet_address, ...)
```

### ✅ Correct: Using Actual Column Names
```sql
-- Correct column names
INSERT INTO PassportToCharacter (
    imx_passport_id,  -- Required!
    wallet_address,   -- Correct name
    ...
)
```

---

## Next Steps for Unity Team

1. **Add Unity URIs to IMX Dashboard** (5 minutes)
   - Login to https://hub.immutable.com/
   - Add `unity://callback` and `unity://logout`
   - Keep existing web URIs

2. **Verify Database** (Already Done - Just Check)
   ```bash
   sqlite3 world.db "SELECT * FROM PassportToCharacter LIMIT 5;"
   ```

3. **Test Unity Login Flow** (Follow checklist above)
   - Run GameServer
   - Run Unity Login scene
   - Click Login
   - Verify all 6 steps in console

4. **Report Results**
   - Share console logs
   - Share any errors
   - Confirm database state

---

## Related Documentation

- **Web Integration Guide:** `IMX-PASSPORT-INTEGRATION.md` (complete implementation reference)
- **Database Schema:** `PassportToCharacter` table already exists in `world.db`
- **Backend API:** All endpoints implemented in `GameServer/Controllers/`
- **Unity SDK Docs:** [Immutable Unity SDK](https://docs.immutable.com/docs/zkEvm/products/passport/unity)

---

## Contact

If Unity team has issues:
1. Check web frontend implementation (it works!)
2. Compare Unity code to web TypeScript examples
3. Verify IMX Dashboard has Unity redirect URIs
4. Share console logs for debugging

**Remember:** The backend and database are **ready to go**. Unity just needs to configure their redirect URIs and test!
