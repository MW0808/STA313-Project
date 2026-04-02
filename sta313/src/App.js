import "./App.css";
import { useState } from "react";
import { adaptEvent } from "./components/adapter";
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
    "event_name": "Lady Marge",
    "event_description": "A six-piece, Toronto-based band blending folk-rock and blues. \n\nGrounded by heartfelt storytelling, their live shows are known for their energy and playfulness. On the heels of their debut album release this past August, Lady Marge can't wait to play here for the first time!",
    "event_category": [
      ["Cultural"],
      ["Live Performances"],
      ["Music"]
    ],
    "event_startdate": "2025-11-29T18:00:00-05:00",
    "accessible_event": "Yes",
    "calendar_time_of_day": "Night Event",
    "event_features": [
      ["Paid Parking"],
      ["On-site Food and Beverages"]
    ],
    "free_event": "Yes",
    "location_name": "DROM Taberna",
    "event_address": "458 Queen St W, Toronto, ON, M5V 2A8",
    "latitude": 43.6483,
    "longitude": -79.3996,
    "event_image": [
      {
        "bin_id": "1z1TDeLvrq_JeAYqgIBJuQ",
        "fields": {
          "alt": "The six-piece band rehearses in a living room. ",
          "credit": ""
        },
        "file_name": "e1a35b04-0892-4079-88e6-b9073d04b60b-2025_11_10-Lady_Marge_-102106ed-1992-4e9c-87e8-d91c0f6dcb90.jpg",
        "name": "Lady+Marge+.jpg",
        "size": 302683,
        "status": "success",
        "type": "image/jpeg",
        "uploadDate": "2025-11-10T13:45:14.017-05:00"
      }
    ]
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
      {open && <EventPopup event={adaptEvent(DEMO_EVENT)} onClose={() => setOpen(false)} />}
    </div>
    </div>
  );
}

export default App;