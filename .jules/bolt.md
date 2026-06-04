## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-06-04 - [Framer Motion Variant Optimization]
**Learning:** Hoisting variants reduces object allocations, but passing an object literal to the `custom` prop (e.g., `custom={{ i }}`) on every render re-introduces allocations in the render loop. Additionally, when switching to variants, explicit `transition` properties in `animate` or `exit` states are required if the component-level `transition` prop is removed, or they will default to Framer's default spring.
**Action:** Include all necessary animation metadata (like indices) in the data structure itself (e.g., the token object) and pass the stable object reference to `custom`. Ensure `exit` variants also utilize `custom` for staggered exits.
