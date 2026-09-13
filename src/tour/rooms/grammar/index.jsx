import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";

// Placeholder — the grammar room is built on branch tour/grammar.
export default function Room() {
  return (
    <>
      <TourBar slug="grammar" />
      <RoomIntro slug="grammar" />
      <main style={{ minHeight: "40vh" }} />
      <TourEnd slug="grammar" />
    </>
  );
}
