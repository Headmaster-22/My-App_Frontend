// TMDb movie objects use `title` / `original_title` / `release_date`.
// TMDb TV objects use `name` / `original_name` / `first_air_date`.
// These helpers let every component treat "media" generically.

export const getMediaTitle = (item) =>
  item?.title || item?.name || item?.original_title || item?.original_name || "Untitled";

export const getMediaDate = (item) =>
  item?.release_date || item?.first_air_date || null;

export const getMediaYear = (item) => {
  const date = getMediaDate(item);
  return date ? date.slice(0, 4) : "—";
};

// mediaType is 'movie' or 'tv' - callers pass it explicitly since a bare
// TMDb object doesn't always self-identify (list/discover results don't
// include media_type, only /search/multi results do).
export const playerPath = (item, mediaType) => `/player/${mediaType}/${item.id}`;

// For /search/multi results, which DO include media_type on each item.
export const isPlayableMedia = (item) =>
  item?.media_type === "movie" || item?.media_type === "tv";

// TV uses its own genre ids - these do NOT line up with movie genre ids
// (movie Action is 28; TV's closest equivalent, Action & Adventure, is 10759)
export const TV_GENRES = [
  { title: "Action & Adventure", id: 10759 },
  { title: "Sci-Fi & Fantasy", id: 10765 },
  { title: "Drama", id: 18 },
  { title: "Comedy", id: 35 },
];

export const MOVIE_GENRES = [
  { title: "Action", id: 28 },
  { title: "Comedy", id: 35 },
  { title: "Horror", id: 27 },
];

// A unique key for anything keyed by "this specific title" - a movie and a
// TV show can share the same numeric TMDb id, so plain `id` isn't safe.
export const mediaKey = (mediaType, id) => `${mediaType}_${id}`;
