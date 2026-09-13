import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";

// Placeholder — the expressions room is built on branch tour/expressions.
export default function Room() {
  return (
    <>
      <TourBar slug="expressions" />
      <RoomIntro slug="expressions" />
      <main style={{ minHeight: "40vh" }} />
      <TourEnd slug="expressions" />
    </>
  );
}
