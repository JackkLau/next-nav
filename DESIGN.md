---
version: alpha
name: Navigation To Value
description: A multilingual website directory with blue navigation and a practical catalog editor.
colors:
  primary: 'oklch(0.623 0.214 259.815)'
  background: 'oklch(1 0 0)'
  foreground: 'oklch(0.141 0.005 285.823)'
  muted: 'oklch(0.967 0.001 286.375)'
  muted-foreground: 'oklch(0.552 0.016 285.938)'
  destructive: 'oklch(0.577 0.245 27.325)'
  border: 'oklch(0.92 0.004 286.32)'
typography:
  sans:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
  mono:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
rounded:
  DEFAULT: '0.875rem'
  md: '0.625rem'
  lg: '0.875rem'
spacing:
  editor-max: '56rem'
  card-padding: '1.5rem'
  section-gap: '1.5rem'
components:
  button: {}
  input: {}
  card: {}
  confirmation-dialog: {}
---

# Navigation To Value Design System

## Overview

The interface works like an organized shelf of bookmarked tools: recognizable site names, short descriptions, category navigation, and predictable actions. Public pages help visitors find resources; `/[locale]/tools/nav-gen` is a product form for maintaining the catalog. Preserve the existing identity when adding maintenance features.

README.md establishes an overseas, English-first audience. The supported locales are English, Japanese, Korean, French, German, Spanish, Portuguese, Russian, and Italian. Japanese is a supported language; it does not establish Japan-specific business rules. Use complete localized labels, errors, status messages, and confirmation copy. Destructive Japanese copy has not received independent native review.

## Colors

`src/app/globals.css` is the canonical runtime token source. This document mirrors its accepted light-theme values; `@theme inline` exposes them to Tailwind, and shared UI components consume semantic classes. The document does not generate CSS. Dark values remain owned by the existing `.dark` declarations.

Blue identifies ordinary primary actions. White cards and the existing slate page background organize content. Use the destructive token for removal icons, errors, and final confirmation actions; show consequences in text as well as color. Keep the normal removal action outlined and separate from the primary create/save action.

## Typography

`src/app/[locale]/layout.tsx` owns Geist and Geist Mono. Headings use weight and size for hierarchy; URL and JSON displays use monospace. Keep complete maintenance URLs visible with wrapping instead of truncation. Retain system script fallbacks for supported non-Latin languages and use comfortable line height for localized explanatory copy.

## Layout

The editor uses a natural-height column capped at `max-w-4xl`, with `p-6`, `gap-6`, and shared card padding. The established GlobalLayout owns the viewport and its `data-content-scroll` region owns page scrolling; maintenance forms remain natural-height inside it. Forms stack on mobile; related controls can align at the existing `sm` and `md` breakpoints. New maintenance sections reuse this column. Confirmation dialogs fit the viewport, allow long content to scroll, and stack action buttons on narrow screens.

## Elevation & Depth

Shared cards use borders and a small shadow. Modal confirmations use an overlay and a stronger shadow to isolate a decision. Routine static content needs no additional decoration.

## Shapes

The runtime radius is `0.875rem`; Tailwind maps medium controls to `0.625rem` and large cards to `0.875rem`. Continue using shared Input, Button, and Card recipes.

## Components

| Capability     | Canonical owner                                              | Source of truth                 | Allowed variants                  | Verification                             |
| -------------- | ------------------------------------------------------------ | ------------------------------- | --------------------------------- | ---------------------------------------- |
| Form           | `src/components/ui/input.tsx`, Label, and feature validation | `docs/tool-submission.md`       | create/edit and URL lookup        | typecheck, route tests, runtime workflow |
| Select/Listbox | `src/components/ui/select.tsx` (Radix)                       | shared Select recipe            | authored category selection       | keyboard and open-popup inspection       |
| Toast          | Sonner Toaster in locale layout                              | existing editor feedback        | success/info/error                | runtime status inspection                |
| CRUD           | `src/app/api/sites/submit/route.ts`                          | `docs/tool-submission.md`       | stay in editor after save/removal | route and isolated PostgreSQL checks     |
| Scrollbar      | `src/app/globals.css`                                        | existing application stylesheet | existing global baseline          | runtime computed styles                  |

The removal workflow uses the shared access-password field, Input, Button, Card, and Sonner provider. `ConfirmationDialog` owns accessible modal confirmation through the existing Radix Dialog dependency: title, description, focus trap, initial cancel focus, Escape, and focus restoration. Pending removal stays open until the server responds; failures remain available as inline text.

Password fields start masked and provide a localized reveal control. Removal uses explicit URL lookup and confirmation; changing the URL or password invalidates the reviewed target. Requests are cancellable, have a timeout, and cannot submit twice while busy. URL values survive password correction; secrets remain in component memory and same-origin request bodies.

Lucide is the editor icon family. Text identifies actions; icons supplement it. Existing global reduced-motion rules govern spinners and transitions. Product copy uses concrete verbs and names the object and consequence before removal. Soft removal preserves the record and can be reversed through the existing availability editor.

## Do's and Don'ts

- Reuse canonical tokens and UI primitives; inspect this mapping when shared CSS changes.
- Keep errors actionable, associated with inputs, and available after a request finishes.
- Keep full addresses readable in review and confirmation states.
- Preserve catalog identity, translation data, and removal markers during maintenance.
- Do not introduce a new page theme for one feature or use browser-native confirmation dialogs.

Existing drift outside this feature includes independently styled editor notices, a resizable description textarea, and incomplete scrollbar active/forced-color states. These are recorded rather than redefined as new system rules. Verification should distinguish such baseline issues from changes in the removal workflow.
