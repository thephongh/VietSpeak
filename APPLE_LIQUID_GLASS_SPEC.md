# Apple Liquid Glass Design System Specification

## Overview
This document provides the complete specification for implementing Apple's Liquid Glass design language based on official Apple developer documentation. Liquid Glass combines optical properties of glass with fluid responsiveness to create a distinct functional layer that brings focus to underlying content.

## Core Principles

### 1. Material Hierarchy
- **Navigation Layer**: Floats above content (z-index: 1000)
- **Control Layer**: Interactive elements with higher opacity
- **Card Layer**: Content containers with medium opacity
- **Modal Layer**: Highest opacity for focus retention

### 2. Optical Properties
- Translucency with proper backdrop blur
- Adaptive response to interaction
- Hardware-inspired curvature
- Content-focused design philosophy

## CSS Variables

```css
:root {
  /* Apple Liquid Glass Material - Official Specs */
  --liquid-glass-primary: rgba(255, 255, 255, 0.8);
  --liquid-glass-secondary: rgba(255, 255, 255, 0.6);
  --liquid-glass-tertiary: rgba(255, 255, 255, 0.4);
  --liquid-glass-navigation: rgba(255, 255, 255, 0.75);
  --liquid-glass-control: rgba(255, 255, 255, 0.85);
  --liquid-glass-modal: rgba(255, 255, 255, 0.9);
  
  /* Apple Material Blur Levels */
  --material-blur-thin: blur(10px);
  --material-blur-regular: blur(20px);
  --material-blur-thick: blur(30px);
  --material-blur-ultra-thick: blur(40px);
  
  /* Adaptive Material Colors */
  --material-accent: rgba(0, 122, 255, 0.2);
  --material-accent-hover: rgba(0, 122, 255, 0.3);
}
```

## Typography (Apple SF Pro)

```css
:root {
  /* Apple-inspired Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-heavy: 800;
  
  /* Typography Sizes */
  --text-hero-size: clamp(3.5rem, 8vw, 6.5rem);
  --text-h1-size: clamp(2.5rem, 6vw, 4rem);
  --text-h2-size: clamp(2rem, 5vw, 3rem);
  --text-h3-size: clamp(1.5rem, 4vw, 2rem);
  --text-h4-size: 1.25rem;
  --text-body-large-size: 1.25rem;
  --text-body-size: 1.125rem;
  --text-body-small-size: 1rem;
  --text-caption-size: 0.875rem;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.01em;
}
```

## Component Specifications

### Navigation Layer

```css
/* Apple Navigation Layer - Floating Material */
.navigation {
  background: var(--liquid-glass-navigation);
  backdrop-filter: var(--material-blur-regular);
  -webkit-backdrop-filter: var(--material-blur-regular);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03);
  border-radius: 0 0 16px 16px;
  margin: 0 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

#### Key Properties:
- **Background**: 75% opacity white
- **Blur**: 20px backdrop filter
- **Corner Radius**: 16px (hardware-inspired)
- **Shadow**: Layered Apple shadows
- **Margin**: 8px inset from edges

### Controls (Buttons)

```css
/* Apple Liquid Glass Controls - Fluid Morphing */
.btn-primary {
  background: var(--liquid-glass-control);
  color: var(--color-black);
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: var(--material-blur-regular);
  -webkit-backdrop-filter: var(--material-blur-regular);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
  border-radius: 14px; /* +2px expansion */
}
```

#### Key Properties:
- **Background**: 85% opacity white for controls
- **Corner Radius**: 12px (grows to 14px on hover)
- **Transform**: scale(1.02) + translateY(-1px)
- **Transition**: 0.4s Apple easing curve

### Cards

```css
/* Apple Material Cards - Rounder Forms */
.card {
  background: var(--liquid-glass-primary);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: var(--material-blur-thick);
  -webkit-backdrop-filter: var(--material-blur-thick);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 6px rgba(0, 0, 0, 0.02);
}

