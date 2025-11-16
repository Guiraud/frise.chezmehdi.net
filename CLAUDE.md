# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 timeline application (Frise Chronologique) that generates interactive timelines from spreadsheet data. The app supports Google Sheets, Framacalc, and local CSV files, displaying timeline data using the vis-timeline library.

## Development Commands

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production 
- `npm run preview` - Preview production build
- `npm install` - Install dependencies
- `npm run lint` - Run linting (placeholder - needs ESLint setup)
- `npm run lint:fix` - Fix linting issues (placeholder)
- `npm run test` - Run tests (placeholder - needs test framework setup)
- `npm run test:unit` - Run unit tests (placeholder)
- `npm run type-check` - Type checking (placeholder - needs TypeScript setup)

## Architecture

### Core Application Structure

- **Single Page Application**: Uses Vue Router but primarily operates as a single-page app with the main interface in `src/App.vue`
- **Component-based**: Main components are `SpreadsheetInput` (URL input), `Timeline` (vis-timeline wrapper), and `HelloWorld` (unused)
- **Service layer**: `src/services/sheetService.js` handles data fetching and parsing from multiple sources

### Key Technologies

- **Vue 3** with Composition API
- **vis-timeline** for timeline visualization (primary)
- **vis-data** for data handling
- **Vite** as build tool and dev server
- **Alternative visualization libraries**: ApexCharts, Chart.js, D3.js, Apache ECharts (examples available)

### Data Flow

1. User inputs spreadsheet URL or CSV filename via `SpreadsheetInput`
2. `sheetService.js` determines data source type and fetches data
3. Data is parsed into vis-timeline format with proper dates and styling
4. `Timeline` component renders the interactive timeline
5. URL parameters maintain state for sharing

### Data Sources Supported

- **Google Sheets**: Extracts sheet ID from URL, uses Google Sheets API
- **Framacalc**: Extracts sheet ID, fetches CSV data from Framacalc API  
- **Local CSV files**: Loads from `/public` directory

### Required CSV/Sheet Columns

- `type` - Event type (événement_contextuel, événement_déclencheur, période_contextuelle, période_activité)
- `date_début` - Start date
- `titre` - Event title
- `date_fin` - End date (optional)
- `description` - Event description (optional)

### Styling System

- CSS custom properties defined in `:root` for consistent theming
- Event types have predefined colors (event-context, event-trigger, period-context, period-activity)
- Responsive design with mobile-first approach
- Uses vis-timeline's deep styling with `:deep()` selectors

### URL State Management

- Spreadsheet URL stored in `?url=` parameter
- Selected items update URL hash (`#event-{id}`)
- Date ranges update URL search params
- Enables sharing of specific timeline states

### Examples Directory

Contains working examples using different visualization libraries:
- `Examples/apexcharts/` - ApexCharts implementation
- `Examples/chartjs/` - Chart.js implementation
- `Examples/d3js/` - D3.js implementation
- `Examples/echarts/` - Apache ECharts implementation
- `Examples/pyrennees/` - Sample timeline data (Bétharram case study)

## Development Notes

### File Serving Configuration

Vite is configured to allow serving files from parent directories and handle CSV file requests. The `configureServer` middleware handles root requests with query parameters. CORS is enabled in development mode to allow cross-origin requests.

### Error Handling

- Service layer includes comprehensive error handling with French error messages
- Network failures, parsing errors, and invalid formats are handled gracefully
- User notifications display success/error states

### State Management

Uses Vue 3 Composition API with reactive refs:
- `timelineData` - Main dataset
- `loading` - Loading state
- `error` - Error messages  
- `searchQuery` - Search functionality
- `notification` - Toast notifications

### Search and Filtering

Search filters across `titre`, `description`, and `type` fields. Results update reactively and show count.

## Deployment

### GitLab CI/CD Pipeline

The project uses a comprehensive GitLab CI pipeline with 4 stages:
1. **Install** - Dependencies with caching
2. **Quality** - Linting, type checking, and testing (placeholders for future setup)
3. **Build** - Production and preview builds
4. **Deploy** - Manual deployment to Cloudflare Pages

### Environment Configuration

- **Production**: `main` branch → https://frise.chezmehdi.net
- **Staging**: `develop` branch → https://develop.frise.chezmehdi.net  
- **Preview**: Merge requests (manual trigger)

### Required GitLab CI Variables

Set these in GitLab project settings (CI/CD → Variables):
- `CLOUDFLARE_API_TOKEN` - API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Pages project name

### Environment Files

- `.env` - Production defaults
- `.env.development` - Development overrides
- `.env.staging` - Staging configuration
- `wrangler.toml` - Cloudflare Pages configuration

See `DEPLOYMENT.md` for detailed setup instructions.

## Important Implementation Details

- The app expects French date formats and error messages
- vis-timeline requires specific data structure with `start`, `end`, `id` fields
- CSS classes are automatically assigned based on event `type`
- Timeline height adjusts automatically based on content
- All external URLs must be HTTPS for CORS compliance
