# Tailwind CSS Troubleshooting Guide

## Issue Summary

The Vietnamese TTS application experienced complete styling failure where all UI appeared as plain text without any CSS styling applied. This document outlines what went wrong and how to prevent similar issues.

## Root Causes Identified

### 1. Tailwind CSS Version Incompatibility
**Problem**: The project was using Tailwind CSS v4.1.11 with Next.js 15, but the configuration was incompatible.
- `package.json` had `"tailwindcss": "^4.1.11"` and `"@tailwindcss/postcss": "^4.1.11"`
- Tailwind v4 uses different import syntax and configuration requirements
- The `@import "tailwindcss"` syntax in `globals.css` wasn't being processed correctly

**Solution**: Downgraded to stable Tailwind CSS v3.4.0
```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.0
```

### 2. PostCSS Configuration Mismatch
**Problem**: PostCSS config was using the v4 plugin syntax:
```javascript
// postcss.config.js - INCORRECT for v3
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

**Solution**: Fixed to use standard v3 syntax:
```javascript
// postcss.config.js - CORRECT for v3
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3. Incorrect CSS Import Directives
**Problem**: Using v4 import syntax in `globals.css`:
```css
@import "tailwindcss";
```

**Solution**: Changed to standard v3 directives:
```css
@tailwind base;
@tailwind components; 
@tailwind utilities;
```

### 4. Invalid CSS Custom Properties
**Problem**: Using non-existent Tailwind classes:
```css
* {
  @apply border-border;  /* This class doesn't exist */
}

body {
  @apply text-foreground; /* This class doesn't exist */
}
```

**Solution**: Replaced with valid alternatives:
```css
* {
  border-color: hsl(var(--border));
}

body {
  @apply text-gray-900;
}
```

## Symptoms to Watch For

1. **Plain text rendering** - No styling applied, everything appears unstyled
2. **CSS 404 errors** in browser console
3. **Build errors** mentioning unknown Tailwind classes
4. **PostCSS syntax errors** during compilation
5. **Next.js error overlay** showing CSS compilation failures

## Prevention Checklist

### Before Starting a Project

1. **Check Tailwind Version Compatibility**
   ```bash
   # Check current versions
   npm list tailwindcss next
   
   # Use compatible versions
   # Next.js 15 + Tailwind CSS 3.4.x (stable)
   # OR Next.js 14 + Tailwind CSS 3.3.x
   ```

2. **Verify Configuration Files Match Version**
   - `postcss.config.js` should use correct plugin syntax for your Tailwind version
   - `tailwind.config.js` should follow the correct schema
   - `globals.css` should use proper import directives

3. **Test Styling Early**
   - Add a simple colored element to verify CSS is loading
   - Check browser dev tools for CSS loading errors
   - Ensure hot reload updates styling changes

### During Development

1. **Monitor Console Errors**
   - Watch for CSS 404 errors
   - Look for PostCSS compilation warnings
   - Check Next.js error overlay for build issues

2. **Use Standard Tailwind Classes**
   - Avoid custom CSS properties that don't exist in Tailwind
   - Reference official Tailwind documentation for class names
   - Test unknown classes in Tailwind playground first

3. **Server Restart Protocol**
   - Restart development server after configuration changes
   - Clear `.next` cache if styling doesn't update
   - Hard refresh browser to clear cached stylesheets

### Configuration Templates

#### Working package.json (Next.js 15 + Tailwind v3)
```json
{
  "dependencies": {
    "next": "^15.4.4",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

#### Working postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### Working globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* CSS custom properties */
  }
  
  body {
    @apply bg-gradient-to-br from-red-50 via-yellow-50 to-emerald-50 text-gray-900;
  }
}
```

## Debugging Steps

1. **Check package versions**: `npm list tailwindcss postcss autoprefixer`
2. **Verify imports**: Ensure globals.css uses correct `@tailwind` directives
3. **Test simple class**: Add `className="bg-red-500"` to verify Tailwind works
4. **Check console**: Look for CSS loading errors in browser dev tools
5. **Restart server**: Always restart after config changes
6. **Clear cache**: Delete `.next` folder if issues persist

## Key Takeaways

- **Stick to stable versions** for production applications
- **Match configuration to Tailwind version** being used
- **Test styling setup early** in development process
- **Monitor console errors** during development
- **Restart development server** after configuration changes
- **Document working configurations** for team reference

## Resources

- [Tailwind CSS Installation Guide](https://tailwindcss.com/docs/installation)
- [Next.js + Tailwind Setup](https://tailwindcss.com/docs/guides/nextjs)
- [PostCSS Configuration](https://tailwindcss.com/docs/using-with-preprocessors)
- [Tailwind CSS Changelog](https://github.com/tailwindlabs/tailwindcss/releases)