.card:hover {
  border-color: var(--material-accent);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px) scale(1.01);
  background: var(--liquid-glass-control);
  border-radius: 24px; /* +4px expansion */
}
```

#### Key Properties:
- **Background**: 80% opacity white
- **Corner Radius**: 20px (grows to 24px on hover)
- **Blur**: 30px backdrop filter
- **Transform**: scale(1.01) + translateY(-2px)

## Typography Classes

```css
.hero-text {
  font-size: var(--text-hero-size);
  font-weight: var(--font-weight-bold);
  line-height: 1.05;
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-white);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.h2-text {
  font-size: var(--text-h2-size);
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-black);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.body-text {
  font-size: var(--text-body-size);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-gray-500);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
}
```

## Animation Specifications

### Easing Curves
- **Primary**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (Apple's standard)
- **Duration**: 0.4s for interactions, 0.3s for navigation

### Hover Transforms
- **Buttons**: `translateY(-1px) scale(1.02)`
- **Cards**: `translateY(-2px) scale(1.01)`
- **Corner Radius Growth**: +2px for buttons, +4px for cards

### Shadow System
```css
/* Rest State */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04);

/* Hover State */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);

/* Card Hover */
box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
```

## Implementation Guidelines

### DO ✅
1. **Use standard system components** when possible
2. **Maintain distinct functional layers** (navigation above content)
3. **Apply hardware-inspired corner radius** (12px-20px)
4. **Use proper material opacity** (60%-90% white)
5. **Implement fluid morphing** on interaction
6. **Test with accessibility settings** (reduced motion/transparency)

### DON'T ❌
1. **Add custom reflection animations** (not in Apple spec)
2. **Overuse Liquid Glass effects** (limit to functional elements)
3. **Use excessive transforms** (keep subtle)
4. **Apply to all elements** (content should remain unobscured)
5. **Mix custom backgrounds** with system materials
6. **Ignore accessibility** preferences

## Browser Support

### Backdrop Filter Support
```css
backdrop-filter: var(--material-blur-regular);
-webkit-backdrop-filter: var(--material-blur-regular); /* Safari */
```

### Fallbacks
```css
@supports not (backdrop-filter: blur(20px)) {
  .navigation {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

## Platform Considerations

### iOS/iPadOS
- Tab bars can minimize on scroll
- Semantic search tabs
- Half sheets with corner insets
- Window controls support

### macOS
- Split view layouts
- Background extension effects
- Toolbar grouping
- Menu bar integration

### Responsive Design
- Adapt blur intensity for performance
- Scale corner radius appropriately
- Maintain touch targets (44px minimum)
- Test across device sizes

## Performance Optimization

### GPU Acceleration
```css
will-change: transform; /* Only when animating */
transform: translateZ(0); /* Force GPU layer */
```

### Efficient Blur
- Use standard blur values (10px, 20px, 30px, 40px)
- Combine effects in containers when possible
- Avoid blur on low-end devices

## Tools & Resources

### Apple Design Resources
- [Icon Composer](https://developer.apple.com/design/resources/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Human Interface Guidelines](https://developer.apple.com/design/Human-Interface-Guidelines/)

### Development
- Latest Xcode with updated SDKs
- Test on latest platform releases
- Use standard SwiftUI/UIKit/AppKit components

## Example Implementation

### Complete Button Component
```css
.apple-button {
  /* Base styles */
  background: var(--liquid-glass-control);
  color: var(--color-black);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  
  /* Typography */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0;
  
  /* Glass effects */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* Shadows */
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.08), 
    0 4px 6px rgba(0, 0, 0, 0.04);
  
  /* Interaction */
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.apple-button:hover {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.12), 
    0 8px 16px rgba(0, 0, 0, 0.08);
}

.apple-button:active {
  transform: translateY(0) scale(1);
  transition-duration: 0.1s;
}
```

---

**Note**: This specification is based on Apple's official developer documentation for Liquid Glass design language. Always refer to the latest Apple Design Resources and Human Interface Guidelines for updates and platform-specific implementations.