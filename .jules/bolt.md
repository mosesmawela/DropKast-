## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.
## 2025-04-29 - [Continuous Animation Loop Optimization]
**Learning:** Manual `requestAnimationFrame` loops updating React state cause unnecessary reconciliation of the entire component tree on every frame. This is a common performance anti-pattern in complex 3D or layout-heavy components.
**Action:** Use Framer Motion's `useMotionValue` for the animation state and `useAnimationFrame` for the loop. Derive child properties using `useTransform` in `memo`-wrapped components. This pattern reduces React re-renders from 60/sec to near-zero, significantly lowering CPU and battery usage.
