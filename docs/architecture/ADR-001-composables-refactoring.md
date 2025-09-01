# ADR-001: Composables Architecture Refactoring

## Status
✅ **ACCEPTED** - Implemented on 2025-09-01

## Context
The original `App.vue` component contained 764 lines of mixed concerns including state management, URL handling, data fetching, and UI logic. This monolithic approach violated the Single Responsibility Principle and made the codebase difficult to maintain and test.

## Decision
We will extract state management logic from `App.vue` into focused Vue 3 composables:

- **`useTimeline.js`** - Timeline data management and loading
- **`useUrlState.js`** - URL parameter and browser history management  
- **`useNotifications.js`** - Toast notification system

## Rationale

### Benefits
- **Separation of Concerns**: Each composable handles a specific domain
- **Reusability**: Composables can be used across multiple components
- **Testability**: Isolated functions are easier to unit test
- **Maintainability**: Smaller, focused modules reduce cognitive load
- **Vue 3 Best Practices**: Follows recommended Composition API patterns

### Trade-offs
- **Initial Complexity**: Requires understanding of composable pattern
- **File Count**: Increases number of files in the project
- **Import Overhead**: More import statements needed

## Implementation Details

### Before (App.vue - 764 lines)
```javascript
// All logic mixed in single setup() function
const timelineData = ref([]);
const loading = ref(false);
const error = ref(null);
const spreadsheetUrl = ref('');
const notification = ref({});
// ... 100+ lines of mixed logic
```

### After (Modular composables)
```javascript
// App.vue - ~90 lines
const timeline = useTimeline();
const urlState = useUrlState();  
const notifications = useNotifications();
```

### Composable Structure
```
src/composables/
├── useTimeline.js      # Data loading & filtering
├── useUrlState.js      # Browser history & URL params  
└── useNotifications.js # Toast messages & alerts
```

## Consequences

### Positive
- **Reduced App.vue size**: From 764 to ~90 lines  
- **Clear responsibilities**: Each composable owns specific state
- **Better testing**: Individual functions can be tested in isolation
- **Enhanced DX**: Easier to locate and modify specific functionality

### Negative
- **Learning curve**: Developers need to understand composable pattern
- **File navigation**: Need to open multiple files to understand full flow

## Compliance
- ✅ **Single Responsibility Principle**: Each composable has one reason to change
- ✅ **Open/Closed Principle**: Easy to extend with new composables
- ✅ **Dependency Inversion**: Components depend on composable abstractions

## Follow-up Actions
- [ ] Add unit tests for each composable
- [ ] Create documentation for composable usage patterns
- [ ] Consider extracting timeline rendering logic into separate composable

---
*This ADR documents the architectural decision to refactor Vue 3 application state management into focused composables for better maintainability and testability.*