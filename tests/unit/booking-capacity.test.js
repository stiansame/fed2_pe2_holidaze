import { expect, test, vi } from "vitest";
import { createBooking, updateBooking } from "../../src/api/bookings.js";
import { getVenue } from "../../src/api/venues.js";
import { messages } from "../../src/constants/messages.js";

vi.mock("../../src/api/venues.js", () => ({
  getVenue: vi.fn(),
  clearVenueCache: vi.fn(),
}));

for (const editing of [false, true]) {
  test(`${editing ? "updating" : "creating"} a booking rechecks guest capacity before sending`, async () => {
    const stay = { from: "2099-06-10", to: "2099-06-12", guests: 4 };
    const original = {
      id: "booking",
      dateFrom: stay.from,
      dateTo: stay.to,
      guests: 2,
      customer: { name: "test" },
      venue: { id: "venue" },
    };
    const request = vi.fn(async () => ({ data: original }));
    getVenue.mockResolvedValue({
      data: { id: "venue", maxGuests: 3, price: 1500, bookings: [] },
    });
    const save = (selection) => editing
      ? updateBooking(request, "booking", "test", selection, 1500)
      : createBooking(request, "venue", selection, 1500);

    for (const guests of ["", 0, -1, 1.5, 4])
      await expect(save({ ...stay, guests })).rejects.toThrow(
        messages.guestCountRange(1, 3),
      );
    expect(request.mock.calls.filter(([, options]) =>
      ["POST", "PUT"].includes(options?.method),
    )).toEqual([]);

    for (const guests of [1, 3]) {
      await save({ ...stay, guests });
      expect(request).toHaveBeenLastCalledWith(
        editing ? "holidaze/bookings/booking" : "holidaze/bookings",
        expect.objectContaining({
          method: editing ? "PUT" : "POST",
          body: expect.objectContaining({ guests }),
        }),
      );
    }
  });
}
