## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-06-23 - [3D Animation Loop Optimization]
**Learning:** Manual `requestAnimationFrame` loops updating React state for 3D CSS transforms (e.g., `rotateY`) cause full re-renders of the component tree every frame. While `useTransform` is efficient for scroll-linked animations, time-based loops should use Framer Motion's `useAnimationFrame` combined with `useMotionValue` to maintain near-zero re-render frequency.
**Action:** Replace `useState` and `useEffect` with `useMotionValue` and `useAnimationFrame`. Derive child visual properties (scale, opacity) using `useTransform` within memoized sub-components to ensure the main reconciliation loop is bypassed.
