# UI/UX Design Documentation

## Design System Overview

This document outlines the design specifications, user experience guidelines, and component standards for the Vietnamese Text-to-Speech application.

## Design Philosophy

### Core Principles
- **Accessibility First**: Ensure the application is usable by people with various abilities
- **Audio-Centric**: Design optimized for audio processing and playback workflows
- **Multilingual Support**: UI elements support Vietnamese, English, and French content
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features
- **Performance Optimized**: Minimize loading times and provide clear feedback during audio processing

### Visual Style
- **Modern Minimalism**: Clean, uncluttered interface focusing on functionality
- **Audio-First Design**: Visual elements that complement audio workflows
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **High Contrast**: Accessible color combinations for better visibility

## Color Palette & Design System

### Primary Colors
```css
/* Primary Brand Colors */
--primary-600: #7c3aed;          /* Main brand purple */
--primary-500: #8b5cf6;          /* Interactive elements */
--primary-400: #a78bfa;          /* Hover states */
--primary-100: #ede9fe;          /* Background highlights */

/* Secondary Colors */
--secondary-600: #059669;        /* Success states, Vietnamese language indicator */
--secondary-500: #10b981;        /* Accent color */
--secondary-100: #d1fae5;        /* Success backgrounds */

/* Neutral Colors */
--gray-900: #111827;             /* Primary text */
--gray-800: #1f2937;             /* Secondary text */
--gray-700: #374151;             /* Muted text */
--gray-100: #f3f4f6;             /* Background */
--gray-50: #f9fafb;              /* Card backgrounds */
--white: #ffffff;                /* Pure white */

/* Semantic Colors */
--error-600: #dc2626;            /* Error states */
--error-100: #fee2e2;            /* Error backgrounds */
--warning-600: #d97706;          /* Warning states */
--warning-100: #fed7aa;          /* Warning backgrounds */
--info-600: #2563eb;             /* Information states */
--info-100: #dbeafe;             /* Information backgrounds */
```

### Typography System
```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Small labels */
--text-sm: 0.875rem;     /* 14px - Body text small */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Medium headings */
--text-3xl: 1.875rem;    /* 30px - Large headings */
--text-4xl: 2.25rem;     /* 36px - Hero headings */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* Spacing Scale (rem units) */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-24: 6rem;        /* 96px */
```

## Component Specifications

### Primary Components

#### Text Input Area
```typescript
interface TextInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  language?: 'vi' | 'en' | 'fr';
  showWordCount?: boolean;
}
```

**Design Specifications:**
- **Size**: Minimum height 120px, auto-expanding up to 400px
- **Typography**: `--text-base` with `--font-normal`
- **Border**: 2px solid `--gray-200`, focus state `--primary-500`
- **Padding**: `--space-4` on all sides
- **Background**: `--white` with `--gray-50` on focus
- **Corner Radius**: 8px

#### Voice Selector Component
```typescript
interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  language: 'vi' | 'en' | 'fr';
  showClonedVoices?: boolean;
}
```

**Design Specifications:**
- **Layout**: Dropdown with preview functionality
- **Item Height**: 48px with voice name and preview button
- **Typography**: Voice name in `--text-base --font-medium`
- **Interactive States**: Hover with `--primary-100` background
- **Icons**: Play icon for voice preview, flag icons for language indicators

#### Audio Player Component
```typescript
interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onDownload?: () => void;
}
```

**Design Specifications:**
- **Layout**: Horizontal player with play/pause, progress bar, time display
- **Height**: 64px fixed height
- **Progress Bar**: 4px height, `--primary-500` fill, `--gray-200` background
- **Controls**: 40px circular buttons with icons
- **Typography**: Time display in `--text-sm --font-mono`

#### Voice Controls Panel
```typescript
interface VoiceControlsProps {
  speed: number;
  pitch: number;
  onSpeedChange: (speed: number) => void;
  onPitchChange: (pitch: number) => void;
  language: 'vi' | 'en' | 'fr';
}
```

