# ManakSetu UI/UX - Government Website Styling Guide

## Overview
This document outlines the updated UI/UX styling for ManakSetu to achieve a professional government website aesthetic using Times New Roman font family and a consistent, hierarchical design system.

---

## Color Palette

### Primary Colors
- **Primary:** `#0f2e4d` (Deep Navy Blue) - Authority, Trust, Government
- **Primary Container:** `#1a4a73` (Lighter Navy)
- **On Primary:** `#ffffff` (White text on primary)

### Secondary Colors
- **Secondary:** `#8b6914` (Government Gold/Brown) - Regulation, Standards
- **Secondary Container:** `#d4a868` (Light Gold)
- **On Secondary:** `#ffffff` (White text on secondary)

### Tertiary Colors
- **Tertiary:** `#1b4d2e` (Deep Green) - Approval, Compliance
- **Tertiary Container:** `#2d7a47` (Lighter Green)
- **On Tertiary:** `#ffffff` (White text on tertiary)

### Surface Colors
- **Background:** `#f5f3f0` (Off-white cream)
- **Surface:** `#fffbf8` (White with cream tint)
- **Surface Containers:** Various shades from `#f9f6f3` to `#e8e1d9`
- **On Surface:** `#1a1410` (Deep brown/black text)

### Supporting Colors
- **Outline:** `#6b6460` (Medium brown - borders)
- **Outline Variant:** `#a89f96` (Light brown - subtle borders)
- **Error:** `#b3261e` (Red for errors)
- **Error Container:** `#f9dedc` (Light red background)

---

## Typography System

### Font Family
- **Primary:** Times New Roman, Times, serif
- **Code:** Courier New, monospace
- **All elements** use serif fonts for government formality

### Font Hierarchy

#### Display Sizes (Page Headings)
- **Display Large:** 36px, lineHeight 1.3, fontWeight 700, letterSpacing 0.3px
- **Display Large Mobile:** 28px, lineHeight 1.35, fontWeight 700, letterSpacing 0.2px

#### Headline Sizes
- **Headline XL:** 26px, lineHeight 1.35, fontWeight 700, letterSpacing 0.15px
- **Headline L:** 22px, lineHeight 1.4, fontWeight 700, letterSpacing 0.1px
- **Headline M:** 18px, lineHeight 1.45, fontWeight 600, letterSpacing 0.05px
- **Headline S:** 16px, lineHeight 1.5, fontWeight 600, letterSpacing 0px

#### Body Sizes
- **Body L:** 18px, lineHeight 1.65, fontWeight 400
- **Body M:** 16px, lineHeight 1.65, fontWeight 400 (default)
- **Body S:** 14px, lineHeight 1.6, fontWeight 400

#### Label Sizes
- **Label M:** 14px, lineHeight 1.4, fontWeight 600, letterSpacing 0.3px
- **Label S:** 13px, lineHeight 1.35, fontWeight 600, letterSpacing 0.2px
- **Label Eyebrow:** 12px, lineHeight 1.3, fontWeight 700, letterSpacing 0.5px, uppercase

#### Code Sizes
- **Code S:** 13px, lineHeight 1.5, fontWeight 400, Courier New

---

## Component Styling Guidelines

