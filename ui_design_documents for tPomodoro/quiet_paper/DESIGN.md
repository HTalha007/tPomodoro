---
name: Quiet Paper
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#454651'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4559aa'
  primary: '#4356a7'
  on-primary: '#ffffff'
  primary-container: '#5c6fc2'
  on-primary-container: '#fffbff'
  inverse-primary: '#b8c4ff'
  secondary: '#38675a'
  on-secondary: '#ffffff'
  secondary-container: '#bbeddc'
  on-secondary-container: '#3e6d60'
  tertiary: '#745b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cca730'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001354'
  on-primary-fixed-variant: '#2c4090'
  secondary-fixed: '#bbeddc'
  secondary-fixed-dim: '#a0d1c1'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#1f4f43'
  tertiary-fixed: '#ffe08a'
  tertiary-fixed-dim: '#eac24a'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
  canvas-base: '#FAF8F5'
  surface-elevation: '#FFFFFF'
  border-subtle: '#E8E4DE'
  accent-rest: '#DDE3FA'
  accent-hover: '#CBD5F5'
  accent-focus: '#6F82D6'
  accent-ink: '#2F3A6B'
  ink-primary: '#2E2E38'
  ink-secondary: '#6B6B76'
  ink-tertiary: '#9898A4'
  vault-base: '#F1F8F5'
  vault-surface: '#E3F1EC'
  vault-outline: '#9CCDBD'
  vault-ink: '#1F4A40'
  success-surface: '#DDF0E3'
  success-text: '#25593A'
  error-surface: '#F8E1E1'
  error-text: '#8A2F2F'
  warning-surface: '#FBEFD5'
  warning-text: '#6B4A10'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  display-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system draws direct inspiration from tactile, understated stationery, Japanese bookbinding, and archival linen. It is tailored for focused writers, researchers, and knowledge workers who require an environment free from modern interface fatigue.

The visual direction is flat, calm, and architectural. It relies on subtle contrast, structural borders, and paper-like textures rather than saturated fills or aggressive visual indicators. The design evokes psychological safety, permanence, and clarity—treating every note, schema, and encrypted vault as an archival artifact.

## Colors

The core system is structured around warm paper tones, soft pastel tints, and deep pigmented ink tones. 

### Canvas & Standard Surfaces
- **Canvas Base**: `#FAF8F5` (Warm off-white background)
- **Surface Elevation**: `#FFFFFF` (Crisp pure white surface for cards, editor panels, sheets)
- **Dividers & Outlines**: `#E8E4DE` (1px warm muted gray border)

### Primary Accent (Muted Periwinkle)
- **Surface Fill (Rest)**: `#DDE3FA`
- **Surface Fill (Hover)**: `#CBD5F5`
- **Focus Rings, Interactive Links & Active Accents**: `#6F82D6`
- **Ink / Text / Icon on Accent**: `#2F3A6B`

### Text & Ink Hierarchy
- **Primary Ink**: `#2E2E38` (Soft charcoal, avoiding pure black)
- **Secondary Ink**: `#6B6B76` (Muted warm graphite)
- **Tertiary / Placeholder Ink**: `#9898A4`

### Encrypted Vault Theme
When entering an encrypted or locked vault state, the interface transitions to an archival sage-green atmosphere:
- **Vault Page Base**: `#F1F8F5`
- **Vault Surfaces**: `#E3F1EC`
- **Vault Accent / Outline Tint**: `#9CCDBD`
- **Vault Ink / Text / Glyph**: `#1F4A40`

### Semantic & Feedback Surfaces
Status indications use soft pastel fills paired with high-legibility dark ink:
- **Success**: Fill `#DDF0E3`, Text `#25593A`
- **Error**: Fill `#F8E1E1`, Text `#8A2F2F`
- **Warning & Key Recovery**: Fill `#FBEFD5`, Text `#6B4A10`

## Elevation & Depth
Flat and non-skeuomorphic. 0px box shadows, delineated solely by `#E8E4DE` 1px solid borders. Hover: `0 1px 2px rgba(0, 0, 0, 0.05)`.