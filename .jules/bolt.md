## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-07 - [High-frequency Component Optimization]
**Learning:** For components used widely across the application (e.g., `ScrollReveal` used ~68 times), even small per-render allocations add up. Recreating variants, transition objects, and viewport configs on every render increases garbage collection pressure and can lead to micro-stutters during heavy interaction or scrolling.
**Action:** Hoist static configuration objects (DIRECTIONS, VARIANTS, EASE_CURVE, VIEWPORT_CONFIG) outside the component body. Use the `custom` prop in Framer Motion to pass dynamic properties (like `direction`) to functional variants, keeping the variant definitions static and shared across all instances.
