# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Updated README.md to reflect actual implementation (removed TypeScript, Pinia, Tailwind references)
- Fixed GitLab repository URL in documentation

### Added
- CLAUDE.md file for Claude Code integration
- Comprehensive documentation of current architecture and data flow
- Better feature documentation aligned with actual implementation

## [0.2.0] - 2025-01-01

### Fixed
- GitLab CI configuration: separated build and deploy stages
- Fixed script configuration in `.gitlab-ci.yml` (was causing "nested array" error)

### Changed
- Improved GitLab CI pipeline with proper stage separation
- Build artifacts now properly generated in build stage and used in deploy stage

### Added
- Proper GitLab CI/CD pipeline with build and deploy stages
- Dependencies between CI stages for better reliability

## [0.1.0] - 2024-12-XX

### Added
- Initial Vue 3 + Vite application setup
- Interactive timeline component using vis-timeline library
- Support for multiple data sources:
  - Google Sheets (public sheets via API)
  - Framacalc (CSV export)
  - Local CSV files
- Event type support:
  - Contextual events (blue)
  - Trigger events (red)
  - Contextual periods (green)
  - Activity periods (purple)
- URL-based sharing with anchor links
- Real-time search and filtering
- Responsive design for mobile/tablet/desktop
- Notification system for user feedback
- SpreadsheetInput component for data source input
- Service layer for data parsing and validation
- Auto-detection of data source type (Google Sheets vs Framacalc vs CSV)

### Technical
- Vue 3 Composition API implementation
- Vite build system with optimized configuration
- Custom CSS with CSS variables for theming
- Vue Router for navigation
- CORS configuration for development
- File serving middleware for CSV files
- Error handling and user feedback system