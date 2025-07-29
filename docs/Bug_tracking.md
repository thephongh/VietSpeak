# Bug Tracking and Error Documentation

## Purpose
This document tracks all errors, issues, and their resolutions encountered during the development of the Vietnamese Text-to-Speech application.

## Error Categories
- **Setup Issues**: Environment setup and dependency problems
- **Backend Issues**: FastAPI, TTS engine, and audio processing errors
- **Frontend Issues**: Next.js, React, and UI component problems
- **Integration Issues**: API communication and data flow problems
- **Performance Issues**: Memory, CPU, and audio processing performance
- **Browser Issues**: Cross-browser compatibility and web audio problems

## Bug Entry Format
```
### [ERROR-001] Error Title
**Date**: YYYY-MM-DD
**Category**: Category Name
**Severity**: Critical/High/Medium/Low
**Description**: Detailed description of the error
**Steps to Reproduce**: 
1. Step 1
2. Step 2
3. Step 3
**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Error Message**: Exact error message if applicable
**Root Cause**: Analysis of why the error occurred
**Resolution**: How the error was fixed
**Prevention**: How to prevent this error in the future
**Related Files**: List of files modified to fix the issue
```

## Known Issues

### [FRONTEND-001] Tailwind CSS v4 PostCSS Configuration Error
**Date**: 2025-07-29
**Category**: Frontend Issues
**Severity**: High
**Description**: Tailwind CSS v4 requires @tailwindcss/postcss plugin instead of direct tailwindcss import
**Steps to Reproduce**: 
1. Run npm run build in frontend directory
2. Build fails with PostCSS plugin error
**Expected Behavior**: Build should complete successfully
**Actual Behavior**: Build fails with "The PostCSS plugin has moved to a separate package" error
**Error Message**: "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin"
**Root Cause**: Tailwind CSS v4 architecture change requires specific PostCSS plugin
**Resolution**: Install @tailwindcss/postcss and update PostCSS config
**Prevention**: Use proper Tailwind CSS v4 configuration from the start
**Related Files**: postcss.config.js, package.json

### [FRONTEND-002] Next.js Config Deprecated appDir Option
**Date**: 2025-07-29
**Category**: Frontend Issues
**Severity**: Low
**Description**: next.config.js uses deprecated appDir experimental option
**Steps to Reproduce**: 
1. Run npm run build
2. Warning appears about invalid config options
**Expected Behavior**: No configuration warnings
**Actual Behavior**: Warning about unrecognized 'appDir' key
**Root Cause**: Next.js 15 no longer needs experimental appDir option
**Resolution**: Remove appDir from experimental config
**Prevention**: Use current Next.js configuration patterns
**Related Files**: next.config.js

## Resolved Issues
(Issues that have been fixed will be moved here)

## Recurring Issues
(Issues that appear multiple times will be documented here with prevention strategies)

## Best Practices for Error Handling
- Always check this document before starting bug fixes
- Document all errors with complete information
- Include exact error messages and stack traces
- Test fixes thoroughly before marking as resolved
- Update prevention strategies based on resolved issues