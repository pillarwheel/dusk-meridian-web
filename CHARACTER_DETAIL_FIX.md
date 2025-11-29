# Character Detail Page Fix - Development Guide

## Problem Summary

When clicking a character from the Settlement Population tab (e.g., `http://localhost:8080/character/1` or `http://localhost:8080/character/180943`), the page shows "Character Not Found".

### Root Cause

1. **Frontend**: The `getCharacter()` method in `src/api/endpoints/character.ts:97-113` only searches through the authenticated user's own characters (`/character/my-characters`)
2. **Settlement Population Characters**: These are NPCs or other players' characters, not owned by the logged-in user
3. **Missing Backend Endpoint**: No public endpoint exists to fetch ANY character by ID

## Required Changes

### 1. Frontend Fix (Already Prepared)

**File**: `dusk-meridian-web/src/api/endpoints/character.ts`

**Replace** the `getCharacter` method (lines 97-113) with:

```typescript
async getCharacter(characterId: string): Promise<CharacterTypes.Character | null> {
  try {
    console.log('🔍 Fetching character by ID:', characterId);

    // Try direct endpoint first (for any character, not just owned ones)
    try {
      const response = await characterApiClient.get<CharacterTypes.Character>(`/character/${characterId}`);
      console.log('✅ Character found via direct endpoint:', response.data);
      return response.data;
    } catch (directError: any) {
      if (directError?.response?.status === 404) {
        console.log('❌ Character not found (404)');
        return null;
      }

      // Fallback to my-characters if endpoint not implemented
      console.log('⚠️ Falling back to my-characters');
      const allCharacters = await this.getCharacters();
      const charactersArray = allCharacters?.characters || allCharacters || [];
      const character = charactersArray.find(c =>
        String(c.id) === String(characterId) || c.id === characterId
      );
      return character || null;
    }
  } catch (error) {
    console.error('Failed to get character:', error);
    return null;
  }
},
```

This code:
- ✅ Tries to fetch from `GET /api/character/{characterId}` first
- ✅ Falls back to `my-characters` if the endpoint doesn't exist
- ✅ Returns null on 404 (character doesn't exist)
- ✅ Provides detailed console logging for debugging

---

### 2. Backend Implementation Required

**Endpoint**: `GET /api/character/{characterId}`

**Purpose**: Return basic character information for ANY character (not just user's own characters)

**Response Type**: Same as the Character type already in use

#### Backend Requirements

**Controller**: CharacterController (or similar)

```csharp
[HttpGet("{characterId}")]
public async Task<ActionResult<CharacterDto>> GetCharacterById(int characterId)
{
    // Fetch character from database
    var character = await _characterService.GetCharacterByIdAsync(characterId);

    if (character == null)
    {
        return NotFound(new { message = $"Character with ID {characterId} not found" });
    }

    // Return character data (public info only, no sensitive data)
    return Ok(character);
}
```

#### Important Considerations

1. **Public Data Only**: This endpoint should return ONLY public character information:
   - ✅ Include: id, name, level, class, health, maxHealth, mana, maxMana, experience, status, position
   - ❌ Exclude: Sensitive data like inventory details, wallet addresses, user IDs, private stats

2. **Authentication**:
   - Should NOT require authentication (or use optional auth)
   - Anyone should be able to view basic character info (like viewing profiles)

3. **Performance**:
   - Consider caching this endpoint (characters don't change frequently)
   - Add database index on character ID if not already present

4. **Privacy**: Consider adding a character visibility setting:
   ```csharp
   if (character.IsPrivate && character.UserId != currentUserId)
   {
       return Forbid(new { message = "This character's profile is private" });
   }
   ```

#### Example Response Format

```json
{
  "id": 180943,
  "name": "Thorin Ironforge",
  "level": 15,
  "class": "Guardian",
  "health": 450,
  "maxHealth": 500,
  "mana": 120,
  "maxMana": 150,
  "experience": 8750,
  "status": "idle",
  "position": {
    "worldId": 1,
    "x": 123.5,
    "y": 45.2,
    "z": 10.0
  },
  "lastActive": "2025-10-21T17:30:00Z"
}
```

---

### 3. Testing Steps

Once backend endpoint is implemented:

1. **Start Backend**: Ensure backend is running on `http://localhost:5105`
2. **Test Endpoint Directly**:
   ```bash
   curl http://localhost:5105/api/character/1
   curl http://localhost:5105/api/character/180943
   ```
   Expected: JSON character data or 404

3. **Test Frontend**:
   - Navigate to a settlement detail page
   - Click the "Population" tab
   - Click any character card
   - Should navigate to `/character/{id}` and display character details

4. **Console Verification**:
   - Open browser DevTools → Console
   - Should see: "✅ Character found via direct endpoint"
   - NOT: "⚠️ Falling back to my-characters"

---

### 4. Current Workaround (Temporary)

Until the backend endpoint is implemented, the frontend will:
- Try the direct endpoint (will fail)
- Fall back to searching through user's own characters
- Show "Character Not Found" for characters not owned by the user

This is expected behavior and won't cause errors.

---

### 5. Related Files

**Frontend**:
- `src/api/endpoints/character.ts` - API client (needs update)
- `src/pages/CharacterDetail.tsx` - Detail page component
- `src/pages/SettlementDetail.tsx:471-482, 496-500` - Character card links

**Backend** (Assumed structure):
- `Controllers/CharacterController.cs` - Add new endpoint here
- `Services/CharacterService.cs` - Add `GetCharacterByIdAsync` method
- `DTOs/CharacterDto.cs` - Response model

---

### 6. Alternative Approach (If Backend Can't Add Endpoint)

If you cannot add a backend endpoint, you can modify the Settlement Population to only show clickable links for the user's own characters:

```typescript
// In SettlementDetail.tsx
const myCharacterIds = new Set(myCharacters.map(c => c.id));

// In character card render
<div
  className={cn(
    "bg-card p-3 rounded-lg border border-border hover:shadow-md transition-shadow",
    myCharacterIds.has(character.characterId) ? "cursor-pointer" : "cursor-default opacity-70"
  )}
  onClick={() => {
    if (myCharacterIds.has(character.characterId)) {
      navigate(`/character/${character.characterId}`);
    }
  }}
>
```

But this is NOT recommended - users should be able to view other characters' profiles.

---

## Summary Checklist

- [ ] Update frontend `character.ts` with new `getCharacter` method
- [ ] Implement backend `GET /api/character/{characterId}` endpoint
- [ ] Test endpoint returns character data for valid IDs
- [ ] Test endpoint returns 404 for invalid IDs
- [ ] Verify frontend character detail pages load correctly
- [ ] Check browser console shows "✅ Character found via direct endpoint"
- [ ] Test with both owned and non-owned character IDs

---

## Questions?

If you need help with:
- Backend C# implementation details
- Database query optimization
- Character privacy/visibility features
- Frontend TypeScript issues

Let me know!
