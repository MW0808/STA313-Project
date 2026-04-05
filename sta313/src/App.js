import "./App.css";
import { useState } from "react";
import { adaptEvent } from "./components/eventpopup/adapter";
import LandingPage from "./components/LandingPage";
import HistogramPage from "./components/HistogramPage";
import FirstScroll from "./components/FirstScroll";
import SecondScroll from "./components/SecondScroll";
import ThirdScroll from "./components/ThirdScroll";
import FourthScroll from "./components/FourthScroll";
import FifthScroll from "./components/FifthScroll";
import SixthScroll from "./components/SixthScroll";
import EventPopup from "./components/eventpopup/EventPopup";

const DEMO_EVENT = {
     "event_name": "Big Smoke Brass",
    "event_description": "Born on the streets of Toronto in 2017, Big Smoke Brass is a leading voice in the Canadian Brass landscape. \n\nWith hundreds of performances under their belt, the band is equally comfortable on the streets, in clubs, at events, at festivals, or on the road. \n\nTheir polished, high-energy sound is unmistakable and has captivated audiences all over, leading to numerous web and television appearances, shows alongside international artists, and a growing discography of original music and videos. \n\nThe band maintains a busy performance schedule throughout the year, all while endeavoring to spread positivity and foster community with their listeners and the next generation of musicians.",
    "event_category": [
      ["Live Performances"],
      ["Music"],
      ["Nightlife"]
    ],
    "event_startdate": "2025-11-29T23:30:00-05:00",
    "accessible_event": "Yes",
    "calendar_time_of_day": "Night Event",
    "event_features": [
      ["Paid Parking"],
      ["On-site Food and Beverages"],
      ["Ages 19+"]
    ],
    "free_event": "No",
    "location_name": "DROM Taberna",
    "event_address": "458 Queen St W, Toronto, ON, M5V 2A8",
    "latitude": 43.6483,
    "longitude": -79.3996,
    "event_image": [
      {
        "bin_id": "Oex05FDifs52YyltLCBRsA",
        "fields": {
          "alt": "The band plays on a dark stage, with the cheering crowd at their feet.",
          "credit": ""
        },
        "file_name": "e1a35b04-0892-4079-88e6-b9073d04b60b-2025_11_19-e1a35b04-0892-4079-88e6-b9073d04b60b-2025_11_10-Big_Smoke_Brass_for_Drom___jbissssr_93_-2353f730-1ec1-4571-9330-099ccb1f2949-c8bb6ba8-4572-4965-8c3b-accf5876d168.jpg",
        "name": "e1a35b04-0892-4079-88e6-b9073d04b60b-2025_11_10-Big_Smoke_Brass_for_Drom___jbissssr_93_-2353f730-1ec1-4571-9330-099ccb1f2949.jpg",
        "size": 1133718,
        "status": "success",
        "type": "image/jpeg",
        "uploadDate": "2025-11-19T10:12:24.438-05:00"
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