import { loadBookings, saveBookings } from "../storage/bookingStorage";
import { describe, test, expect, vi, afterEach } from "vitest";
import type { Booking } from "../models/booking";

describe("loadBookings", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  test("returns success with an empty bookings list", () => {
    const getItem = vi.fn().mockReturnValue(null);
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: true,
      bookings: [],
    });
    expect(getItem).toHaveBeenCalledWith("slotledger.bookings");
  });
  test("returns bookings from valid stored data", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 12,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: true,
      bookings: bookings,
    });
  });
  test("returns an error for malformed JSON", () => {
    const getItem = vi.fn().mockReturnValue("{broken");
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns an error when stored JSON is not an array", () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify({}));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns an error when stored array contains null", () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify([null]));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns an error when stored array contains a number", () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify([123]));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns an error when a stored booking is missing createdAt", () => {
    const bookings = [
      {
        id: 1,
        roomId: 12,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns an error when a stored booking has a non-numeric roomId", () => {
    const bookings = [
      {
        id: 1,
        roomId: "12",
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns an error when stored array contains valid and invalid bookings", () => {
    const bookings = [
      {
        id: 1,
        roomId: 12,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 2,
        roomId: "12",
        userId: 2,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T09:00:00Z",
      },
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("returns success when stored array is empty", () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify([]));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: true,
      bookings: [],
    });
  });
  test("does not modify stored data when JSON is malformed", () => {
    const getItem = vi.fn().mockReturnValue("{broken");
    const setItem = vi.fn();
    const removeItem = vi.fn();
    const clear = vi.fn();
    vi.stubGlobal("localStorage", { getItem, setItem, removeItem, clear });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });
  test("does not modify stored data when its structure is invalid", () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify([null]));
    const setItem = vi.fn();
    const removeItem = vi.fn();
    const clear = vi.fn();
    vi.stubGlobal("localStorage", { getItem, setItem, removeItem, clear });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });
  test("returns STORAGE_READ_ERROR when reading storage throws", () => {
    const getItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage access denied");
    });
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "STORAGE_READ_ERROR",
    });
  });
  test("rejects a booking with an invalid date format (February 30th)", () => {
    const bookings = [
      {
        id: 1,
        roomId: 12,
        userId: 1,
        date: "2026-02-30",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
    const setItem = vi.fn();
    const removeItem = vi.fn();
    const clear = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem,
      setItem,
      removeItem,
      clear,
    });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });
  test.each(["9:00", "10:0", "10:00:00"])(
    "rejects a booking with an invalid hour format",
    (invalidStartTime) => {
      const bookings = [
        {
          id: 1,
          roomId: 12,
          userId: 1,
          date: "2024-06-01",
          startTime: invalidStartTime,
          endTime: "10:00",
          createdAt: "2024-06-01T08:00:00Z",
        },
      ];
      const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
      vi.stubGlobal("localStorage", { getItem });
      expect(loadBookings()).toEqual({
        success: false,
        error: "INVALID_STORED_DATA",
      });
    },
  );
  test("rejects an end time before the start time", () => {
    const bookings = [
      {
        id: 1,
        roomId: 12,
        userId: 1,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "09:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const getItem = vi.fn().mockReturnValue(JSON.stringify(bookings));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects booking id %s",
    (invalidId) => {
      const booking: Booking = {
        id: invalidId,
        roomId: 12,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      };
      const getItem = vi.fn().mockReturnValue(JSON.stringify([booking]));
      vi.stubGlobal("localStorage", { getItem });
      expect(loadBookings()).toEqual({
        success: false,
        error: "INVALID_STORED_DATA",
      });
    },
  );
  test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects room id %s",
    (invalidId) => {
      const booking: Booking = {
        id: 1,
        roomId: invalidId,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      };
      const getItem = vi.fn().mockReturnValue(JSON.stringify([booking]));
      vi.stubGlobal("localStorage", { getItem });
      expect(loadBookings()).toEqual({
        success: false,
        error: "INVALID_STORED_DATA",
      });
    },
  );
  test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects user id %s",
    (invalidId) => {
      const booking: Booking = {
        id: 1,
        roomId: 12,
        userId: invalidId,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      };
      const getItem = vi.fn().mockReturnValue(JSON.stringify([booking]));
      vi.stubGlobal("localStorage", { getItem });
      expect(loadBookings()).toEqual({
        success: false,
        error: "INVALID_STORED_DATA",
      });
    },
  );
  test("rejects duplicate booking ids", () => {
    const booking1: Booking = {
      id: 1,
      roomId: 12,
      userId: 1,
      date: "2024-06-01",
      startTime: "09:00",
      endTime: "10:00",
      createdAt: "2024-06-01T08:00:00Z",
    };
    const booking2: Booking = {
      id: 1,
      roomId: 13,
      userId: 2,
      date: "2024-06-01",
      startTime: "10:00",
      endTime: "11:00",
      createdAt: "2024-06-01T08:00:00Z",
    };
    const getItem = vi
      .fn()
      .mockReturnValue(JSON.stringify([booking1, booking2]));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: false,
      error: "INVALID_STORED_DATA",
    });
  });
  test("accepts a booking with different ids but the same roomId and userId", () => {
    const booking1: Booking = {
      id: 1,
      roomId: 12,
      userId: 1,
      date: "2024-06-01",
      startTime: "09:00",
      endTime: "10:00",
      createdAt: "2024-06-01T08:00:00Z",
    };
    const booking2: Booking = {
      id: 2,
      roomId: 12,
      userId: 1,
      date: "2024-06-01",
      startTime: "10:00",
      endTime: "11:00",
      createdAt: "2024-06-01T08:00:00Z",
    };
    const getItem = vi
      .fn()
      .mockReturnValue(JSON.stringify([booking1, booking2]));
    vi.stubGlobal("localStorage", { getItem });
    expect(loadBookings()).toEqual({
      success: true,
      bookings: [booking1, booking2],
    });
  });
});

describe("saveBookings", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  test("saves bookings as JSON and returns success", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 12,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 2,
        roomId: 12,
        userId: 2,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });
    expect(saveBookings(bookings)).toEqual({
      success: true,
    });
    expect(setItem).toHaveBeenCalledWith(
      "slotledger.bookings",
      JSON.stringify(bookings),
    );
  });
  test("returns STORAGE_WRITE_ERROR when writing storage throws", () => {
    const setItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage access denied");
    });
    vi.stubGlobal("localStorage", { setItem });
    expect(saveBookings([])).toEqual({
      success: false,
      error: "STORAGE_WRITE_ERROR",
    });
  });
  test("saves an empty bookings array", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });
    expect(saveBookings([])).toEqual({
      success: true,
    });
    expect(setItem).toHaveBeenCalledWith(
      "slotledger.bookings",
      JSON.stringify([]),
    );
  });
});
