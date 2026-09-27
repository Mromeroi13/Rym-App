---
name: Athletic Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#424656'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737687'
  outline-variant: '#c2c6d9'
  surface-tint: '#0053da'
  primary: '#004cca'
  on-primary: '#ffffff'
  primary-container: '#0062ff'
  on-primary-container: '#f3f3ff'
  inverse-primary: '#b4c5ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#9e3100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c84000'
  on-tertiary-container: '#fff1ed'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: 4rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 2.5rem
    fontWeight: '800'
    lineHeight: 3rem
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.03em
  stat-numeric:
    fontFamily: Manrope
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an Apple-inspired athletic minimalism tailored for performance tracking, habit formation, and rigorous physical training. The visual language rejects gamified noise and heavy dark-mode skeuomorphism in favor of structural clarity, pure white canvas surfaces, and calculated micro-interactions.

### Core Tenets
- **Objective Clarity:** Interfaces prioritize data hierarchy, workout telemetry, and immediate legibility over stylistic decoration. The user's biometric output and exercise progression take center stage.
- **Disciplined Precision:** Visual tension is maintained through calibrated spatial grids, consistent structural rhythm, and deliberate typography rather than ornamental dividers or heavy fills.
- **Controlled Kinetic Energy:** Athletic energy is introduced sparingly via an electric cobalt accent used exclusively for interactive affordances, progress completions, and primary operational triggers.

### Emotional Profile
The interface evokes the calm, disciplined environment of high-performance physical science: dependable, unhurried, razor-sharp, and unmistakably premium.

## Colors

The system relies strictly on a light aesthetic. Surfaces establish deep optical clarity using pure white for elevated interactive containers and ultra-pale neutral washes for application backdrops.

### Palette Roles
- **Primary Accent (`#0062FF`):** An engineered cobalt blue inspired by modern iOS telemetry. Reserved strictly for primary action buttons, active navigation markers, interactive sliders, selected segment controls, and progress tracking bars. It must never be applied decoratively over large backdrop areas.
- **Base Canvas (`#F8F9FA`):** The primary view background providing slight contrast behind active containers.
- **Elevated Canvas (`#FFFFFF`):** Surface background for cards, modals, sheets, and input fields.
- **Border Stroke (`#E5E7EB`):** A hairline boundary rule used to separate white surfaces from ultra-light backdrops without adding visual weight.
- **Primary Text (`#111827`):** High-density neutral-black delivering maximum optical contrast across all typography scales.
- **Secondary Text (`#6B7280`):** Mid-tone neutral used for metric labels, secondary attributes, breadcrumbs, and helper copy.
- **System States:**
  - **Success (`#10B981`):** PR achievements, completed repetitions, target milestones.
  - **Warning (`#F59E0B`):** Rest timer depletion warnings, training volume alerts.
  - **Critical (`#EF4444`):** Failed sets, dropped connections, destructive triggers.
  - **Informative (`#3B82F6`):** Passive status cues and recovery notifications.

## Typography

The typography pairs `Manrope` for structured, architectural headlines and large-scale performance telemetry with `Hanken Grotesk` for dense, legible reading copy and interactive controls.

### Implementation Rules
- **Tabular Numerics:** For real-time clocks, rest timers, heart rates, and repetition logs, apply `font-variant-numeric: tabular-nums` to eliminate jitter during active changes.
- **Weight Restraint:** Limit weights strictly to 400 (Body Regular), 600 (Semibold UI labels and subheads), 700 (Section Headers and Metrics), and 800 (Display counters). Never use ultra-thin weights below 16px.
- **Negative Tracking:** Apply subtle negative tracking (`-0.01em` to `-0.03em`) on all headers above 20px to ensure the compact, engineered appearance typical of iOS systems.

## Layout & Spacing

Layout geometry follows an 8-point harmonic grid system, scaling down to 4px for tight internal component paddings.

### Layout Breakpoints
- **Mobile (< 768px):** 4-column fluid grid, `1rem` outer canvas margin, `1rem` gutters. Touch targets adhere to a minimum interactive footprint of 44x44px. Single-column stacks for workout routines and logs.
- **Tablet (768px - 1024px):** 8-column fluid grid, `1.5rem` outer margins, `1.5rem` gutters. Splits dashboard between visual analytics and ongoing plan schedules.
- **Desktop (> 1024px):** 12-column fixed grid with a max-width container of `1280px`, centered, using `2.5rem` margins and `1.5rem` gutters. Utilizes a sticky left sidebar for direct app navigation and a dynamic two- or three-pane master-detail arrangement.

