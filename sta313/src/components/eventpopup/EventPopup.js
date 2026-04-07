import { useState } from "react";
import "./EventPopup.css";

const TAG_CLASS = {
  "Festival":           "eventTag-festival",
  "Parade":             "eventTag-parade",
  "Art Walk":           "eventTag-art-walk",
  "Food & Beverage":    "eventTag-food-beverage",
  "Arts/Exhibits":      "eventTag-arts",
  "Cultural":           "eventTag-cultural",
  "Live Performances":  "eventTag-live",
  "Music":              "eventTag-music",
  "Free Entry":         "eventTag-free-entry",
  "Accessible":         "eventTag-accessible",
  "Parking Available":  "eventTag-parking",
};

function staticMapUrl(lat, lng) {
  // Use a template string to inject your coordinates and API key
  const apiKey = "AIzaSyC7MzblAavHUNjBFfgjlnQvxY2w5ireV08";
  const size = "340x150";
  const zoom = 15;
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&scale=2&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
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
        <span>{alt}</span>
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
 
          {/* event photo & map */}
          <div className="popupVisuals">
            <div className="eventPhoto">
              <PhotoPanel 
                category ={event.primary_category}
                src={event.photoUrl} 
                alt={event.photoAlt || `${event.name} - ${event.location}`} 
              />
            </div>
            <div className="eventMap">
              <MapPanel lat={event.lat} lng={event.lng} address={event.address} />
            </div>
          </div>
 
          {/* event info */}
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