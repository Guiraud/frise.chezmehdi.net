# TODOs - Frise Chronologique

## 🚀 Next Features (Priority Order)

### 1. Data Import Improvements
- [ ] **Excel/XLSX Support** - Add support for Excel files alongside CSV
- [ ] **API Key Support** - Allow private Google Sheets access with API keys
- [ ] **Data Validation** - Better validation with helpful error messages
- [ ] **CSV Delimiter Detection** - Auto-detect comma vs semicolon separators
- [ ] **Date Format Flexibility** - Support more date formats (DD/MM/YYYY, MM-DD-YYYY)

### 2. Export & Sharing Features
- [ ] **PDF Export** - Export timeline as PDF document
- [ ] **PNG/SVG Export** - High-quality image exports
- [ ] **Shareable Links** - Generate permanent links with embedded data
- [ ] **Embed Code** - Generate iframe embed code for websites
- [ ] **Print Optimization** - CSS print styles for better printing

### 3. Timeline Enhancements
- [ ] **Multiple Views** - Add list view, calendar view alongside timeline
- [ ] **Timeline Groups** - Group events by category/type
- [ ] **Custom Colors** - Allow custom color schemes per event type
- [ ] **Event Templates** - Predefined event templates for common use cases
- [ ] **Clustering** - Auto-cluster nearby events when zoomed out

### 4. User Experience
- [ ] **Dark Mode** - Add dark theme support
- [ ] **Keyboard Shortcuts** - Add keyboard navigation (arrows, zoom, etc.)
- [ ] **Undo/Redo** - Add undo/redo functionality for user actions
- [ ] **Loading States** - Better loading indicators and progress bars
- [ ] **Error Recovery** - Automatic retry for failed data loads

### 5. Performance & Scalability
- [ ] **Virtual Scrolling** - Handle large datasets (10k+ events) efficiently
- [ ] **Data Caching** - Cache loaded data in localStorage/sessionStorage
- [ ] **Lazy Loading** - Load event details on demand
- [ ] **Web Workers** - Move data processing to background threads
- [ ] **Progressive Loading** - Load and display data in chunks

### 6. Advanced Features
- [ ] **Real-time Updates** - Auto-refresh data from sources
- [ ] **Collaboration** - Multi-user editing capabilities
- [ ] **Comments System** - Allow comments on events
- [ ] **Version History** - Track changes to timelines
- [ ] **Analytics** - Usage analytics and insights

## 🔧 Technical Improvements

### Code Quality
- [ ] **TypeScript Migration** - Gradually migrate to TypeScript
- [ ] **Unit Tests** - Add comprehensive unit tests (Vitest)
- [ ] **E2E Tests** - Add end-to-end testing (Playwright/Cypress)
- [ ] **ESLint/Prettier** - Add code formatting and linting
- [ ] **Component Documentation** - Add JSDoc comments to components

### Architecture
- [ ] **State Management** - Add Pinia for complex state management
- [ ] **Plugin System** - Make timeline library pluggable
- [ ] **Service Workers** - Add offline support
- [ ] **PWA Features** - Make app installable
- [ ] **Micro-frontends** - Split into smaller, focused apps

### Developer Experience
- [ ] **Storybook** - Add component documentation/playground
- [ ] **Hot Module Replacement** - Improve dev server reload speed
- [ ] **Bundle Analysis** - Add bundle size analysis tools
- [ ] **Docker Setup** - Add Docker development environment
- [ ] **GitHub Actions** - Add CI/CD alternatives to GitLab

## 🐛 Known Issues & Fixes

### High Priority
- [ ] **Mobile Safari** - Fix timeline scrolling issues on iOS
- [ ] **Internet Explorer** - Remove IE support or add polyfills
- [ ] **Memory Leaks** - Fix timeline component memory leaks
- [ ] **CORS Issues** - Better error messages for CORS problems
- [ ] **CSV Parsing** - Handle malformed CSV files gracefully

### Medium Priority
- [ ] **URL Synchronization** - Fix browser history edge cases
- [ ] **Event Selection** - Improve event selection on mobile devices
- [ ] **Search Performance** - Optimize search for large datasets
- [ ] **Notification Timing** - Fix notification auto-hide timing issues
- [ ] **Focus Management** - Better keyboard focus management

## 📱 Platform Support

### Mobile Apps
- [ ] **React Native** - Native mobile app version
- [ ] **Capacitor** - Hybrid mobile app with native features
- [ ] **PWA Optimization** - Better mobile web app experience

### Desktop Apps
- [ ] **Electron** - Desktop application version
- [ ] **Tauri** - Lightweight desktop app alternative
- [ ] **Browser Extensions** - Chrome/Firefox extensions for quick timeline creation

## 🔗 Integrations

### Third-party Services
- [ ] **Notion Integration** - Import from Notion databases
- [ ] **Airtable Support** - Direct Airtable integration
- [ ] **Trello Import** - Import Trello board history
- [ ] **GitHub Integration** - Generate timelines from GitHub activity
- [ ] **Calendar Sync** - Import from Google Calendar, Outlook

### APIs
- [ ] **REST API** - Provide API for external integrations
- [ ] **Webhook Support** - Send timeline updates to webhooks
- [ ] **Zapier Integration** - Connect to Zapier workflows
- [ ] **IFTTT Support** - Trigger timeline updates from IFTTT

## 🎨 Design System

### UI/UX
- [ ] **Design Tokens** - Implement design token system
- [ ] **Component Library** - Extract reusable components
- [ ] **Accessibility** - Full WCAG 2.1 AA compliance
- [ ] **Internationalization** - Multi-language support
- [ ] **Custom Themes** - User-selectable themes

### Branding
- [ ] **Logo Design** - Professional logo and branding
- [ ] **Marketing Site** - Landing page with features/pricing
- [ ] **Documentation Site** - Comprehensive user documentation
- [ ] **Video Tutorials** - Screen-recorded usage tutorials

## 📊 Analytics & Monitoring

### Performance
- [ ] **Core Web Vitals** - Monitor and improve web vitals
- [ ] **Error Tracking** - Implement error tracking (Sentry)
- [ ] **Performance Monitoring** - Track app performance metrics
- [ ] **User Analytics** - Privacy-focused usage analytics

### Business Intelligence
- [ ] **Usage Patterns** - Understand how users create timelines
- [ ] **Feature Adoption** - Track which features are used most
- [ ] **Performance Bottlenecks** - Identify slow operations
- [ ] **Error Analysis** - Analyze common user errors

---

## 🎯 Milestone Planning

### v0.3.0 - Enhanced Data Support (Q1 2025)
- Excel/XLSX support
- Better data validation
- PDF export functionality
- Dark mode support

### v0.4.0 - Performance & Scale (Q2 2025)  
- Virtual scrolling for large datasets
- Data caching and offline support
- TypeScript migration (partial)
- Unit testing setup

### v0.5.0 - Advanced Features (Q3 2025)
- Multiple timeline views
- Real-time collaboration
- API development
- Mobile app (PWA)

### v1.0.0 - Production Ready (Q4 2025)
- Full TypeScript migration
- Comprehensive testing
- Enterprise features
- Professional branding