## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-06-06 - [Static Animation Configuration Hoisting]
**Learning:** React components that use Framer Motion often recreate 'variants', 'transition', and 'viewport' objects on every render. For high-frequency components (like ScrollReveal, used ~68 times), this leads to significant memory churn.
**Action:** Hoist static animation configurations outside the component body. Use the 'custom' prop to pass dynamic values to variants, ensuring the variant definitions themselves remain static and stable.
