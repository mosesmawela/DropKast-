## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-05-03 - [Static Configuration Hoisting]
**Learning:** Components used frequently (68+ times) can incur significant allocation overhead if configuration objects (variants, directions, eases) are defined inside the component body. This triggers garbage collection pressure and unnecessary object creation on every render.
**Action:** Hoist all static configuration objects outside the component scope. For dynamic values within variants, use Framer Motion's `custom` prop to pass props into functional variants.
