# ManakSetu UI/UX - Government Website Styling Guide

## Overview
This document outlines the updated UI/UX styling for ManakSetu to achieve a professional government website aesthetic using Times New Roman font family, a consistent hierarchical design system, and a clean minimalist approach with gold as the primary color.

---

## Color Palette

### Primary Colors - Gold (Authority & Regulation)
- **Primary:** `#d4a868` (Government Gold) - Main buttons, headings, primary actions
- **Primary Container:** `#c9935c` (Darker Gold) - Hover states, emphasis
- **On Primary:** `#ffffff` (White text on primary)

### Secondary Colors - Navy Blue (Support & Accent)
- **Secondary:** `#0f2e4d` (Navy Blue) - Secondary buttons, accents
- **Secondary Container:** `#1a4a73` (Lighter Navy) - Hover states, containers
- **On Secondary:** `#ffffff` (White text on secondary)

### Tertiary Colors - Green (Compliance)
- **Tertiary:** `#1b4d2e` (Deep Green) - Approval, success, compliance
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
- **Headline XL:** 26px, lineHeight 1.35, fontWeight 700, letterSpacing 0.15px (Gold Color)
- **Headline L:** 22px, lineHeight 1.4, fontWeight 700, letterSpacing 0.1px (Gold Color)
- **Headline M:** 18px, lineHeight 1.45, fontWeight 600, letterSpacing 0.05px
- **Headline S:** 16px, lineHeight 1.5, fontWeight 600, letterSpacing 0px

#### Body Sizes
- **Body L:** 18px, lineHeight 1.65, fontWeight 400
- **Body M:** 16px, lineHeight 1.65, fontWeight 400 (default)
- **Body S:** 14px, lineHeight 1.6, fontWeight 400

#### Label Sizes
- **Label M:** 14px, lineHeight 1.4, fontWeight 600, letterSpacing 0.3px (Gold Color)
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
  - **Primary Button:** Gold background (#d4a868), white text
  - **Secondary Button:** Navy background (#0f2e4d), white text
  - **Tertiary Button:** Green background (#1b4d2e), white text
  - **Ghost Button:** White background, gold border, gold text

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
- **Focus State:** Gold border (#d4a868) with outline
- **Label:** Gold color (#d4a868), fontWeight 600, 14px

### Navigation
- **Sidebar Background:** Off-white (#f5f3f0)
- **Header Background:** White (#fffbf8)
- **Active Link:** Gold background (#d4a868), white text
- **Hover:** Light gold background (#c9935c)
- **Border:** Light brown outline
- **Text Only:** No icons, use clear labels

### Cards & Content Boxes
- **Background:** Surface color (#fffbf8)
- **Border:** 1px solid outline-variant (#a89f96)
- **Border Radius:** 0.5rem
- **Padding:** `unit-lg` (1.5rem)
- **Shadow:** Subtle (box-shadow: 0 1px 3px rgba(0,0,0,0.08))

### Tables
- **Header:** Gold background (#d4a868), white text, fontWeight 600
- **Rows:** Alternate backgrounds with surface colors
- **Border:** Outline color (#6b6460)
- **Font:** Times New Roman, 16px body text, 14px for data

### Alerts & Status
- **Success:** Green (#1b4d2e)
- **Warning:** Gold (#d4a868)
- **Error:** Red (#b3261e)
- **Info:** Navy (#0f2e4d)

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

## Design Principles - Minimalist Government Aesthetic

### No Icons Policy
- Navigation items use text labels only
- Breadcrumbs use "/" separator instead of icons
- No notification badges or status indicators
- Clean, text-based interface
- Focus on clarity and simplicity

### Simplified Language
- Short, direct action labels
- No unnecessary adjectives
- Professional terminology only
- Remove corporate jargon
- Clear section headings

### Consistency
- All elements follow design system
- Unified color usage
- Consistent typography hierarchy
- Professional spacing
- Clean borders and outlines

---

## Implementation Examples

### Button - Primary
```css
background-color: #d4a868;
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
  background-color: #c9935c;
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
color: #d4a868;
font-family: 'Times New Roman', Times, serif;
font-size: 14px;
font-weight: 600;
letter-spacing: 0.3px;
display: block;
margin-bottom: 0.5rem;
```

### Section Heading
```css
font-size: 26px;
line-height: 1.35;
font-weight: 700;
color: #d4a868;
font-family: 'Times New Roman', Times, serif;
margin-bottom: 1rem;
```

---

## Consistency Checklist

- [ ] All text uses Times New Roman font family
- [ ] Font sizes follow the hierarchy (Display, Headline, Body, Label, Code)
- [ ] H1, H2 headings use #d4a868 gold color
- [ ] Form labels use #d4a868 gold color
- [ ] Primary buttons use gold background
- [ ] Secondary buttons use navy background
- [ ] No icons in navigation
- [ ] No unnecessary badges or indicators
- [ ] Breadcrumbs use "/" separator
- [ ] Background is #f5f3f0 (cream)
- [ ] Surface is #fffbf8 (white-cream)
- [ ] Spacing follows unit system
- [ ] Border radius is 0.5rem for most elements
- [ ] All interactive elements have hover states
- [ ] Language is professional and concise

---

## Government Website Best Practices Applied

1. **Professional Typography:** Times New Roman is a trusted serif font used in official government documents
2. **Formal Color Scheme:** Gold, Navy, and Green evoke government authority and fiscal responsibility
3. **Minimalist Design:** No unnecessary icons or visual clutter
4. **Clear Hierarchy:** Font size hierarchy ensures readability and guidance
5. **Accessibility:** High contrast ratios, readable font sizes (minimum 14px for body)
6. **Consistent Spacing:** Disciplined use of spacing units creates order
7. **Simplicity:** Clean design without unnecessary gradients or effects
8. **Trust Building:** Classic, established design patterns over trends
9. **Professional Language:** Direct, clear, jargon-free communication
10. **Icon-Free:** Text-based navigation for clarity and accessibility

---

## Changes from Previous Version

- Primary color swapped from Navy to Gold (#d4a868)
- Secondary color changed to Navy (#0f2e4d)
- Removed all Material Symbols icons from components
- Simplified breadcrumb navigation (removed chevron)
- Removed notification system and bell icon
- Removed profile action menu
- Simplified navigation labels
- Removed unnecessary status badges
- Removed keyboard shortcut symbols
- Removed search icon from inputs
- Streamlined descriptions and labels
- Focus on text-based, professional interface

---

## Migration Notes

### Files Changed
- `frontend/tailwind.config.ts` - Color tokens swapped
- `frontend/src/app/globals.css` - Heading colors updated to gold
- `frontend/src/components/navigation/Header.tsx` - Icons and clutter removed
- `frontend/src/components/navigation/Sidebar.tsx` - Icons and badges removed

### Components to Review
All React components should be reviewed to ensure:
- Primary color (#d4a868) used correctly
- Secondary color (#0f2e4d) used for accents
- No icons in navigation elements
- Concise, professional language
- Proper font hierarchy
- Consistent spacing
