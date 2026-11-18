const venueLists = ["venues", "lists"];
const bookingLists = ["bookings", "lists"];
const hostProfiles = ["profiles", "public"];

/** Shared prefixes and account-specific keys for API reads. */
export const queryKeys = {
  venueLists,
  bookingLists,
  hostProfiles,
  venueList: (related) => [...venueLists, "public", related],
  managerVenues: (name) => [...venueLists, "manager", name],
  venue: (id) => ["venues", "detail", id],
  ownVenue: (name, id) => ["venues", "edit", name, id],
  profileBookings: (name) => [...bookingLists, name],
  ownBooking: (name, id) => ["bookings", "customer", name, id],
  editableBooking: (name, id) => ["bookings", "edit", name, id],
  venueBooking: (name, id) => ["bookings", "manager", name, id],
  ownProfile: (name) => ["profiles", "own", name],
  hostProfile: (viewer, name) => [...hostProfiles, viewer, name],
};
