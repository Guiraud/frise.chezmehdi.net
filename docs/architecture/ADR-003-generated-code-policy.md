# ADR-003: Generated Code Repository Policy

## Status
✅ **ACCEPTED** - Implemented on 2025-09-01

## Context
The repository contained a `/generated` directory with 736 lines of generated Vue components committed to source control. This created several problems:
- **Merge conflicts** when multiple developers regenerated code
- **Repository bloat** with large, machine-generated files
- **Version control noise** making actual changes harder to identify
- **Unclear ownership** of generated vs. handwritten code

## Decision
**Generated code MUST NOT be committed to the repository.**

### Implementation
1. **Immediate**: Remove `/generated` directory from git tracking
2. **Prevention**: Add `generated/` to `.gitignore` 
3. **Build Process**: Generate code during CI/CD build steps
4. **Documentation**: Clear guidelines on generated vs. source code

## Rationale

### Problems with Generated Code in Git
- **Merge Conflicts**: Different developers regenerating code creates unnecessary conflicts
- **Diff Pollution**: Large generated files obscure meaningful changes in code reviews
- **Storage Waste**: Generated files inflate repository size without adding value
- **Maintenance Burden**: Developers accidentally modify generated files
- **Build Inconsistency**: Generated files may not match current source/config

### Benefits of Build-Time Generation
- **Clean History**: Git history shows only meaningful source changes
- **Conflict Elimination**: Generated files never conflict during merges
- **Consistency**: Generated code always matches current source state
- **Reduced Complexity**: Developers focus only on source files
- **CI Integration**: Generation becomes part of automated build process

## Implementation Details

### Immediate Actions
```bash
# Remove from git tracking
git rm -r generated/ --cached

# Prevent future commits
echo "generated/" >> .gitignore
```

### Build Process Integration
```yaml
# .gitlab-ci.yml
build:
  script:
    - npm run generate  # Generate code from templates
    - npm run build     # Build application with generated code
```

### Directory Structure
```
src/
├── templates/          # Source templates (committed)
├── generators/         # Generation scripts (committed)  
├── generated/          # Generated files (ignored)
└── components/         # Hand-written components (committed)
```

## File Categories

### ✅ Commit to Git
- **Source templates** - `.vue.template`, handlebars, etc.
- **Generator scripts** - Build tools, configuration
- **Configuration files** - Generator settings, schema definitions
- **Documentation** - How to generate, template usage

### ❌ Never Commit to Git  
- **Generated components** - Output of template processing
- **Compiled artifacts** - Built/bundled files
- **Temporary files** - Intermediate generation steps
- **Cache files** - Generator caches, build artifacts

## Exception Handling

### When Generated Code Must Be Tracked
In rare cases where generated files need versioning:

1. **Separate Repository**: Use dedicated repo for generated artifacts
2. **Tagged Releases**: Generate and tag at release milestones only
3. **Clear Naming**: Use `.generated.js` suffix to indicate origin
4. **Documentation**: Extensive comments explaining generation process

### Development Workflow
```bash
# Developer workflow
npm run generate    # Generate code locally
npm run dev        # Develop with generated code
                   # (generated/ stays in .gitignore)

# CI workflow  
npm install        # Install dependencies
npm run generate   # Generate code in CI environment
npm run build      # Build with fresh generated code
npm run test       # Test generated + source code
```

## Consequences

### Positive
- **Cleaner Repository**: Only meaningful source code in version control
- **Reduced Conflicts**: Eliminates merge conflicts from generated files
- **Better Code Reviews**: Focus on actual logic changes, not generated noise
- **Consistent Builds**: Generated code always matches current source state
- **Faster Clones**: Smaller repository size improves clone/fetch times

### Negative
- **Build Complexity**: Must ensure generation works in all environments
- **Debug Difficulty**: Debugging generated code requires generation step
- **Local Setup**: Developers must run generation locally for development

## Monitoring & Validation

### Build Checks
- **Generation Success**: Ensure generation step never fails silently
- **Output Validation**: Validate generated code meets quality standards
- **Consistency Checks**: Compare generated output across environments

### Developer Guidelines
- **Pre-commit Hooks**: Block commits that include generated files
- **IDE Configuration**: Hide generated directories from file explorers
- **Documentation**: Clear README on generation workflow

## Follow-up Actions
- [ ] Update CI/CD pipeline to include generation step
- [ ] Add pre-commit hooks to prevent generated file commits
- [ ] Create developer documentation for generation workflow
- [ ] Audit other directories for accidentally committed generated content

---
*This ADR establishes the policy that generated code must not be committed to the repository, ensuring cleaner version control and more maintainable build processes.*