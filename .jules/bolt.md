## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-02 - [Static Object Hoisting in High-Usage Components]
**Learning:** In components used extensively across the app (like `ScrollReveal` used ~68 times), defining static configuration objects (directions, variants, easing curves) inside the component body leads to massive redundant object allocations and increased GC pressure.
**Action:** Hoist all static configurations outside the component body. Use Framer Motion's `custom` prop to pass dynamic values (like `direction`) into the hoisted variants.
