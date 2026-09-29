# RyM App — Design System v1.1

This document records the design direction established in Stitch.

## 1. Design direction

Name: Athletic Precision

Characteristics:
- Apple-inspired minimalism.
- Modern fitness/SaaS.
- Light mode only.
- Professional rather than decorative.
- Strong whitespace.
- Clean cards.
- Subtle borders and shadows.
- Moderate corner radii.
- Simple iconography.
- Clear metrics and graphs where useful.
- One primary accent color.

## 2. Color system

Primary accent:
- #0062FF

Background:
- approximately #F9F9FF / #F8F9FA

Surface:
- #FFFFFF

Border:
- #E5E7EB

Primary text:
- #111827

Secondary text:
- #6B7280

Semantic:
- Success: #10B981
- Warning: #F59E0B
- Critical: #EF4444
- Informative: #3B82F6

## 3. Typography

Headings/statistics:
- Manrope

Body/labels:
- Hanken Grotesk

Typography must remain readable on mobile.

## 4. Layout

Desktop:
- navigation/sidebar where appropriate;
- content uses available space without becoming excessively wide;
- clear visual hierarchy.

Mobile:
- workout execution is the highest-priority interaction;
- large touch targets;
- bottom navigation;
- no horizontal scrolling;
- controls must be easy to operate during exercise.

## 5. Components

Use consistent:
- cards
- buttons
- inputs
- select controls
- badges
- tabs
- dialogs
- empty states
- loading states
- error states

## 6. Navigation

Authenticated main navigation:
- Inicio
- Calendario
- Rutinas
- Progreso
- Comidas
- Perfil

Admin section:
- Administración
  - Usuarios
  - Ejercicios
  - Solicitudes

## 7. Stitch reference

The Stitch exports supplied with the project are visual references for implementation. They are not production logic and should not be treated as the source of backend behavior.

## 8. v1.1 additions

There is no Stitch reference for Progreso or for the new Home and Calendar elements. They must be built from the tokens and components in this document.

### Navigation
- The mobile bottom bar has six items. Labels stay on one line at 320 px wide, using short labels and a smaller text size if needed. No horizontal scrolling.

### Calendar status
- Scheduled: dot `#0062FF` (primary).
- Completed: dot `#10B981` (success).
- Not trained: dot `#F59E0B` (warning). Amber is used instead of red to avoid confusion with green for color-blind users and to keep the tone encouraging.
- Dots are 6 px on mobile. On desktop the routine chip keeps the routine name and gains the same dot.
- A legend with the three states sits below the month grid.
- The detail panel shows the state as a text badge in the same color, so color is never the only signal.
- Volume is shown as a metric row in the detail panel: Manrope for the number, secondary text for the label.

### Home progress section
- Four stat cards: 2 × 2 on mobile, 4 × 1 on desktop.
- Number in Manrope, label in Hanken Grotesk, secondary text color.
- The increased-weight card expands to a list of exercises with a gain in `#10B981`, for example `+2,5 kg`.

### Charts
- One series per chart, line and points in `#0062FF`, line width 2 px.
- Grid lines `#E5E7EB`, axis text `#6B7280`, small size.
- Tooltip on the surface color with a border and moderate radius.
- Minimum height 200 px on mobile; the chart fills the card width.
- Range options use the existing pill tab style.

### Weekly sets by muscle group
- Horizontal bars in the primary color, one row per muscle group, count aligned to the right.
- Groups with 0 sets stay listed, with an empty bar and muted text.
- The change versus the previous week is shown as `+n` in success color, `−n` in critical color, or `=` in secondary text.

### Favorites
- Star icon button with a 44 px touch target.
- Not favorite: outline in `#6B7280`. Favorite: filled `#F59E0B`.
- The "Favoritos" filter uses the same pill style as the muscle-group filters.
