## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-06-09 - [Continuous Animation Loop Optimization]
**Learning:** Driving continuous 3D rotations or loops using React state (useState) + requestAnimationFrame causes 60fps re-renders of the entire component tree, which is extremely expensive for complex 3D scenes.
**Action:** Use Framer Motion's `useAnimationFrame` in combination with `useMotionValue`. Deriving visual properties via `useTransform` allows the animation to run entirely outside of React's render cycle. Use `useMotionValueEvent` to selectively sync back to React state only when high-level UI changes (like pagination dots) are required.
