## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-06-11 - [Functional Variants for Animation Parity]
**Learning:** When hoisting static motion variants to handle multiple animation modes (e.g., fade vs blur), using a single static 'visible' object can introduce unintended CSS properties (like `filter: blur(0px)`) to all modes. This can alter rendering paths or break visual tests.
**Action:** Use functional variants for both 'hidden' AND 'visible' states to maintain exact CSS property parity based on the component's props, passing dynamic values via the `custom` prop.
