import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";

// Placeholder — the unit room is built on branch tour/unit.
export default function Room() {
  return (
    <>
      <TourBar slug="unit" />
      <RoomIntro slug="unit" />
      <main style={{ minHeight: "40vh" }} />
      <TourEnd slug="unit" />
    </>
  );
}