**Design Specifications:**
- **Layout**: Two-column grid with labeled sliders
- **Slider Track**: 4px height, rounded ends
- **Slider Thumb**: 20px diameter circle with subtle shadow
- **Labels**: `--text-sm --font-medium` above each control
- **Value Display**: Current value shown in `--text-xs --font-mono`

### Secondary Components

#### File Upload Area
**Design Specifications:**
- **Layout**: Dashed border drag-and-drop zone
- **Size**: 200px height, full width
- **States**: Default, drag-over, uploading, error, success
- **Typography**: Upload instruction in `--text-base`, file info in `--text-sm`
- **Icon**: Upload icon, 48px size in `--gray-400`

#### Voice Cloning Interface
**Design Specifications:**
- **Layout**: Multi-step wizard with progress indicator
- **Step Indicator**: Horizontal stepper with numbered circles
- **Recording Controls**: Large record button (80px diameter) with visual feedback
- **Waveform Visualization**: Real-time audio waveform display
- **Progress Feedback**: Progress bar with percentage and time remaining

#### Settings Panel
**Design Specifications:**
- **Layout**: Collapsible sidebar or modal overlay
- **Section Headers**: `--text-lg --font-semibold` with divider lines
- **Toggle Switches**: iOS-style switches with smooth animations
- **Theme Toggle**: Sun/moon icon toggle for dark/light mode

## User Experience Flow

### Primary User Journey: Text-to-Speech Generation

#### Step 1: Text Input
1. **Landing State**: Empty text area with helpful placeholder
2. **Input Methods**: 
   - Type directly into text area
   - Upload text file (drag-and-drop or file picker)
   - Paste from clipboard with format detection
3. **Real-time Feedback**: Character count, estimated audio duration
4. **Language Detection**: Automatic language detection with manual override

#### Step 2: Voice Selection
1. **Default Voices**: Grid of available voices by language
2. **Voice Preview**: Quick audio samples for each voice
3. **Custom Voices**: Section for user-cloned voices
4. **Voice Comparison**: Side-by-side voice preview capability

#### Step 3: Voice Customization
1. **Speed Control**: Slider from 0.5x to 2.0x normal speed
2. **Pitch Adjustment**: Range from -12 to +12 semitones
3. **Real-time Preview**: Live preview of changes on sample text
4. **Presets**: Save and load custom voice settings

#### Step 4: Generation & Playback
1. **Processing Indicator**: Progress bar with estimated time
2. **Audio Player**: Full-featured player with scrubbing
3. **Export Options**: Download as MP3, WAV, or other formats
4. **History**: Access to recently generated audio files

### Secondary User Journey: Voice Cloning

#### Step 1: Voice Recording/Upload
1. **Recording Interface**: Browser-based audio recording
2. **Upload Alternative**: Support for existing audio files
3. **Quality Requirements**: Clear guidelines for audio quality
4. **Sample Text**: Provided text for consistent training data

#### Step 2: Voice Training
1. **Processing Feedback**: Progress indicator with stages
2. **Quality Check**: Automated assessment of voice quality
3. **Preview Generation**: Test synthesis with sample text
4. **Iteration Options**: Re-record if quality is insufficient

#### Step 3: Voice Management
1. **Voice Library**: Grid view of all custom voices
2. **Voice Settings**: Edit name, language, sharing preferences
3. **Usage Statistics**: Track how often voices are used
4. **Delete/Archive**: Manage voice storage

## Responsive Design Specifications

