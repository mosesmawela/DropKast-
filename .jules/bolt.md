## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-04-30 - [Animation Loop Optimization]
**Learning:** driving animations with `requestAnimationFrame` and `useState` in React causes full component re-renders on every frame (60fps). For complex 3D components like `ArtistCarousel3D`, this creates significant CPU pressure.
**Action:** Use Framer Motion's `useMotionValue` and `useAnimationFrame` to manage the animation state outside of React's reconciliation cycle. Use `useTransform` to derive child properties (scale, opacity, etc.) from the `MotionValue` to keep the entire animation hardware-accelerated and render-free.
