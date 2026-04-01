import "./App.css";
import { useState } from "react";

import LandingPage from "./components/LandingPage";
import HistogramPage from "./components/HistogramPage";
import FirstScroll from "./components/FirstScroll";
import SecondScroll from "./components/SecondScroll";
import ThirdScroll from "./components/ThirdScroll";
import FourthScroll from "./components/FourthScroll";
import FifthScroll from "./components/FifthScroll";
import SixthScroll from "./components/SixthScroll";
import EventPopup from "./components/EventPopup";

const DEMO_EVENT = {
  id: "taste-of-asia-2025",
  name: "Taste of Asia 2025",
  date: "Sat–Sun, Mar 28–29",
  time: "11 AM – 11 PM",
  description:
    "A two-day celebration of Asian flavours, culture, and community. Featuring local vendors, live performances, and a cooking showcase hosted by Fred Cheng. Open to all ages.",
  address: "955 Lake Shore Blvd W, Etobicoke, ON",
  photoUrl: "https://via.placeholder.com/340x190/9FE1CB/085041?text=Event+Photo",
  lat: 43.6345,
  lng: -79.4776,
  tags: ["Festival", "Food & Beverage", "Free Entry", "Parking Available"],
};

function App() {
  const [open, setOpen] = useState(true);
  return (
    <div className="app">
      <LandingPage />
      <HistogramPage />
      <FirstScroll />
      <SecondScroll />
      <ThirdScroll />
      <FourthScroll />
      <FifthScroll />
      <SixthScroll />
      <div style={{ minHeight: "100vh", background: "#d0cdc6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#085041", color: "#fff", cursor: "pointer", fontSize: 14 }}>
          Open event popup
        </button>
      )}
      {open && <EventPopup event={DEMO_EVENT} onClose={() => setOpen(false)} />}
    </div>
    </div>
  );
}

export default App;