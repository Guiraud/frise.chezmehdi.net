# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 timeline application that creates interactive chronological visualizations from online spreadsheets (Google Sheets, Framacalc) or CSV files. Built with Vite and using vis-timeline for timeline rendering.

## Development Commands

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

### Core Components
- **App.vue** - Main application component with state management for timeline data, URL handling, and notifications
- **Timeline.vue** - vis-timeline wrapper with event handling, selection, and responsive design
- **SpreadsheetInput.vue** - Input component for spreadsheet URLs/CSV files

### Data Flow
1. User enters URL or CSV filename in SpreadsheetInput
2. App.vue calls `fetchSheetData()` from sheetService
3. Service detects source type (Google Sheets/Framacalc/CSV) and parses data
4. Parsed data flows to Timeline.vue for visualization
5. URL state synchronized with browser history

### Key Services
- **sheetService.js** - Handles data fetching from multiple sources:
  - Google Sheets API (requires public sheets)
  - Framacalc CSV export
  - Local CSV files from public directory
  - Data parsing and timeline formatting

### Data Format
Timeline items expect this structure:
```javascript
{
  id: string,
  titre: string,        // Title
  start: ISO_date,      // Start date
  end: ISO_date,        // End date (optional)
  type: string,         // Event type for styling
  description: string,   // HTML description
  className: string     // CSS class for styling
}
```

### CSS Classes for Event Types
- `event-context` - Contextual events (blue)
- `event-trigger` - Trigger events (red) 
- `period-context` - Contextual periods (green)
- `period-activity` - Activity periods (purple)

## Configuration

### Vite Config Notable Features
- File serving from parent directory allowed
- CORS enabled for development
- Custom middleware for CSV file handling
- Asset optimization for production builds

### CSV File Loading
CSV files must be placed in the `public` directory and accessed by filename only (e.g., "data.csv"). The service automatically constructs the correct path.

## URL Parameters
- `url` - Spreadsheet URL or CSV filename
- `start`/`end` - Date range parameters
- Hash anchors for specific events: `#event-{id}`

## Common Tasks

### Adding New Data Sources
1. Add extraction function in sheetService.js (follow `extractGoogleSheetId` pattern)
2. Add fetch function for the new source
3. Update `fetchSheetData` to detect and route new source type

### Modifying Timeline Appearance
- Event styling: Update CSS classes in Timeline.vue (`:deep()` selectors)
- Timeline options: Modify default options in Timeline.vue props
- Colors/themes: Update CSS custom properties in App.vue

### Error Handling
The app uses a centralized notification system. Errors bubble up from services to App.vue which displays user-friendly messages.