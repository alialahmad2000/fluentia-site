/**
 * Geometry one leg publishes for the next (so the voice can hand over exactly).
 *   firstMic: { x, fromBottom }  the DOM phone's mic when «أول كلمة» comes to rest:
 *             x in px, and its distance above the bottom of that leg's stage
 *   boothEnd: { x, y }           where the live line leaves the booth (section coords)
 */
export const shared = {
  firstMic: { x: 0, fromBottom: 150 },
  boothEnd: { x: 0, y: 0 },
  fallDone: false, // the fall still owns the voice until its line reaches both edges
};
