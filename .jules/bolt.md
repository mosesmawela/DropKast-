## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-07-01 - [Component API and Animation Optimization]
**Learning:** Including `key` in a component's prop interface is an anti-pattern as it's a reserved React prop and isn't passed to the component body. For high-usage animation components (like ScrollReveal, used ~70 times), even small object allocations like transition configs or variant objects add up to significant GC pressure.
**Action:** Omit `key` from custom interfaces. Hoist all possible configuration objects outside the component. Use Framer Motion's `custom` prop to pass dynamic parameters to these hoisted variants, and combine with `React.memo` to ensure stable references across re-renders.
