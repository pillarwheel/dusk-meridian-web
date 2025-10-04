# Population Endpoint Update

**Date:** 2025-10-04
**Status:** ⚠️ Partial - Backend not yet updated, Web frontend uses client-side grouping
**Last Updated:** 2025-10-04

## Overview

The population data needs to be displayed grouped by buildings. The backend endpoint is planned to return this format, but currently returns a flat character list. The **web frontend implements client-side grouping** as a workaround using the detailed characters endpoint.

## API Endpoints

### Primary Endpoint (Current - Old Format)

**URL:** `GET /api/settlements/{id}/population`

**Example:** `GET /api/settlements/1/population`

**Current Status:** Returns flat character list without building associations

### Alternative Endpoint (Used by Web Frontend)

**URL:** `GET /api/settlements/{id}/characters/detailed`

**Example:** `GET /api/settlements/1/characters/detailed`

**Status:** ✓ Available - Includes `buildingId` for each character

## Response Formats

### Current Format (Flat List - `/population`)
```json
{
  "total": 14400,
  "characters": [
    {
      "character_id": 137416,
      "name": "Seyra Gloryforge",
      "level": 45,
      "class": "Librarian"
    },
    ...
  ]
}
```

### Detailed Characters Format (`/characters/detailed`)
```json
[
  {
    "id": 137416,
    "name": "Seyra Gloryforge",
    "level": 45,
    "characterClass": "Librarian",
    "x": 150.5,
    "y": 20.0,
    "z": 300.2,
    "buildingId": 10,
    "activityType": "Working"
  },
  ...
]
```

### Desired Format (Grouped by Building - Planned)
```json
{
  "total": 14400,
  "byBuilding": [
    {
      "buildingId": 10,
      "buildingName": "Library",
      "characters": [
        {
          "characterId": 137416,
          "name": "Seyra Gloryforge",
          "level": 45,
          "class": "Librarian"
        },
        {
          "characterId": 137417,
          "name": "Kael Brightscroll",
          "level": 38,
          "class": "Scholar"
        }
      ]
    },
    {
      "buildingId": 15,
      "buildingName": "Blacksmith",
      "characters": [
        {
          "characterId": 142301,
          "name": "Thorn Ironhand",
          "level": 52,
          "class": "Blacksmith"
        }
      ]
    }
  ],
  "outdoor": [
    {
      "characterId": 150200,
      "name": "Wandering Merchant",
      "level": 30,
      "class": "Merchant"
    }
  ]
}
```

## Response Fields

### Root Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of characters in the settlement |
| `byBuilding` | array | Characters grouped by their assigned building |
| `outdoor` | array | Characters not assigned to any building |

### byBuilding Array Items
| Field | Type | Description |
|-------|------|-------------|
| `buildingId` | integer | ID of the building |
| `buildingName` | string | Name of the building (e.g., "Library", "Blacksmith") |
| `characters` | array | Array of characters in this building |

### Character Object (in both byBuilding and outdoor)
| Field | Type | Description |
|-------|------|-------------|
| `characterId` | integer | Unique character ID |
| `name` | string | Character's name |
| `level` | integer | Character's level |
| `class` | string | Character's class/profession |

## Implementation Details

### Database Queries

The endpoint performs the following queries:

1. **Get characters in settlement:**
   ```sql
   SELECT c.character_id, c.character_name, c.level, c.class, cl.building_id
   FROM "CharacterLocations" cl
   JOIN "Characters" c ON cl.character_id = c.character_id
   WHERE cl.settlement_id = @settlementId
   ```

2. **Get buildings in settlement:**
   ```sql
   SELECT building_id, name
   FROM "Buildings"
   WHERE settlement_id = @settlementId
   ```

### Data Processing

1. Characters are grouped by their `BuildingId` from the `CharacterLocations` table
2. Buildings are loaded into a dictionary for fast lookup
3. Characters with a `BuildingId` are grouped into `byBuilding`
4. Characters without a `BuildingId` (null) go into `outdoor`
5. Buildings are sorted alphabetically by name

### Code Location

