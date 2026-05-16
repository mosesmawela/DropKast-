## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2025-05-14 - [React Reconciliation Bypass for 3D Animations]
**Learning:** For components with continuous frame-based animations (like a 3D carousel), using `useState` to drive the rotation angle causes the entire component tree to undergo React's reconciliation every frame (60fps). This is highly inefficient even if the actual DOM changes are minimal.
**Action:** Use Framer Motion's `useMotionValue` combined with `useAnimationFrame` to update values directly. Use `useTransform` to map these values to CSS properties. If React state is still needed for UI (like pagination dots), use `useMotionValueEvent` to synchronize them at a lower frequency (only when the active index actually changes), effectively decoupling the smooth animation loop from the heavier React render cycle.
