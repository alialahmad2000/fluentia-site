import { createContext, useContext } from "react";

/**
 * Which backdrop this render of the V5 landing uses. Its own module, not an
 * export of V5Landing, because V5Landing imports V5Hero and V5Hero reads this.
 *
 *   false    the live homepage — the flat 2D stage, untouched
 *   "band"   /cine  · the 3D stage; the film moves the HORIZON under the
 *            existing layout, which keeps the showcase card in the first screen
 *   "film"   /cine2 · the film owns the frame. The copy compacts to the top
 *            half and the showcase card moves below the hero, because a film
 *            needs the frame and this hero's card and copy column already
 *            own it — measured: at full bleed under the old layout the ghost
 *            CTA failed 4.5:1 on 75.66% of its pixels.
 */
export const CinemaContext = createContext(false);

export const useCinema = () => useContext(CinemaContext);
