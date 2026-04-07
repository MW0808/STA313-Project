/**
 * Maps a raw dataset event object to the shape EventPopup expects.
 */
const CATEGORY_PLACEHOLDER = {
  "Arts/Exhibits":"https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600",
  "Music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  "Live Performances": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
  "Cultural": "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600",
  "Food & Beverage":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
  "Festival": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
  "Parade": "https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=600",
  "Sports":"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  "Other": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"
};

const FALLBACK_PHOTO = CATEGORY_PLACEHOLDER["Other"];

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
  const firstImage = raw.event_image?.[0];
  const firstCategory = (raw.event_category ?? []).flat()[0];
  const photoUrl = CATEGORY_PLACEHOLDER[firstCategory] ?? FALLBACK_PHOTO;
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