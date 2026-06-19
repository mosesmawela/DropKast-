## 2025-04-29 - [High-frequency Event Optimization]
**Learning:** Using React state (useState) for high-frequency events like `mousemove` triggers full component re-renders and reconciliation on every event (often ~60fps). This causes high CPU usage and can lead to jank in complex components.
**Action:** Replace `useState` with Framer Motion's `useMotionValue` and `useSpring`. These values update the DOM directly via Framer Motion's internal loop, bypassing React's reconciliation cycle entirely. Combine with the `style` prop instead of `animate` for the most efficient path.

## 2026-06-19 - [React.memo and Immutability in Arrays]
**Learning:** When updating complex state in arrays (e.g., chat history), ensure strict immutability by cloning the specific object being modified within the functional state updater. Simply spreading the array (`[...h]`) but mutating the object (`copy[last] = ...`) can lead to `React.memo` failing to skip renders if the reference isn't properly broken and re-established for the updated item.
**Action:** Always return a new array and a new object for the specific item being updated in state loops to ensure memoization works as intended.
