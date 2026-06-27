## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-06-27 - [High-Frequency Wrapper Optimization]
**Learning:** Wrapper components used extensively (e.g., `ScrollReveal` used ~70 times) cause significant memory churn and GC pressure when they re-allocate static configuration objects (variants, directions, transitions) on every render cycle.
**Action:** Hoist all static configuration objects outside the component. Use Framer Motion's `custom` prop to pass dynamic parameters to variants without breaking the hoisting. Wrap the entire component in `React.memo` to skip re-renders when children or static props don't change.
