import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";

// Placeholder — the library room is built on branch tour/library.
export default function Room() {
  return (
    <>
      <TourBar slug="library" />
      <RoomIntro slug="library" />
      <main style={{ minHeight: "40vh" }} />
      <TourEnd slug="library" />
    </>
  );
}
