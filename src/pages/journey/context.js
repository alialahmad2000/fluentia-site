import { createContext, useContext } from "react";

/**
 * What every leg reads: the tier config (null only during SSR), the motion
 * stack once loaded ({ gsap, SplitText } or null), whether the intro is over,
 * whether reduced motion is on, and whether WebGL is currently alive.
 */
export const JourneyContext = createContext({ cfg: null, fx: null, introDone: true, reduce: false, glAlive: false });
export const useJourney = () => useContext(JourneyContext);