### Spacing Principles
- White space functions as a structural group divider. Cards and containers rely on standard internal padding (`space-lg` / 24px on desktop, `space-md` / 16px on mobile) rather than dense nested boxes.

## Elevation & Depth

Visual hierarchy uses a refined combination of pure white surface isolation, hairline borders, and ultra-diffused iOS-style ambient shadows. Avoid dark, muddy drop shadows or heavy blur layers.

### Elevation Levels
- **Layer 0 (Background):** Base tone `#F8F9FA`. Recessed areas, inactive track backgrounds, and table cell headers.
- **Layer 1 (Card & Module Resting):** Surface `#FFFFFF`, hairline stroke `1px solid #E5E7EB`, shadow: `0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)`.
- **Layer 2 (Hover / Active Cards / Menus):** Surface `#FFFFFF`, hairline stroke `1px solid #E5E7EB`, shadow: `0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02)`.
- **Layer 3 (Modals / Floating Bottom Sheets):** Surface `#FFFFFF`, hairline stroke `1px solid rgba(229, 231, 235, 0.8)`, shadow: `0 12px 32px rgba(17, 24, 39, 0.08), 0 4px 8px rgba(17, 24, 39, 0.04)`.
- **Frosted Overlays:** For fixed navigation bars and floating workout controllers, use `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(20px)` and a subtle bottom border `#E5E7EB`.

## Shapes

The interface embraces clean, rounded-corner geometry (Roundedness Level 2) reflecting the smooth squircle aesthetic of iOS interfaces without becoming cartoonish or juvenile.

### Radius Distribution
- **Cards, Modals, & Sheet Panels (`rounded-xl`):** `1.5rem` (24px) on desktop; `1rem` (16px) on mobile for viewport economy.
- **Buttons, Text Inputs, Segmented Controls (`rounded-lg`):** `0.75rem` to `1rem` (12px to 16px), providing an ergonomic touch feel.
- **Pills, Badges, & Chips (`rounded-full`):** Full 9999px radius used exclusively for compact metadata, numeric tags, and status pills.

## Components

### Buttons
- **Primary:** Background `#0062FF`, text `#FFFFFF`, font `label-md`. Height: 44px (mobile) to 48px (desktop). Radius: 12px. No visible border. Hover state transitions to `#0052D6`. Pressed state: `transform: scale(0.98)` for tactile feedback.
- **Secondary:** Background `#FFFFFF`, text `#111827`, border `1px solid #E5E7EB`. Hover: background `#F8F9FA`.
- **Ghost / Tertiary:** Background transparent, text `#0062FF`, padding horizontal `12px`. Hover: background `rgba(0, 98, 255, 0.06)`.

### Cards & Telemetry Modules
- Base background `#FFFFFF`, border `1px solid #E5E7EB`, radius `16px`, padding `1.25rem`.
- Metric units (e.g., `kg`, `reps`, `kcal`) set in `label-sm` using `#6B7280` stacked or inline alongside `stat-numeric` values in `#111827`.

### Segmented Controls (iOS Style)
- Background `#F1F3F5`, padding `3px`, radius `10px`.
- Active segment: Background `#FFFFFF`, text `#111827`, box-shadow `0 2px 4px rgba(0, 0, 0, 0.06)`, radius `8px`.
- Inactive segment: Text `#6B7280`, no shadow.

### Input Fields & Pickers
- Height 44px, radius `10px`, background `#FFFFFF`, border `1px solid #E5E7EB`.
- Active focus: Border color `#0062FF`, box-shadow `0 0 0 3px rgba(0, 98, 255, 0.15)`, outline none.
- Placeholder text: `#9CA3AF`.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** 20x20px square with a `6px` radius. Inactive: border `1.5px solid #D1D5DB`. Checked: background `#0062FF`, border color `#0062FF`, white icon checkmark.
- **Exercise Set Toggles:** Circular 28x28px completion bubbles. Empty state displays set number in `#6B7280`; tap converts to solid `#10B981` (Success) with a clean white tick.

### Progress Bars & Rings
- **Track:** Height 6px to 8px, background `#F1F3F5`, radius full.
- **Indicator:** Solid `#0062FF` (or state-dependent `#10B981` upon workout completion), radius full. Zero gradient interpolation.