# Codex Offline Caching System

## Overview

The Dusk Meridian Codex now includes a comprehensive offline caching system using **IndexedDB** (via Dexie.js). This allows the Codex to function even when the server is offline, providing a seamless experience for users.

## Architecture

```
┌─────────────────────────────────────────┐
│         Codex Component                 │
│       (src/pages/Codex.tsx)             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Cached API Layer                     │
│  (src/api/endpoints/codex-cached.ts)    │
│                                         │
│  1. Check IndexedDB cache               │
│  2. If missing/expired → API call       │
│  3. If API fails → return stale cache   │
│  4. Store response in cache             │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼────┐      ┌───────▼─────┐
│IndexedDB│      │  Postgres   │
│  Cache  │      │  via API    │
│(Browser)│      │  (Server)   │
└─────────┘      └─────────────┘
```

## Files Created

### Core Database
- **`src/db/codexDb.ts`** - Dexie database schema and utilities
  - Defines all tables and indexes
  - Cache management methods
  - Statistics tracking

### Services
- **`src/services/codexCacheService.ts`** - Cache service layer
  - Wraps API calls with caching logic
  - Automatic fallback to stale data on API failure
  - Configurable cache durations by data type

### API Layer
- **`src/api/endpoints/codex-cached.ts`** - Cached API endpoints
  - Drop-in replacement for direct API calls
  - Transparent caching for all Codex operations
  - Lore management for custom entries

### UI Components
- **`src/components/codex/CacheManagementPanel.tsx`** - Admin panel for cache
  - View cache statistics
  - Clear cache (all or expired only)
  - Monitor cache health

- **`src/components/codex/DataImportPanel.tsx`** - Data import UI
  - Import lore from JSON files
  - Import lore from Markdown files
  - Populate sample data for testing

### Utilities
- **`src/utils/codexDataImporter.ts`** - Data import utilities
  - JSON parsing and validation
  - Markdown file reading
  - Sample lore data

## Cache Durations

Different data types have different cache durations based on how frequently they change:

| Data Type | Duration | Reason |
|-----------|----------|--------|
| Character Classes | 24 hours | Static game mechanics |
| Skills | 24 hours | Rarely updated |
| Spells | 24 hours | Stable spell list |
| Technologies | 24 hours | Fixed tech tree |
| Continents | 12 hours | Geography doesn't change often |
| Regions | 12 hours | Regional data is semi-static |
| Settlements | 12 hours | Population changes moderately |
| Factions | 12 hours | Faction data updates periodically |
| World Statistics | 5 minutes | Real-time server stats |
| Lore Entries | 24 hours | Custom content, rarely changes |

## Database Schema

### Tables

#### `characterClasses`
- Character class definitions
- Includes stats, abilities, and player counts

#### `skills`
- All available skills
- Categories, prerequisites, max levels

#### `spells`
- Spell definitions
- Schools, levels, components, effects

#### `settlements`
- City and town data
- Population, faction ownership, geography

#### `factions`
- Faction information
- Leadership, ideology, territories

#### `continents` / `regions`
- Geographic hierarchy
- Climate, resources, descriptions

#### `loreEntries`
- Custom lore content
- Markdown support
- Searchable by category and tags

#### `worldStatistics`
- Live server statistics
- Singleton table (always ID 1)

#### `cacheMetadata`
- Tracks cache freshness
- Expiry times per cache key

## Usage

### Basic Usage (Automatic Caching)

The Codex page automatically uses cached data. Simply import and use the cached API:

```typescript
import { codexCachedApi } from '@/api/endpoints/codex-cached';

// Automatically checks cache first, falls back to API
const classes = await codexCachedApi.getCharacterClasses();
const settlements = await codexCachedApi.getSettlements();
```

### Adding Custom Lore

#### Via UI (Import Tab)
1. Navigate to Codex → Import tab
2. Choose JSON or Markdown file
3. Upload your content

#### Programmatically

```typescript
import { codexCachedApi } from '@/api/endpoints/codex-cached';

// Single entry
await codexCachedApi.storeLoreEntry({
  id: 'my-lore-entry',
  title: 'The Great War',
  category: 'History',
  subcategory: 'Conflicts',
  content: '# Full markdown content here...',
  summary: 'Brief description',
  tags: 'war, history, ancient'
});

// Bulk import
await codexCachedApi.bulkImportLore([
  { id: '1', title: 'Entry 1', ... },
  { id: '2', title: 'Entry 2', ... }
]);
```

