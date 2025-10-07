# Cache Context Implementation Explanation

## Overview
The Cache Context is a React context that provides in-memory caching functionality with localStorage persistence and automatic expiration. It's designed to improve application performance by reducing API calls and providing offline capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cache Context                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Cache State   │  │  localStorage   │  │  Cleanup     │ │
│  │                 │  │                 │  │  Timer       │ │
│  │ • Data          │  │ • Persistence   │  │              │ │
│  │ • Timestamp     │  │ • Recovery      │  │ • Every 1min │ │
│  │ • ExpiresIn     │  │ • Offline       │  │ • Auto-clean │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cache Methods                            │
├─────────────────────────────────────────────────────────────┤
│  • get(key)     - Retrieve cached data                     │
│  • set(key, data, expiresIn) - Store data with TTL         │
│  • clear(key)   - Remove specific or all cached data       │
│  • has(key)     - Check if key exists and is valid         │
│  • isExpired(key) - Check if cached data has expired       │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Data Structure**
```typescript
interface CacheData {
  [key: string]: {
    data: any;           // The actual cached data
    timestamp: number;   // When the data was cached
    expiresIn: number;   // TTL in milliseconds
  };
}
```

### 2. **Persistence**
- **localStorage Integration**: Cache data is automatically saved to localStorage
- **Recovery**: On app restart, cache is restored from localStorage
- **Error Handling**: Graceful fallback if localStorage is unavailable

### 3. **Automatic Expiration**
- **Default TTL**: 5 minutes (300,000ms)
- **Custom TTL**: Can be specified per cache entry
- **Auto-cleanup**: Expired entries are removed every minute
- **Lazy Expiration**: Expired entries are also removed when accessed

### 4. **Smart Caching Strategy**
- **Cache-First**: Always check cache before making API calls
- **Background Updates**: Load cached data immediately, update in background
- **Fallback**: Graceful degradation when cache is unavailable

## Usage Examples

### 1. **Basic Usage**
```typescript
const cache = useCache();

// Store data with default 5-minute expiration
cache.set('user-data', userData);

// Store data with custom 10-minute expiration
cache.set('branches', branchesData, 10 * 60 * 1000);

// Retrieve data
const userData = cache.get('user-data');

// Check if data exists and is valid
if (cache.has('branches')) {
  const branches = cache.get('branches');
}
```

### 2. **Real Implementation (CompanyOwnerDashboard)**
```typescript
// Fetch with caching
const fetchBranches = async (useCache: boolean = true) => {
  const cacheKey = 'dashboard-branches';
  
  // Check cache first
  if (useCache && cache.has(cacheKey)) {
    setBranches(cache.get(cacheKey));
    return;
  }

  try {
    // Fetch from API
    const response = await branchesApi.getAll({...});
    setBranches(response.data);
    
    // Cache for 10 minutes
    cache.set(cacheKey, response.data, 10 * 60 * 1000);
  } catch (err) {
    // Handle error
  }
};
```

### 3. **Smart Loading Strategy**
```typescript
const fetchData = async (showLoading: boolean = false) => {
  // Load cached data first (fast)
  await Promise.all([
    fetchBranches(true),    // useCache = true
    fetchMachines(true),
    fetchMaterials(true)
  ]);
  
  // Update in background (slow)
  setTimeout(async () => {
    await Promise.all([
      fetchBranches(false),   // useCache = false
      fetchMachines(false),
      fetchMaterials(false)
    ]);
  }, 100);
};
```

## Cache Keys Used in Application

### Dashboard Cache Keys
- `dashboard-branches` - Branch data (10 min TTL)
- `dashboard-machines` - Machine data (10 min TTL)
- `dashboard-materials` - Material data (10 min TTL)
- `dashboard-pending-approvals` - Pending approvals count (2 min TTL)
- `dashboard-expenses-{period}` - Expenses data by time period (5 min TTL)

## Benefits

### 1. **Performance**
- **Faster Loading**: Cached data loads instantly
- **Reduced API Calls**: Less network traffic
- **Better UX**: No loading spinners for cached data

### 2. **Offline Support**
- **Persistent Storage**: Data survives page refreshes
- **Graceful Degradation**: App works with cached data when offline

### 3. **Smart Updates**
- **Background Refresh**: Data updates without user interruption
- **Stale-While-Revalidate**: Show cached data while fetching fresh data

## Cache Lifecycle

```
1. App Start
   ├── Load cache from localStorage
   ├── Initialize cache state
   └── Start cleanup timer

2. Data Request
   ├── Check cache first
   ├── Return cached data if valid
   ├── Fetch from API if cache miss/expired
   └── Update cache with new data

3. Background Cleanup
   ├── Run every minute
   ├── Remove expired entries
   └── Update localStorage

4. App Shutdown
   └── Cache persists in localStorage
```

## Configuration

### Default Settings
- **Default TTL**: 5 minutes
- **Cleanup Interval**: 1 minute
- **Storage Key**: `app-cache`
- **Error Handling**: Graceful fallback

### Customization
```typescript
// Custom TTL for different data types
cache.set('user-profile', userData, 30 * 60 * 1000);  // 30 minutes
cache.set('real-time-data', data, 30 * 1000);         // 30 seconds
cache.set('static-data', data, 24 * 60 * 60 * 1000);  // 24 hours
```

## Error Handling

The cache context includes robust error handling:
- **localStorage Errors**: Graceful fallback to in-memory only
- **JSON Parse Errors**: Reset cache on corruption
- **Network Errors**: Fallback to cached data
- **Expired Data**: Automatic cleanup and refresh

## Best Practices

1. **Use Descriptive Keys**: `dashboard-branches` instead of `branches`
2. **Set Appropriate TTL**: Short for dynamic data, long for static data
3. **Cache-First Strategy**: Always check cache before API calls
4. **Background Updates**: Update cache without blocking UI
5. **Error Boundaries**: Handle cache failures gracefully

This cache implementation provides a robust, performant caching solution that significantly improves the user experience while maintaining data freshness and reliability.
