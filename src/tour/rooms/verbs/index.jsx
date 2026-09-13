import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";

// Placeholder — the verbs room is built on branch tour/verbs.
export default function Room() {
  return (
    <>
      <TourBar slug="verbs" />
      <RoomIntro slug="verbs" />
      <main style={{ minHeight: "40vh" }} />
      <TourEnd slug="verbs" />
    </>
  );
}
