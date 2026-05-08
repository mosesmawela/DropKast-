## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-05-08 - [Static Hoisting in High-Frequency Components]
**Learning:** In components used dozens of times (like ScrollReveal), recreating motion variant objects and transition arrays on every render significantly increases GC pressure and reconciliation work. Hoisting these to constants outside the component body is a high-leverage optimization.
**Action:** Always identify static configuration objects in Framer Motion components. Use functional variants + the 'custom' prop to handle dynamic properties within those static constants.
