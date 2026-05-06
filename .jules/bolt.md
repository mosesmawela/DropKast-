## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-15 - [Hoisting Static Motion Configs]
**Learning:** High-frequency UI components (like `ScrollReveal`, used 60+ times) that define motion variants or transition objects inside the component body cause redundant object allocations and increased garbage collection (GC) pressure on every render/re-render of parents.
**Action:** Hoist static configuration objects (`variants`, `transition` curves, `viewport` settings) outside the component. Use the `custom` prop to pass dynamic data (like `direction`) to functional variants. This stabilizes references and improves performance in apps with heavy animation usage.