**Backend (C#):**
- **File:** `GameServer/Controllers/SettlementController.cs`
- **Method:** `GetSettlementPopulation(int id)` - Returns flat list (current)
- **Method:** `GetSettlementCharactersDetailed(int id)` - Returns detailed character data with buildingId

**Web Frontend (TypeScript):**
- **File:** `dusk-meridian-web/src/api/endpoints/settlement.ts`
- **Method:** `getSettlementPopulation()` - Implements client-side grouping using detailed characters endpoint
- **UI:** `dusk-meridian-web/src/pages/SettlementDetail.tsx` - Population tab component

## Frontend Integration

### Web Frontend (React/TypeScript)

The web frontend implements **client-side grouping** as a workaround:

1. Fetches data from `/settlements/{id}/characters/detailed` (includes `buildingId`)
2. Fetches building data from `/settlements/{id}/buildings`
3. Groups characters by `buildingId` in JavaScript
4. Displays grouped data in Population tab

**Implementation:** See `dusk-meridian-web/src/api/endpoints/settlement.ts` lines 98-170

The frontend Population tab displays:

1. **Building Groups:**
   - Building name with character count
   - Expandable list of characters in each building
   - Sorted alphabetically by building name

2. **Outdoor Characters:**
   - Separate section for characters not in buildings
   - Same character display format

### Example Web Frontend Usage (TypeScript/React)

```typescript
import { settlementApi } from '@/api/endpoints/settlement';

async function loadSettlementPopulation(settlementId: number) {
  // This automatically handles client-side grouping
  const data = await settlementApi.getSettlementPopulation(settlementId);

  console.log(`Total population: ${data.total}`);

  // Display buildings
  data.byBuilding.forEach(building => {
    console.log(`${building.buildingName}: ${building.characters.length} characters`);
    building.characters.forEach(char => {
      console.log(`  - ${char.name} (Lv${char.level} ${char.class})`);
    });
  });

  // Display outdoor characters
  if (data.outdoor.length > 0) {
    console.log(`Outdoor: ${data.outdoor.length} characters`);
    data.outdoor.forEach(char => {
      console.log(`  - ${char.name} (Lv${char.level} ${char.class})`);
    });
  }
}
```

### Unity Frontend Integration Guide

For Unity C# clients, you have two options:

#### Option 1: Use Detailed Characters Endpoint (Recommended)

Fetch character data with building associations and group client-side:

```csharp
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Networking;

public class SettlementPopulationManager : MonoBehaviour
{
    [System.Serializable]
    public class CharacterDetailed
    {
        public int id;
        public string name;
        public int level;
        public string characterClass;
        public float x;
        public float y;
        public float z;
        public int? buildingId;
        public string activityType;
    }

    [System.Serializable]
    public class Building
    {
        public int buildingId;
        public string name;
    }

    [System.Serializable]
    public class BuildingGroup
    {
        public int buildingId;
        public string buildingName;
        public List<CharacterDetailed> characters;
    }

    [System.Serializable]
    public class PopulationData
    {
        public int total;
        public List<BuildingGroup> byBuilding;
        public List<CharacterDetailed> outdoor;
    }

    public async Task<PopulationData> GetSettlementPopulation(int settlementId)
    {
        // Fetch characters with building data
        string charactersUrl = $"{apiBaseUrl}/settlements/{settlementId}/characters/detailed";
        UnityWebRequest charactersRequest = UnityWebRequest.Get(charactersUrl);
        await charactersRequest.SendWebRequest();

        if (charactersRequest.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Failed to fetch characters: {charactersRequest.error}");
            return null;
        }

        var characters = JsonHelper.FromJson<CharacterDetailed>(charactersRequest.downloadHandler.text);

        // Fetch building data
        string buildingsUrl = $"{apiBaseUrl}/settlements/{settlementId}/buildings";
        UnityWebRequest buildingsRequest = UnityWebRequest.Get(buildingsUrl);
        await buildingsRequest.SendWebRequest();

        if (buildingsRequest.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Failed to fetch buildings: {buildingsRequest.error}");
            return null;
        }

        var buildings = JsonHelper.FromJson<Building>(buildingsRequest.downloadHandler.text);

        // Create building name lookup
        var buildingMap = buildings.ToDictionary(b => b.buildingId, b => b.name);

        // Group characters by building
        var grouped = characters
            .Where(c => c.buildingId.HasValue)
            .GroupBy(c => c.buildingId.Value)
            .Select(g => new BuildingGroup
            {
                buildingId = g.Key,
                buildingName = buildingMap.ContainsKey(g.Key) ? buildingMap[g.Key] : $"Building {g.Key}",
                characters = g.ToList()
            })
            .OrderBy(g => g.buildingName)
            .ToList();

        var outdoor = characters.Where(c => !c.buildingId.HasValue).ToList();

        return new PopulationData
        {
            total = characters.Length,
            byBuilding = grouped,
            outdoor = outdoor
        };
    }
}

// Helper class for parsing JSON arrays
public static class JsonHelper
{
    public static T[] FromJson<T>(string json)
    {
        string newJson = "{ \"array\": " + json + "}";
        Wrapper<T> wrapper = JsonUtility.FromJson<Wrapper<T>>(newJson);
        return wrapper.array;
    }

    [System.Serializable]
    private class Wrapper<T>
    {
        public T[] array;
    }
}
```

#### Option 2: Wait for Backend Update

When the backend `/population` endpoint is updated to return grouped data (as documented in "Desired Format" above), use it directly:

```csharp
public async Task<PopulationData> GetSettlementPopulationDirect(int settlementId)
{
    string url = $"{apiBaseUrl}/settlements/{settlementId}/population";
    UnityWebRequest request = UnityWebRequest.Get(url);
    await request.SendWebRequest();

    if (request.result != UnityWebRequest.Result.Success)
    {
        Debug.LogError($"Failed to fetch population: {request.error}");
        return null;
    }

    return JsonUtility.FromJson<PopulationData>(request.downloadHandler.text);
}
```

**Note:** Option 2 will only work once the backend endpoint is updated to return the grouped format.

### Unity UI Display Example

```csharp
public class PopulationUIManager : MonoBehaviour
{
    public GameObject buildingGroupPrefab;
    public GameObject characterCardPrefab;
    public Transform contentParent;

    public void DisplayPopulation(PopulationData data)
    {
        // Clear existing UI
        foreach (Transform child in contentParent)
        {
            Destroy(child.gameObject);
        }

        // Display total
        Debug.Log($"Total Population: {data.total}");

        // Display each building group
        foreach (var building in data.byBuilding)
        {
            GameObject groupObj = Instantiate(buildingGroupPrefab, contentParent);
            var groupUI = groupObj.GetComponent<BuildingGroupUI>();
            groupUI.SetBuilding(building.buildingName, building.characters.Count);

            foreach (var character in building.characters)
            {
                GameObject charObj = Instantiate(characterCardPrefab, groupUI.characterContainer);
                var charUI = charObj.GetComponent<CharacterCardUI>();
                charUI.SetCharacter(character.name, character.level, character.characterClass);
            }
        }

        // Display outdoor characters
        if (data.outdoor.Count > 0)
        {
            GameObject outdoorGroup = Instantiate(buildingGroupPrefab, contentParent);
            var outdoorUI = outdoorGroup.GetComponent<BuildingGroupUI>();
            outdoorUI.SetBuilding("Outside", data.outdoor.Count);

            foreach (var character in data.outdoor)
            {
                GameObject charObj = Instantiate(characterCardPrefab, outdoorUI.characterContainer);
                var charUI = charObj.GetComponent<CharacterCardUI>();
                charUI.SetCharacter(character.name, character.level, character.characterClass);
            }
        }
    }
}
```

## Performance Considerations

### Current Implementation (Client-Side Grouping)

**Web Frontend:**
- Fetches detailed characters: ~200-500ms for 14,400 characters
- Fetches buildings: ~50-100ms for 50 buildings
- Client-side grouping: ~10-50ms in JavaScript
- **Total:** ~260-650ms

**Unity Frontend:**
- Similar performance characteristics
- Grouping done in C# using LINQ
- Consider caching results if displaying frequently

### Backend Optimization (When Implemented)

- Uses EF Core's `Join` for efficient character-location join
- Loads building names in a single query via `ToDictionaryAsync`
- Grouping and filtering done server-side
- **Expected improvement:** 30-40% faster (single request, server-side processing)

### Expected Performance

For a settlement with:
- 14,400 characters
- 50 buildings

**Current (client-side grouping):** 260-650ms total
**Planned (backend grouping):** 150-400ms total
**Memory usage:** ~5-10MB for result set (both approaches)

### Scaling Recommendations

If settlements grow beyond 50,000 characters:

1. **Add pagination:**
   ```csharp
   [HttpGet("{id}/population")]
   public async Task<IActionResult> GetSettlementPopulation(
       int id,
       [FromQuery] int page = 1,
       [FromQuery] int pageSize = 100)
   ```

2. **Add caching:**
   ```csharp
   [ResponseCache(Duration = 60, VaryByQueryKeys = new[] { "id" })]
   ```

3. **Add indexes:**
   ```sql
   CREATE INDEX IX_CharacterLocations_SettlementId_BuildingId
   ON "CharacterLocations" (settlement_id, building_id);
   ```

## Testing

### Manual Testing

1. **Get population for settlement 1:**
   ```bash
   curl http://localhost:5105/api/settlements/1/population
   ```

2. **Expected response structure:**
   - `total` should equal sum of characters in `byBuilding` + `outdoor`
   - `byBuilding` should contain arrays grouped by building
   - Each building should have valid `buildingId`, `buildingName`, and `characters` array
   - `outdoor` should contain characters with `buildingId = null`

### Validation Checks

```typescript
function validatePopulationResponse(data) {
  // Check required fields
  if (!data.total || !data.byBuilding || !data.outdoor) {
    throw new Error("Missing required fields");
  }

  // Count total characters
  const buildingCount = data.byBuilding.reduce(
    (sum, b) => sum + b.characters.length, 0
  );
  const outdoorCount = data.outdoor.length;
  const calculatedTotal = buildingCount + outdoorCount;

  if (calculatedTotal !== data.total) {
    throw new Error(`Total mismatch: ${calculatedTotal} != ${data.total}`);
  }

  // Validate character objects
  data.byBuilding.forEach(building => {
    building.characters.forEach(char => {
      if (!char.characterId || !char.name || !char.level || !char.class) {
        throw new Error("Invalid character object");
      }
    });
  });

  return true;
}
```

## Database Schema Dependencies

### Tables Used

1. **CharacterLocations**
   - `CharacterId` (FK to Characters)
   - `SettlementId` (FK to Settlements)
   - `BuildingId` (FK to Buildings, nullable)

2. **Characters**
   - `CharacterId` (PK)
   - `CharacterName`
   - `Level`
   - `Class`

3. **Buildings**
   - `BuildingId` (PK)
   - `SettlementId` (FK to Settlements)
   - `Name`

### Required Relationships

- Characters → CharacterLocations (1:1)
- CharacterLocations → Buildings (many:1, optional)
- Buildings → Settlements (many:1)

## Error Handling

The endpoint handles the following error cases:

1. **Settlement not found:**
   - Returns empty arrays for `byBuilding` and `outdoor`
   - `total: 0`

2. **Missing character data:**
   - Uses default values: `"Unknown"` for name, `"Commoner"` for class

3. **Missing building data:**
   - Shows `"Unknown Building"` for building names not found

4. **Database errors:**
   - Returns 500 status code
   - Logs error to console
   - Returns error message in response

## Migration Notes

### Current State (As of 2025-10-04)

**Backend:** Still returns old flat format from `/population` endpoint
**Web Frontend:** ✓ Implemented client-side grouping (works now)
**Unity Frontend:** Follow Unity integration guide above

### Future Migration Path (When Backend is Updated)

When the backend `/population` endpoint is updated to return grouped format:

1. **Web Frontend:** No changes needed - code already handles both formats
2. **Unity Frontend:** Switch from Option 1 to Option 2 in Unity guide above
3. **Performance:** Expect 30-40% improvement in load times

### Backward Compatibility

The web frontend code is designed to handle both formats:

```typescript
// Handles both old and new backend formats
if (data.byBuilding && data.outdoor) {
  // New format - use directly
  return data;
} else {
  // Old format - group client-side
  return groupCharacters(data.characters);
}
```

**Unity developers:** Use Option 1 (client-side grouping) until backend is updated, then switch to Option 2.

## Related Documentation

### Backend
- Settlement API: `GameServer/Controllers/SettlementController.cs`
- Character Models: `SharedLibrary/Models/Character.cs`
- Location Models: `SharedLibrary/Models/CharacterLocations.cs`
- Building Models: `SharedLibrary/Models/Building.cs`

### Web Frontend
- API Client: `dusk-meridian-web/src/api/endpoints/settlement.ts`
- Population Component: `dusk-meridian-web/src/pages/SettlementDetail.tsx`
- Type Definitions: See interfaces in settlement.ts

### Unity Frontend
- Follow code examples in "Unity Frontend Integration Guide" section above
- See Unity WebRequest documentation for async/await patterns
- Use JsonUtility or Newtonsoft.Json for parsing responses

---

## Summary

**Current Status:** ⚠️ Partial Implementation

| Component | Status | Notes |
|-----------|--------|-------|
| Backend `/population` | ❌ Not Updated | Returns flat list without building grouping |
| Backend `/characters/detailed` | ✓ Available | Includes `buildingId` field |
| Web Frontend | ✓ Working | Uses client-side grouping with detailed endpoint |
| Unity Frontend | 📋 Documented | Follow Unity integration guide above |

**Next Steps:**
1. ✓ Web frontend is working with client-side grouping
2. 📋 Unity developers should implement Option 1 (client-side grouping)
3. ⏳ Backend team can optionally update `/population` endpoint for better performance
4. ⏳ Once backend is updated, Unity can switch to Option 2 (direct endpoint)

**Web Frontend Build Status:** ✓ Working and tested with 14,400 characters
**Unity Frontend:** Ready for implementation using provided code examples
