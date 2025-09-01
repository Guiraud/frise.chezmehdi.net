# ADR-002: Service Layer Modularity

## Status
✅ **ACCEPTED** - Implemented on 2025-09-01

## Context
The original `sheetService.js` was a monolithic 369-line file containing URL extraction, HTTP fetching, CSV parsing, date formatting, and error handling. This violated the Single Responsibility Principle and made the service difficult to extend with new data sources.

## Decision
We will split the service layer into focused, single-purpose modules organized by function:

```
src/services/
├── sheetService.js        # Main orchestrator
├── dataFetchers/          # HTTP and file operations
│   ├── googleSheets.js    # Google Sheets API integration
│   ├── framacalc.js       # Framacalc API integration
│   └── localCSV.js        # Local file loading
└── parsers/               # Data transformation
    ├── csvParser.js       # Raw CSV parsing
    └── timelineParser.js  # Timeline-specific formatting
```

## Rationale

### Benefits
- **Single Responsibility**: Each module handles one data source or parsing concern
- **Extensibility**: Easy to add new data sources (Excel Online, Airtable, etc.)
- **Testability**: Individual modules can be unit tested in isolation
- **Maintainability**: Smaller files with focused logic
- **Reusability**: Parsers can be used independently of fetchers

### Trade-offs
- **Complexity**: More files to navigate and understand
- **Coordination**: Main service must orchestrate multiple modules
- **Import chains**: Deeper import hierarchies

## Implementation Details

### Module Responsibilities

#### Data Fetchers (`/dataFetchers`)
- **Single Concern**: HTTP requests and file I/O operations
- **No Parsing**: Return raw data (CSV strings, JSON arrays)
- **Error Handling**: Source-specific error messages and recovery
- **URL Extraction**: Source-specific ID/URL parsing logic

#### Parsers (`/parsers`)  
- **Single Concern**: Data transformation and formatting
- **No I/O**: Pure functions that transform data structures
- **Validation**: Column requirement checks and data validation
- **Formatting**: Date parsing, CSS class assignment, ID generation

#### Main Orchestrator (`sheetService.js`)
- **Coordination**: Routes requests to appropriate fetcher/parser
- **Integration**: Combines fetcher output with parser logic
- **Public API**: Maintains backward compatibility for existing components

### Before (Monolithic - 369 lines)
```javascript
// All concerns mixed together
const extractGoogleSheetId = (url) => { /* extraction */ };
const fetchGoogleSheetData = async (sheetId) => { /* HTTP + parsing */ };
const parseSheetData = (rows) => { /* parsing + timeline formatting */ };
const parseCSVData = (csvData) => { /* CSV parsing + formatting */ };
```

### After (Modular)
```javascript
// Clear separation of concerns
import { extractGoogleSheetId, fetchGoogleSheetData } from './dataFetchers/googleSheets.js';
import { parseCSVData } from './parsers/csvParser.js';
import { parseSheetData } from './parsers/timelineParser.js';
```

## Consequences

### Positive
- **Easier Testing**: Mock individual fetchers/parsers independently
- **Better Error Messages**: Source-specific error handling and recovery
- **Simpler Extension**: Adding new data sources requires only new fetcher module
- **Code Reuse**: CSV parser can be used for any CSV source
- **Clearer Debugging**: Stack traces point to specific modules

### Negative
- **File Proliferation**: 6 files instead of 1
- **Import Complexity**: More import statements to manage
- **Learning Curve**: Developers must understand module boundaries

## Extension Examples

### Adding New Data Source
```javascript
// src/services/dataFetchers/airtable.js
export const extractAirtableId = (url) => { /* ... */ };
export const fetchAirtableData = async (baseId) => { /* ... */ };

// Update main service
import { extractAirtableId, fetchAirtableData } from './dataFetchers/airtable.js';
```

### Adding New Parser
```javascript
// src/services/parsers/ganttParser.js  
export const parseGanttData = (data) => { /* Gantt-specific formatting */ };
```

## Compliance
- ✅ **Single Responsibility**: Each module has one reason to change
- ✅ **Open/Closed**: Easy to extend with new modules without modifying existing
- ✅ **Interface Segregation**: Modules only depend on functions they use
- ✅ **Dependency Inversion**: Main service depends on fetcher/parser abstractions

## Performance Considerations
- **Bundle Size**: Tree-shaking eliminates unused fetchers in final build
- **Lazy Loading**: Fetchers can be dynamically imported based on URL type
- **Caching**: Individual modules can implement source-specific caching strategies

## Follow-up Actions
- [ ] Add TypeScript interfaces for fetcher/parser contracts
- [ ] Implement lazy loading for data fetchers
- [ ] Add performance monitoring for each module
- [ ] Create integration tests for fetcher/parser combinations

---
*This ADR documents the architectural decision to split the monolithic service layer into focused, single-responsibility modules for better maintainability and extensibility.*