### JSON Import Format

```json
[
  {
    "id": "unique-entry-id",
    "title": "Entry Title",
    "category": "World",
    "subcategory": "Geography",
    "content": "Full markdown content here...",
    "summary": "Brief summary for search results",
    "tags": ["tag1", "tag2", "tag3"]
  }
]
```

### Searching Lore

```typescript
// Search all lore
const results = await codexCachedApi.searchLore('dragon');

// Search within category
const worldLore = await codexCachedApi.searchLore('magic', 'World');

// Get all lore in a category
const allHistory = await codexCachedApi.getLoreByCategory('History');
```

## Cache Management

### Via UI (Cache Tab)
1. Navigate to Codex → Cache tab
2. View statistics
3. Clear expired or all cache

### Programmatically

```typescript
import { codexCachedApi } from '@/api/endpoints/codex-cached';

// Get cache statistics
const stats = await codexCachedApi.getCacheStats();

// Clear all cache
await codexCachedApi.clearCache();

// Clear expired entries only
await codexCachedApi.clearExpiredCache();

// Force refresh a specific cache key
await codexCachedApi.forceRefresh('character-classes');
```

## Syncing with Postgres

When your Postgres database is online, the system will automatically sync:

1. **On first load**: Data is fetched from API and cached
2. **On subsequent loads**: Cache is used if fresh
3. **When expired**: New data fetched from API
4. **If API fails**: Stale cache is used as fallback

### Manual Sync

To pre-populate cache from your Postgres database, simply navigate through the Codex categories while the server is online. The first access will cache all data.

## Populating Data

### From Postgres via API

When your game server is running, data flows automatically:

```typescript
// These calls will fetch from API and populate cache
await codexCachedApi.getCharacterClasses();
await codexCachedApi.getSettlements();
await codexCachedApi.getFactions();
// etc...
```

### Custom Lore Documents

#### Option 1: Use Import UI
1. Prepare JSON or Markdown files
2. Use the Import tab in Codex
3. Upload files

#### Option 2: Use Sample Data
```typescript
import { populateSampleLore } from '@/utils/codexDataImporter';

// Adds 3 sample lore entries for testing
await populateSampleLore();
```

#### Option 3: Script Import
Create a script to import your documents:

```typescript
import { importLoreFromJSON } from '@/utils/codexDataImporter';

const myLoreData = [
  // Your lore entries here
];

await importLoreFromJSON(myLoreData);
```

## Offline Functionality

The Codex will work offline with these features:

✅ View cached character classes, skills, spells
✅ Browse settlements, factions, regions
✅ Search through cached lore entries
✅ View world statistics (stale data)
✅ Add/edit local lore entries

❌ Real-time statistics (will show last cached values)
❌ Create new API-backed data (requires server)

## Browser Compatibility

IndexedDB is supported in all modern browsers:
- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## Storage Limits

IndexedDB storage limits vary by browser:
- Chrome/Edge: ~60% of available disk space
- Firefox: ~50% of available disk space
- Safari: ~1GB

The Codex cache typically uses:
- ~5-10 MB for full game data
- ~100-500 KB per lore entry

## Debugging

### View Cache in Browser DevTools

**Chrome/Edge:**
1. F12 → Application tab
2. IndexedDB → DuskMeridianCodex
3. Explore tables

**Firefox:**
1. F12 → Storage tab
2. IndexedDB → DuskMeridianCodex
3. Explore tables

### Console Logging

Cache operations log to console:
```
[Cache HIT] character-classes
[Cache MISS] settlements - fetching from API
[Cache STALE] world-statistics - using stale data due to API error
```

## Future Enhancements

Potential improvements:
- [ ] Background sync when online
- [ ] Differential updates (only sync changed data)
- [ ] Export cache to file for backup
- [ ] Import cache from backup file
- [ ] Conflict resolution for concurrent edits
- [ ] Version tracking for cache invalidation
- [ ] Compression for large lore entries

## Support

For issues or questions about the caching system:
1. Check browser console for error messages
2. Verify IndexedDB is enabled in browser
3. Check cache statistics in Cache Management panel
4. Try clearing cache and re-syncing
