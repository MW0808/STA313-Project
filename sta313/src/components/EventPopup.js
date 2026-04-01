import { useState } from "react";
import "./EventPopup.css";
const TAG_CLASS = {
  "Festival":          "eventTag-festival",
  "Parade":            "eventTag-parade",
  "Art Walk":          "eventTag-art-walk",
  "Food & Beverage":   "eventTag-food-beverage",
  "Free Entry":        "eventTag-free-entry",
  "Parking Available": "eventTag-parking",
};

function staticMapUrl(lat, lng) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=340x150&scale=2&markers=color:red%7C${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`;
}
 
function Tag({ label }) {
  const modifier = TAG_CLASS[label] ?? "eventTag-default";
  return (
    <span className={`eventTag ${modifier}`}>
      {label}
    </span>
  );
}
 
function PhotoPanel({ src, alt }) {
  const [errored, setErrored] = useState(false);
 
  if (errored) {
    return (
      <div className="eventPhoto-fallback">
        <span>📷</span>
      </div>
    );
  }
 
  return <img src={src} alt={alt} onError={() => setErrored(true)} />;
}
 
function MapPanel({ lat, lng, address }) {
  const [errored, setErrored] = useState(false);
 
  if (errored) {
    return (
      <div className="eventMap-fallback">
        <span>{address}</span>
      </div>
    );
  }
 
  return (
    <img
      src={staticMapUrl(lat, lng)}
      alt={`Map showing ${address}`}
      onError={() => setErrored(true)}
    />
  );
}

export function EventPopup({ event, onClose }) {
  return (
    <div
      className="backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="content"
        role="dialog"
        aria-modal="true"
        aria-label={event.name}
      >
        <button
          className="closeButton"
          onClick={onClose}
          aria-label="Close event popup"
        >
          ✕
        </button>
 
        <div className="grid">
 
          {/* left column: event photo & map */}
          <div className="popupVisuals">
            <div className="eventPhoto">
              <PhotoPanel src={event.photoUrl} alt={`${event.name} event photo`} />
            </div>
            <div className="EventMap">
              <MapPanel lat={event.lat} lng={event.lng} address={event.address} />
            </div>
          </div>
 
          {/* Right column: info */}
          <div className="eventInfo">

            <div>
              <h2 className="eventTitle">{event.name}</h2>
              <p className="eventDatetime">{event.date} · {event.time}</p>
            </div>
 
            <div className="eventTags">
              {event.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>

            <div className="eventInfoSection">
              <p className="eventInfoSectionLabel">About this event</p>
              <p className="eventInfoDescription">{event.description}</p>
            </div>
 
            <div className="eventAddressSection">
              <p className="eventAddressSectionLabel">Location</p>
              <p className="eventAddress">{event.address}</p>
            </div>
 
          </div>
        </div>
      </div>
    </div>
  );
}
export default EventPopup;