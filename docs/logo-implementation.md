# Logo Implementation Documentation

## Overview
The MAYA logo is a custom-built, animated glitch matrix component designed to provide a modern, high-tech aesthetic. It has been integrated into a reusable `Brand` component for consistency across the application.

## Components

### 1. Logo Component (`src/components/Logo.tsx`)
The core animation component.
- **Features**:
  - 12x12 grid-based animation.
  - Dynamic glitch effects using sine waves and random spikes.
  - Scanline effect that moves vertically.
  - Error boundary/fallback UI (pulsing placeholder).
  - Detailed console logging for initialization and cleanup.
- **Props**:
  - `size`: Number (default 30).
  - `showGlow`: Boolean (default true).
  - `className`: String.

### 2. Brand Component (`src/components/Brand.tsx`)
The standard branding wrapper used in headers, footers, and sidebars.
- **Features**:
  - Combines the animated `Logo` with the `MAYA.AI` text.
  - Responsive sizing (mobile vs. desktop).
  - Uses the `@00FFB2` brand color for the `.AI` suffix.

## Integration Points
The `Brand` component is used in the following locations:
- **Header** (`src/components/Header.tsx`): Main navigation branding.
- **Footer** (`src/components/Footer.tsx`): Bottom page branding.
- **Sidebar** (`src/components/Sidebar.tsx`): Chat interface branding.

## Troubleshooting & Debugging
- **Logging**: Check the browser console for `[Logo]` prefix messages.
- **Fallback**: If the animation logic fails, a pulsing emerald square will appear as a fallback.
- **Imports**: Always use `@/components/Logo` or relative paths to ensure consistency.

## Maintenance
- The glitch matrix is defined in `useMemo` for performance.
- Animation speed is controlled by a 50ms interval in a `useEffect` hook.
