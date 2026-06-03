## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-06-03 - [Optimizing High-frequency List Updates]
**Learning:** In chat interfaces with AI streaming, updating the message history state on every token triggers a full reconciliation of the entire message list. If previous message objects are recreated (e.g., via spread operator on the whole array), React.memo cannot skip their re-renders, leading to O(N) performance degradation.
**Action:** Use functional state updates that only clone the specific item being updated while preserving references for all other items. Combine with memoized child components to ensure O(1) rendering performance per streaming token.
