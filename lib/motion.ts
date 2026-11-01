// The ONLY spring + timing config in the app. Import everywhere; never inline new ones.
export const SPRING = { stiffness: 170, damping: 22, mass: 1 } as const;
export const DURATION_MS = 400;
export const EASE = [0.22, 1, 0.36, 1] as const;