### Buttons
- Consistent padding: `unit-md` (1rem) horizontal, `unit-sm` (0.75rem) vertical
- Border radius: `0.5rem` for rounded corners
- Font: Times New Roman, 16px, fontWeight 600
- Always include clear hover and active states
- Color scheme:
  - **Primary Button:** Navy blue background (#0f2e4d), white text
  - **Secondary Button:** Gold background (#8b6914), white text
  - **Tertiary Button:** Green background (#1b4d2e), white text
  - **Ghost Button:** White background, navy border, navy text

### Sections & Containers
- **Consistent spacing:** Use unit system (unit-sm, unit-md, unit-lg, unit-xl)
- **Background:** Surface colors with subtle cream tint
- **Border Radius:** 0.5rem for clean, professional look
- **Padding:** Minimum `unit-lg` (1.5rem) on desktop, `unit-md` (1rem) on mobile
- **Shadows:** Minimal, use only for card elevations

### Forms & Inputs
- **Font:** Times New Roman, 16px
- **Border:** 1px solid outline color (#6b6460)
- **Border Radius:** 0.5rem
- **Padding:** `unit-sm` (0.75rem) inside inputs
- **Focus State:** Navy border (#0f2e4d) with outline
- **Label:** Gold/Secondary color (#8b6914), fontWeight 600, 14px

### Cards & Content Boxes
- **Background:** Surface color (#fffbf8)
- **Border:** 1px solid outline-variant (#a89f96)
- **Border Radius:** 0.5rem
- **Padding:** `unit-lg` (1.5rem)
- **Shadow:** Subtle (box-shadow: 0 1px 3px rgba(0,0,0,0.08))

### Tables
- **Header:** Navy background (#0f2e4d), white text, fontWeight 600
- **Rows:** Alternate backgrounds with surface colors
- **Border:** Outline color (#6b6460)
- **Font:** Times New Roman, 16px body text, 14px for data

### Navigation
- **Background:** Navy primary (#0f2e4d)
- **Text:** White on primary
- **Active Link:** Gold color (#8b6914)
- **Hover:** Lighter navy (#1a4a73)

### Alerts & Status
- **Success:** Green tertiary color (#1b4d2e)
- **Warning:** Gold secondary color (#8b6914)
- **Error:** Red error color (#b3261e)
- **Info:** Navy primary color (#0f2e4d)

---

## Spacing System

### Standard Units
- **unit-2xs:** 0.25rem (4px)
- **unit-xs:** 0.5rem (8px)
- **unit-sm:** 0.75rem (12px)
- **unit-md:** 1rem (16px)
- **unit-lg:** 1.5rem (24px)
- **unit-xl:** 2rem (32px)
- **unit-2xl:** 2.5rem (40px)
- **unit-3xl:** 3rem (48px)

### Application
- **Gutters:** 1.5rem desktop, 0.75rem mobile
- **Container Margins:** 2rem desktop, 1rem mobile
- **Inter-component spacing:** unit-lg (1.5rem)
- **Padding within components:** unit-md to unit-lg

---

## Border & Border Radius

- **Default Border Radius:** 0.5rem (clean, professional)
- **Small Elements:** 0.25rem
- **Large Elements:** 1rem (optional for special containers)
- **Border Width:** 1px standard, 2px for highlights
- **Border Color:** Outline (#6b6460) or Outline Variant (#a89f96)

---

## Implementation Examples

### Button - Primary
```css
background-color: #0f2e4d;
color: #ffffff;
padding: 0.75rem 1rem;
border-radius: 0.5rem;
font-family: 'Times New Roman', Times, serif;
font-size: 16px;
font-weight: 600;
border: none;
cursor: pointer;
transition: background-color 0.2s ease;

:hover {
  background-color: #1a4a73;
}
```

### Card Container
```css
background-color: #fffbf8;
border: 1px solid #a89f96;
border-radius: 0.5rem;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
```

### Form Label
```css
color: #8b6914;
font-family: 'Times New Roman', Times, serif;
font-size: 14px;
font-weight: 600;
letter-spacing: 0.3px;
display: block;
margin-bottom: 0.5rem;
```

### Section Heading
```css
font-size: 22px;
line-height: 1.4;
font-weight: 700;
color: #0f2e4d;
font-family: 'Times New Roman', Times, serif;
margin-bottom: 1rem;
```

---

## Consistency Checklist

- [ ] All text uses Times New Roman font family
- [ ] Font sizes follow the hierarchy (Display, Headline, Body, Label, Code)
- [ ] All headings use #0f2e4d navy color
- [ ] Buttons use consistent padding and border radius
- [ ] Primary color is #0f2e4d (navy)
- [ ] Secondary color is #8b6914 (gold)
- [ ] Tertiary color is #1b4d2e (green)
- [ ] Background is #f5f3f0 (cream)
- [ ] Surface is #fffbf8 (white-cream)
- [ ] Spacing follows unit system
- [ ] Border radius is 0.5rem for most elements
- [ ] All interactive elements have hover states

---

## Government Website Best Practices Applied

1. **Professional Typography:** Times New Roman is a trusted serif font used in official government documents
2. **Formal Color Scheme:** Navy, gold, and green evoke government authority and fiscal responsibility
3. **Clear Hierarchy:** Font size hierarchy ensures readability and guidance
4. **Accessibility:** High contrast ratios, readable font sizes (minimum 14px for body)
5. **Consistent Spacing:** Disciplined use of spacing units creates order
6. **Minimal Embellishment:** Clean design without unnecessary gradients or effects
7. **Trust Building:** Classic, established design patterns over trends

---

## Migration Notes

### Files Changed
- `frontend/src/app/globals.css` - Updated color variables and typography
- `frontend/tailwind.config.ts` - Updated theme colors and font stack
- `frontend/src/app/layout.tsx` - Removed IBM Plex Sans imports, using system serif

### Breaking Changes
- Font family changed from IBM Plex Sans to Times New Roman
- Color palette completely updated
- Some spacing values adjusted for better readability
- Border radius standardized to 0.5rem

### Components to Review
All React components in `/frontend/src/components/` should be reviewed to ensure:
- Proper use of the new font sizes
- Correct application of color tokens
- Consistent padding and spacing
- Proper contrast ratios for accessibility