### Breakpoints
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;    /* Small devices */
--breakpoint-md: 768px;    /* Medium devices */
--breakpoint-lg: 1024px;   /* Large devices */
--breakpoint-xl: 1280px;   /* Extra large devices */
--breakpoint-2xl: 1536px;  /* 2X large devices */
```

### Layout Adaptations

#### Mobile (< 640px)
- **Navigation**: Hamburger menu with slide-out drawer
- **Text Input**: Full-width, reduced padding
- **Audio Player**: Stacked controls, larger touch targets
- **Voice Controls**: Single column layout
- **File Upload**: Smaller drop zone, emphasis on browse button

#### Tablet (640px - 1024px)
- **Navigation**: Horizontal tab bar
- **Text Input**: Two-column layout with controls sidebar
- **Audio Player**: Horizontal layout with all controls visible
- **Voice Selector**: Grid layout with 2-3 voices per row

#### Desktop (> 1024px)
- **Navigation**: Full horizontal navigation with breadcrumbs
- **Layout**: Three-column layout (sidebar, main, controls)
- **Voice Selector**: Grid with 4-6 voices per row
- **Advanced Features**: Floating panels, keyboard shortcuts

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color and Contrast
- **Text Contrast**: Minimum 4.5:1 ratio for normal text
- **Large Text**: Minimum 3:1 ratio for headings and large text
- **Interactive Elements**: Minimum 4.5:1 ratio for buttons and controls
- **Color Independence**: Information not conveyed by color alone

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence throughout the application
- **Focus Indicators**: Clear visual focus indicators on all interactive elements
- **Keyboard Shortcuts**: 
  - `Space` or `Enter`: Play/pause audio
  - `←/→` Arrow keys: Seek audio forward/backward
  - `Esc`: Close modals and dropdowns
  - `Ctrl+U`: Focus text input area

#### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling for all interactive elements
- **Live Regions**: Announcements for audio playback status
- **Landmark Roles**: Proper semantic structure with header, main, navigation
- **Alternative Text**: Descriptive alt text for all images and icons

#### Audio Accessibility
- **Visual Indicators**: Waveform visualization for audio content
- **Transcript Support**: Optional text display during audio playback
- **Volume Controls**: Accessible volume adjustment with keyboard support
- **Audio Descriptions**: Support for describing audio content

### Language Support

#### Multilingual Interface
- **Language Switching**: Dropdown selector for interface language
- **RTL Support**: Layout adjustments for right-to-left languages
- **Font Loading**: Appropriate fonts for Vietnamese diacritics
- **Cultural Considerations**: Date formats, number formats per locale

#### Content Localization
- **Error Messages**: Localized error messages and help text
- **Voice Names**: Culturally appropriate voice naming conventions
- **Time Formats**: 12/24 hour format based on locale preferences

## Animation and Interaction Design

### Micro-interactions

#### Button States
```css
/* Button Hover Animation */
.button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### Audio Playback Indicators
- **Play Button**: Morphs from play to pause icon
- **Progress Bar**: Smooth progress animation with easing
- **Volume Visualization**: Real-time amplitude visualization
- **Loading States**: Skeleton screens during audio generation

#### Form Interactions
- **Input Focus**: Smooth border color transition and label animation
- **Validation**: Inline validation with gentle shake animation for errors
- **File Upload**: Drag-over state with scale and opacity changes
- **Success States**: Checkmark animation and color transition

### Page Transitions
- **Route Changes**: Smooth fade transitions between pages
- **Modal Overlays**: Slide-in animation with backdrop fade
- **Sidebar**: Slide-out navigation with content shift
- **Tab Switching**: Smooth content swap with fade effect

## Performance Considerations

### Loading States
- **Audio Generation**: Progress bar with time estimation
- **Voice Model Loading**: Skeleton placeholder for voice grid
- **File Uploads**: Upload progress with speed and remaining time
- **Page Load**: Staggered content loading with fade-in animations

### Optimization Strategies
- **Image Optimization**: WebP format with fallbacks, lazy loading
- **Font Loading**: Font display swap for faster text rendering
- **Audio Streaming**: Progressive audio loading for large files
- **Caching**: Aggressive caching for audio files and voice models

