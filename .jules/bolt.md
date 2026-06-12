## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-15 - [Component Hoisting Strategy]
**Learning:** Components used extensively throughout the application (e.g., ScrollReveal with 60+ instances) are critical paths where small per-render allocations aggregate into significant GC pressure.
**Action:** Always hoist motion variants, transition objects, and viewport configs outside the component body. Use the 'custom' prop in Framer Motion to pass dynamic properties into functional variants, maintaining the performance benefits of static variant objects while allowing component-level customization.
