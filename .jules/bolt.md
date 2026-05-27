## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-27 - [Animation Configuration Hoisting]
**Learning:** React components using Framer Motion often define variants and transition objects inside the component body, causing re-allocation and GC pressure on every render. This is particularly impactful for components used dozens of times (like ScrollReveal).
**Action:** Hoist static animation configurations (variants, transitions, viewport settings) outside the component. Use the `custom` prop to pass dynamic data to functional variants, maintaining the performance benefit of static objects while supporting dynamic behavior.
