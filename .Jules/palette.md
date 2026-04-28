# Palette's UX Journal

## 2025-05-15 - [A11y Foundations: Semantic Controls & Label Pairing]
**Learning:** In a fast-paced development environment, custom UI components like switches or theme toggles are often built using generic `div` tags with click handlers. This renders them invisible to keyboard users and screen readers. Additionally, implicit label pairing (wrapping input in label) is less reliable across screen readers than explicit `htmlFor`/`id` pairing, especially when using modern React with `useId`.

**Action:**
1. Always use semantic `<button>` for custom controls that trigger actions or toggle states.
2. Use `React.useId()` to generate unique IDs for form-label pairing to avoid collisions in complex dashboards.
3. Apply `aria-current="page"` to navigation links to provide semantic context for the user's location.
4. Ensure icon-only buttons have descriptive `aria-label` or `sr-only` text.

## 2025-05-15 - [Design System Focus States]
**Learning:** The application uses high-contrast "Neo-Brutalism" and "Technical" styles where standard browser focus outlines are often suppressed or clash with the aesthetic. Keyboard users lose their place easily in dense grids like the Campaign or Settings pages.

**Action:** Implement `focus-visible:ring-2` with the design system's primary accent color. This ensures the focus indicator matches the user's chosen "vibe" while maintaining accessibility.
