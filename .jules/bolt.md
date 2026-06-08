## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-01 - [60fps Animation Optimization]
**Learning:** Using `useState` and manual `requestAnimationFrame` for continuous UI updates (like a rotating 3D carousel) forces React to re-render the component tree at the animation's frame rate. This creates massive CPU overhead and defeats memoization.
**Action:** Use Framer Motion's `useMotionValue` and `useAnimationFrame` to drive the animation. Pass motion values to child components and use `useTransform` to derive visual properties. This allows the animation loop to bypass React's reconciliation cycle entirely. Use `useMotionValueEvent` for low-frequency state updates (like active index) derived from the animation.
