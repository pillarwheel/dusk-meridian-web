# Codex API Specification for GameServer

This document outlines the API endpoints that the GameServer needs to implement to support the web client's Codex feature. The web client will cache data based on update frequency to optimize performance.

## Cache Strategy

The web client implements intelligent caching based on data volatility:

### Static Data (24 hour cache)
- **Mechanics**: Skills, Spells, Technologies, ActionCategories, SurvivalMechanics, Professions
- **Buildings**: Building types and definitions
- **Resources**: Resource definitions and properties

### Semi-Static Data (12 hour cache)
- **Geography**: Continents, Regions, SubRegions, Settlements
- **World Data**: Factions, Guilds

### Dynamic Data (5-10 minute cache)
- **World Statistics**: Total counts, server status, world time
- **Population Statistics**: Character demographics, online counts

### Real-Time Data (30 seconds - 1 minute cache)
- **Character Locations**: Character movement and positions
- **Online Status**: Player online/offline tracking

## Required API Endpoints

All endpoints should return data in this format:
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success",
  "timestamp": "2025-01-20T12:00:00Z"
}
```

### 1. World Statistics (GET /api/v1/codex/statistics)

**Cache Duration**: 5 minutes

**Query**:
```sql
-- This endpoint should query multiple tables to provide:
SELECT
  COUNT(*) as totalCharacters FROM Characters;
SELECT
  COUNT(DISTINCT class) as totalClasses FROM Characters;
SELECT
  COUNT(*) as totalSettlements FROM Settlements;
SELECT
  COUNT(*) as totalFactions FROM Factions;
-- Online players based on last_login within reasonable timeframe
SELECT
  COUNT(*) as onlinePlayers
FROM Characters
WHERE last_login > datetime('now', '-15 minutes');
```

**Response**:
```typescript
interface WorldStatistics {
  totalCharacters: number;
  totalClasses: number;
  onlinePlayers: number;
  totalSettlements: number;
  activeBattles: number;
  totalFactions: number;
  totalGuilds: number;
  worldTime: {
    currentDay: number;
    timeOfDay: number;
    season: string;
    year: number;
    serverTime: Date;
  };
  serverUptime: string;
  lastUpdated: Date;
}
```

### 2. Population Statistics (GET /api/v1/codex/population)

**Cache Duration**: 10 minutes

**Query**:
```sql
-- Character demographics
SELECT
  COUNT(*) as totalCharacters,
  COUNT(CASE WHEN is_npc = 0 THEN 1 END) as totalPlayers,
  COUNT(CASE WHEN is_npc = 1 THEN 1 END) as totalNPCs,
  COUNT(CASE WHEN last_login > datetime('now', '-15 minutes') THEN 1 END) as onlineCharacters,
  COUNT(CASE WHEN last_login <= datetime('now', '-15 minutes') THEN 1 END) as offlineCharacters,
  AVG(level) as averageLevel
FROM Characters;

-- Characters by class
SELECT class, COUNT(*) as count
FROM Characters
GROUP BY class;

-- Characters by faction
SELECT faction_id, COUNT(*) as count
FROM Characters
WHERE faction_id IS NOT NULL
GROUP BY faction_id;
```

### 3. Character Classes (GET /api/v1/codex/mechanics/classes)

**Cache Duration**: 24 hours

**Query**:
```sql
-- Get all distinct character classes with counts
SELECT
  class as name,
  COUNT(*) as count
FROM Characters
GROUP BY class
ORDER BY class;
```

**Response**:
```typescript
interface CharacterClass {
  name: string;
  description?: string;
  primaryStats?: string[];
  abilities?: string[];
  count?: number;
}[]
```

### 4. Skills (GET /api/v1/codex/mechanics/skills)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM Skills ORDER BY name;`

### 5. Spells (GET /api/v1/codex/mechanics/spells)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM Spells ORDER BY name;`

### 6. Technologies (GET /api/v1/codex/mechanics/technologies)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM Technologies ORDER BY name;`

### 7. Action Categories (GET /api/v1/codex/mechanics/action-categories)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM ActionCategories ORDER BY priority;`

### 8. Survival Mechanics (GET /api/v1/codex/mechanics/survival)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM SurvivalMechanic ORDER BY name;`

### 9. Professions (GET /api/v1/codex/mechanics/professions)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM Professions ORDER BY name;`

### 10. Continents (GET /api/v1/codex/geography/continents)

**Cache Duration**: 12 hours

**Query**: `SELECT * FROM Continents ORDER BY name;`

### 11. Regions (GET /api/v1/codex/geography/regions)