### Error Handling
- **Network Errors**: Retry mechanisms with exponential backoff
- **Audio Processing Errors**: Clear error messages with suggested actions
- **File Format Errors**: Detailed validation errors with format requirements
- **Graceful Degradation**: Core functionality available without JavaScript

## Development & Styling Troubleshooting

### Tailwind CSS Configuration Issues

During development, we encountered complete styling failure where the UI appeared as plain text without any CSS styling. This section documents the root causes and prevention strategies.

#### Root Causes Identified

**1. Tailwind CSS Version Incompatibility**
- **Problem**: Used Tailwind CSS v4.1.11 with Next.js 15, but configuration was incompatible
- **Symptoms**: CSS 404 errors, plain text rendering, no styling applied
- **Solution**: Downgraded to stable Tailwind CSS v3.4.0

**2. PostCSS Configuration Mismatch**
```javascript
// postcss.config.js - INCORRECT for v3
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // v4 syntax
    autoprefixer: {},
  },
};

// postcss.config.js - CORRECT for v3
module.exports = {
  plugins: {
    tailwindcss: {},            // v3 syntax
    autoprefixer: {},
  },
};
```

**3. Incorrect CSS Import Directives**
```css
/* globals.css - INCORRECT v4 syntax */
@import "tailwindcss";

/* globals.css - CORRECT v3 syntax */
@tailwind base;
@tailwind components; 
@tailwind utilities;
```

**4. Invalid CSS Custom Properties**
```css
/* INCORRECT - Non-existent classes */
* {
  @apply border-border;    /* This class doesn't exist */
}
body {
  @apply text-foreground;  /* This class doesn't exist */
}

/* CORRECT - Valid alternatives */
* {
  border-color: hsl(var(--border));
}
body {
  @apply text-gray-900;
}
```

#### Prevention Checklist

**Before Starting Development:**
1. **Verify Version Compatibility**
   ```bash
   npm list tailwindcss next
   # Ensure compatible versions (Next.js 15 + Tailwind 3.4.x)
   ```

2. **Test Basic Styling Early**
   - Add simple colored element: `className="bg-red-500"`
   - Check browser console for CSS loading errors
   - Verify hot reload updates styling changes

3. **Monitor Development Console**
   - Watch for CSS 404 errors
   - Look for PostCSS compilation warnings  
   - Check Next.js error overlay for build issues

**Configuration Templates:**

```json
// package.json - Working configuration
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

```css
/* globals.css - Working template */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* Other CSS custom properties */
  }
  
  body {
    @apply bg-gradient-to-br from-red-50 via-yellow-50 to-emerald-50 text-gray-900;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
}
```

#### Debugging Steps
1. Check package versions: `npm list tailwindcss postcss autoprefixer`
2. Verify correct import directives in globals.css
3. Test simple Tailwind class: `className="bg-red-500"`
4. Check browser console for CSS loading errors
5. Restart development server after configuration changes
6. Clear `.next` cache if styling issues persist

#### Current Design Implementation

The application now successfully implements a **Vietnamese flag-inspired color scheme**:

- **Primary Colors**: Red (#dc2626) representing the Vietnamese flag
- **Secondary Colors**: Emerald green (#10b981) representing Vietnamese nature  
- **Accent Colors**: Golden yellow/amber (#d97706) representing the flag's star
- **Background**: Subtle gradient from red-50 via yellow-50 to emerald-50
- **Typography**: Clean gradient header text using flag colors

**Visual Features:**
- Glass-morphism effects with `backdrop-blur-sm`
- Consistent card shadows and hover states
- Responsive button styling with gradients
- Navigation tabs with active state indicators
- Professional spacing and typography hierarchy

This styling approach creates a culturally appropriate and visually cohesive interface that reflects Vietnamese national colors while maintaining modern design principles.

---

This UI/UX documentation ensures a consistent, accessible, and user-friendly experience for the Vietnamese Text-to-Speech application while supporting the technical requirements outlined in the implementation plan.