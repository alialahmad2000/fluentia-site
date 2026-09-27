import { createContext, useContext } from "react";

/**
 * What every leg needs from the page: the tier's config (null until known),
 * the motion stack once loaded ({ gsap, ScrollTrigger, SplitText } or null —
 * it stays null on the low tier), and whether the intro has finished.
 */
export const JourneyContext = createContext({ cfg: null, fx: null, introDone: false, dropToLow: () => {} });
export const useJourney = () => useContext(JourneyContext);
