import { createContext, useContext } from "react";

/**
 * Whether this render of the V5 landing uses the 3D cinematic hero backdrop
 * (V5Cinema) instead of the flat 2D stage. Its own module, not V5Landing's
 * export, because V5Landing imports V5Hero and V5Hero reads this.
 *
 * `/` is false while the backdrop is a candidate; `/cine` is true.
 */
export const CinemaContext = createContext(false);

export const useCinema = () => useContext(CinemaContext);
