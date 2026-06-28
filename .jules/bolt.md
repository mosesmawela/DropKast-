## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-04-29 - [High-usage Component Optimization]
**Learning:** Components used extensively across the app (like ScrollReveal, ~69 times) can significantly contribute to memory churn and re-render cascades. Re-creating animation variant and transition objects on every render cycle for dozens of instances creates unnecessary pressure on the garbage collector.
**Action:** Hoist static animation configurations (variants, viewport, base transitions) outside the component body. Use Framer Motion's 'custom' prop to pass dynamic data to static variants. Apply React.memo to prevent unnecessary re-renders when parent state changes. Ensure reserved props like 'key' are not included in the component's own interface to avoid reconciliation issues.
