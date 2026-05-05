## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-05-05 - [Hoisting Static Configuration in High-frequency Components]
**Learning:** Components like `ScrollReveal` that are used many times (~68) across the app can cause significant memory churn if they define complex configuration objects (like Framer Motion variants, directions, and transition settings) inside the component body, as these are re-allocated on every render.
**Action:** Hoist static configuration objects outside the component body. For dynamic values (like `direction`), use Framer Motion's `custom` prop to pass them into functional variants. This ensures objects are allocated once, reducing GC pressure and improving overall app smoothness.
