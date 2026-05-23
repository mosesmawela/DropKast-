## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-23 - [Component Allocation Hoisting]
**Learning:** In a large application, the most frequently used UI components (like `ScrollReveal` used ~68 times here) are high-leverage targets for hoisting. Recreating static configuration objects, transition curves, and variants on every render for these components causes cumulative GC pressure that can impact frame consistency during scroll or transitions.
**Action:** Identify high-usage components (via `grep`) and hoist all static configuration objects outside the component body. Use Framer Motion's `custom` prop to handle any dynamic parts within those static variant definitions.