**Cache Duration**: 12 hours

**Query**:
```sql
SELECT r.*, c.name as continentName
FROM Regions r
LEFT JOIN Continents c ON r.continent_id = c.id
ORDER BY r.name;
```

**Optional Parameters**: `?continentId=1`

### 12. SubRegions (GET /api/v1/codex/geography/subregions)

**Cache Duration**: 12 hours

**Query**:
```sql
SELECT sr.*, r.name as regionName
FROM SubRegions sr
LEFT JOIN Regions r ON sr.region_id = r.id
ORDER BY sr.name;
```

**Optional Parameters**: `?regionId=1`

### 13. Settlements (GET /api/v1/codex/geography/settlements)

**Cache Duration**: 12 hours

**Query**:
```sql
SELECT
  s.*,
  f.name as factionName,
  f.color as factionColor,
  r.name as regionName,
  -- Calculate population from SurroundingPopulation table
  COALESCE(sp.population, 0) as population
FROM Settlements s
LEFT JOIN Factions f ON s.faction_id = f.id
LEFT JOIN Regions r ON s.region_id = r.id
LEFT JOIN SurroundingPopulation sp ON s.id = sp.settlement_id
ORDER BY s.name;
```

**Optional Parameters**: `?regionId=1&factionId=5`

### 14. Buildings (GET /api/v1/codex/geography/buildings)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM Buildings ORDER BY type, name;`

### 15. Character Locations (GET /api/v1/codex/population/locations)

**Cache Duration**: 30 seconds

**Query**:
```sql
SELECT
  cl.*,
  c.character_name,
  s.name as settlementName,
  r.name as regionName,
  c.last_login,
  CASE WHEN c.last_login > datetime('now', '-15 minutes') THEN 1 ELSE 0 END as isOnline
FROM CharacterLocations cl
JOIN Characters c ON cl.character_id = c.character_id
LEFT JOIN Settlements s ON cl.settlement_id = s.id
LEFT JOIN Regions r ON s.region_id = r.id
ORDER BY cl.last_updated DESC;
```

**Optional Parameters**: `?settlementId=settlement-123`

### 16. Factions (GET /api/v1/codex/world/factions)

**Cache Duration**: 12 hours

**Query**:
```sql
SELECT
  f.*,
  COUNT(DISTINCT c.character_id) as memberCount,
  COUNT(DISTINCT s.id) as settlementCount
FROM Factions f
LEFT JOIN Characters c ON f.id = c.faction_id
LEFT JOIN Settlements s ON f.id = s.faction_id
GROUP BY f.id
ORDER BY f.name;
```

### 17. Guilds (GET /api/v1/codex/world/guilds)

**Cache Duration**: 12 hours

**Query**:
```sql
SELECT
  g.*,
  f.name as factionName,
  COUNT(c.character_id) as memberCount
FROM Guilds g
LEFT JOIN Factions f ON g.faction_id = f.id
LEFT JOIN Characters c ON g.id = c.guild_id
GROUP BY g.id
ORDER BY g.name;
```

**Optional Parameters**: `?factionId=5`

### 18. Resources (GET /api/v1/codex/world/resources)

**Cache Duration**: 24 hours

**Query**: `SELECT * FROM Resources ORDER BY type, name;`

### 19. Search Codex (POST /api/v1/codex/search)

**No Caching** (search results vary)

**Request Body**:
```typescript
interface CodexSearchRequest {
  query?: string;
  category?: CodexCategory;
  subcategory?: string;
  limit?: number;
  offset?: number;
}
```

This should search across all relevant tables and return matching entries.

## Implementation Notes

1. **Error Handling**: All endpoints should return proper HTTP status codes and error messages
2. **Performance**: Consider implementing database indexes on frequently queried columns
3. **Pagination**: Large datasets should support pagination via `limit` and `offset`
4. **Caching**: Server-side caching can further optimize performance
5. **Rate Limiting**: Consider implementing rate limiting to prevent abuse

## Database Optimization Suggestions

```sql
-- Indexes for performance
CREATE INDEX idx_characters_class ON Characters(class);
CREATE INDEX idx_characters_faction ON Characters(faction_id);
CREATE INDEX idx_characters_last_login ON Characters(last_login);
CREATE INDEX idx_character_locations_settlement ON CharacterLocations(settlement_id);
CREATE INDEX idx_settlements_faction ON Settlements(faction_id);
CREATE INDEX idx_settlements_region ON Settlements(region_id);
```

This specification ensures the web client can efficiently display real-time world information while minimizing database load through intelligent caching strategies.