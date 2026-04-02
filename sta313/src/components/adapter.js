/**
 * Maps a raw dataset event object to the shape EventPopup expects.
 */

export function adaptEvent(raw) {
  // --- date & time ---
  const dt = raw.event_startdate ? new Date(raw.event_startdate) : null;
  const date = dt
    ? dt.toLocaleDateString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date TBD";
  const time = dt
    ? dt.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })
    : "";

  // --- photo ---
  // Swap the URL template below for your actual image CDN/endpoint.
  const firstImage = raw.event_image?.[0];
  const photoUrl = firstImage
  ? `https://secure.toronto.ca/webapps/CC/fileAPI/edc_eventcal/${firstImage.file_name}`
  : null;
  const photoAlt = firstImage?.fields?.alt || `${raw.event_name} promotional photo`;
  // --- tags ---
  // Flatten nested arrays from the dataset, then add synthetic tags.
  const categoryTags = (raw.event_category ?? []).flat();
  const featureTags  = (raw.event_features  ?? []).flat().filter((f) => {
    // Only surface features that map to a styled tag; drop the rest.
    return ["Free Parking", "Paid Parking", "Bike Racks"].includes(f);
  });
  const syntheticTags = [
    raw.free_event === "Yes" ? "Free Entry" : null,
    raw.accessible_event === "Yes" ? "Accessible" : null,
  ].filter(Boolean);

  const tags = [...categoryTags, ...syntheticTags, ...featureTags];

  return {
    name:        raw.event_name,
    description: raw.event_description,
    date,
    time,
    lat:         raw.latitude,
    lng:         raw.longitude,
    address:     raw.event_address,
    location:    raw.location_name,
    photoUrl,
    photoAlt,
    tags,
  };
}