## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-05-11 - [Hoisting Static Animation Configs]
**Learning:** For components used frequently across the app (like ScrollReveal), recreating animation variant objects and transition arrays on every render leads to unnecessary memory pressure and GC churn. Even if the objects look the same, they are new references.
**Action:** Hoist all static configuration (directions, variants, viewport settings, easing curves) outside the component. Use Framer Motion's `custom` prop to pass dynamic data (like animation direction) into functional variants, allowing the variant container itself to remain static and hoisted.
