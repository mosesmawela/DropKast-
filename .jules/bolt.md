## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-05-14 - [Static Configuration Hoisting]
**Learning:** Components used frequently (60+ times) like `ScrollReveal` can cause significant memory churn and garbage collection pressure if they recreate static configuration objects (variants, transition curves, viewport configs) on every render.
**Action:** Hoist all static objects and arrays outside the component body. Use Framer Motion's `custom` prop to pass dynamic data (like animation direction) to variants, allowing them to remain static while still being data-driven.
