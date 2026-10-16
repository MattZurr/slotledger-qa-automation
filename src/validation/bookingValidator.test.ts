import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  canCreateBooking,
  timeValidation,
  roomExists,
  roomOverlap,
  createBooking,
  dateValidation,
} from "./bookingValidator";
import type { User } from "../models/user";
import type { Room } from "../models/room";
import type { Booking } from "../models/booking";

describe("timeValidation", () => {
  test("accepts a valid same-day time range", () => {
    expect(timeValidation("09:00", "17:00")).toBe(true);
  });
  test("rejects an invalid time format", () => {
    expect(timeValidation("9:00", "17:00")).toBe(false);
  });
  test("rejects the same start and end time", () => {
    expect(timeValidation("09:00", "09:00")).toBe(false);
  });
  test("rejects the end time before the start time", () => {
    expect(timeValidation("17:00", "09:00")).toBe(false);
  });
  test("rejects bookings crossing midnight", () => {
    expect(timeValidation("23:00", "01:00")).toBe(false);
  });
  test("accepts a one minute case1", () => {
    expect(timeValidation("00:00", "00:01")).toBe(true);
  });
  test("accepts a one minute case2", () => {
    expect(timeValidation("23:58", "23:59")).toBe(true);
  });
  test("accepts a one-minute booking across an hour boundary", () => {
    expect(timeValidation("09:59", "10:00")).toBe(true);
  });
  test("rejects out-of-range hours", () => {
    expect(timeValidation("24:00", "25:00")).toBe(false);
  });
  test("rejects an out-of-range end hour", () => {
    expect(timeValidation("09:00", "24:00")).toBe(false);
  });
  test("rejects an out-of-range start minute", () => {
    expect(timeValidation("09:60", "11:00")).toBe(false);
  });
  test("rejects an out-of-range end minute", () => {
    expect(timeValidation("09:00", "10:60")).toBe(false);
  });
  test("rejects lack of minutes", () => {
    expect(timeValidation("09:00", "17:0")).toBe(false);
  });
  test("rejects wrong separator", () => {
    expect(timeValidation("09-00", "17:00")).toBe(false);
  });
  test("rejects letters instead of numbers", () => {
    expect(timeValidation("ab:cd", "17:00")).toBe(false);
  });
  test("rejects lack of time", () => {
    expect(timeValidation("", "17:00")).toBe(false);
  });
  test("rejects extra space", () => {
    expect(timeValidation("09:00", "17:00 ")).toBe(false);
  });
});

describe("canCreateBooking", () => {
  test("allows a user with the booker role to create a booking", () => {
    const user: User = { id: 1, name: "Alice", role: "booker" };
    expect(canCreateBooking(user)).toBe(true);
  });
  test("does not allow a user with the viewer role to create a booking", () => {
    const user: User = { id: 2, name: "Bob", role: "viewer" };
    expect(canCreateBooking(user)).toBe(false);
  });
});

describe("roomExists", () => {
  test("returns true if the room exists", () => {
    const rooms: Room[] = [
      { id: 1, name: "Room A", capacity: 10 },
      { id: 2, name: "Room B", capacity: 20 },
    ];
    expect(roomExists(2, rooms)).toBe(true);
  });
  test("returns false if the room does not exist", () => {
    const rooms: Room[] = [
      { id: 1, name: "Room A", capacity: 10 },
      { id: 2, name: "Room B", capacity: 20 },
    ];
    expect(roomExists(3, rooms)).toBe(false);
  });
  test("returns false if the rooms array is empty", () => {
    const rooms: Room[] = [];
    expect(roomExists(1, rooms)).toBe(false);
  });
});

describe("roomOverlap", () => {
  test("returns true if there is an overlapping booking", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("09:30", "10:30", 1, bookings, "2024-06-01")).toBe(true);
  });
  test("returns true if there is an overlapping booking that starts before and ends after the new booking", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("09:30", "10:30", 1, bookings, "2024-06-01")).toBe(true);
  });
  test("returns true if there is an overlapping booking that starts after and ends before the new booking", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:30",
        endTime: "10:30",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("09:00", "11:00", 1, bookings, "2024-06-01")).toBe(true);
  });
  test("returns false if the end time of the new booking is the same as the start time of an existing booking", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("09:00", "10:00", 1, bookings, "2024-06-01")).toBe(
      false,
    );
  });
  test("returns false if the start time of the new booking is the same as the end time of an existing booking", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("10:00", "11:00", 1, bookings, "2024-06-01")).toBe(
      false,
    );
  });
  test("returns false if the bookings are on different dates", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("09:00", "10:00", 1, bookings, "2024-06-02")).toBe(
      false,
    );
  });
  test("returns false if the bookings are for different rooms", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("09:00", "10:00", 2, bookings, "2024-06-01")).toBe(
      false,
    );
  });
  test("returns false if there are no bookings", () => {
    const bookings: Booking[] = [];
    expect(roomOverlap("09:00", "10:00", 1, bookings, "2024-06-01")).toBe(
      false,
    );
  });
  test("returns true for identical time ranges in the same room on the same date", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("10:00", "11:00", 1, bookings, "2024-06-01")).toBe(true);
  });
  test("returns true when only the second existing booking overlaps with the new booking", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 2,
        roomId: 1,
        userId: 2,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("10:30", "11:30", 1, bookings, "2024-06-01")).toBe(true);
  });
  test("returns false when the new bookings are completely before/after existing bookings", () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    expect(roomOverlap("08:00", "09:00", 1, bookings, "2024-06-01")).toBe(
      false,
    );
    expect(roomOverlap("12:00", "13:00", 1, bookings, "2024-06-01")).toBe(
      false,
    );
  });
});

describe("createBooking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("creates a new booking and returns success", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [];
    const input = {
      roomId: 12,
      date: "2024-06-01",
      startTime: "09:00",
      endTime: "10:00",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: true,
      booking: {
        id: 1,
        userId: 7,
        roomId: 12,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00.000Z",
      },
    });
  });
  test("rejects booking creation for a viewer", () => {
    const user: User = { id: 7, name: "Bob", role: "viewer" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [];
    const input = {
      roomId: 12,
      date: "2024-06-01",
      startTime: "09:00",
      endTime: "10:00",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: false,
      error: "NO_PERMISSION",
    });
  });
  test("rejects booking creation when the room does not exist", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [];
    const input = {
      roomId: 99,
      date: "2024-06-01",
      startTime: "09:00",
      endTime: "10:00",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: false,
      error: "ROOM_NOT_FOUND",
    });
  });
  test("rejects booking creation for an invalid time range", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [];
    const input = {
      roomId: 12,
      date: "2024-06-01",
      startTime: "10:00",
      endTime: "09:00",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: false,
      error: "INVALID_TIME",
    });
  });
  test("rejects booking creation when the room is already booked", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
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
    const input = {
      roomId: 12,
      date: "2024-06-01",
      startTime: "09:30",
      endTime: "10:30",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: false,
      error: "ROOM_OVERLAP",
    });
  });
  test("generates an ID above the highest existing ID for an unsorted list", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [
      {
        id: 8,
        roomId: 12,
        userId: 7,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 2,
        roomId: 12,
        userId: 7,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 5,
        roomId: 12,
        userId: 7,
        date: "2024-06-01",
        startTime: "11:00",
        endTime: "12:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const input = {
      roomId: 12,
      date: "2024-06-02",
      startTime: "09:00",
      endTime: "10:00",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: true,
      booking: {
        id: 9,
        userId: 7,
        roomId: 12,
        date: "2024-06-02",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00.000Z",
      },
    });
  });
  test("does not modify existing bookings", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [
      {
        id: 8,
        roomId: 12,
        userId: 7,
        date: "2024-06-01",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 2,
        roomId: 12,
        userId: 7,
        date: "2024-06-01",
        startTime: "10:00",
        endTime: "11:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
      {
        id: 5,
        roomId: 12,
        userId: 7,
        date: "2024-06-01",
        startTime: "11:00",
        endTime: "12:00",
        createdAt: "2024-06-01T08:00:00Z",
      },
    ];
    const input = {
      roomId: 12,
      date: "2024-06-02",
      startTime: "09:00",
      endTime: "10:00",
    };
    const bookingsBefore = bookings.map((booking) => ({ ...booking }));
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: true,
      booking: {
        id: 9,
        userId: 7,
        roomId: 12,
        date: "2024-06-02",
        startTime: "09:00",
        endTime: "10:00",
        createdAt: "2024-06-01T08:00:00.000Z",
      },
    });
    expect(bookings).toEqual(bookingsBefore);
  });
  test("rejects booking creation for an invalid date format", () => {
    const user: User = { id: 7, name: "Alice", role: "booker" };
    const rooms: Room[] = [{ id: 12, name: "Room A", capacity: 10 }];
    const bookings: Booking[] = [];
    const input = {
      roomId: 12,
      date: "2026-02-30",
      startTime: "09:00",
      endTime: "10:00",
    };
    expect(createBooking(input, bookings, user, rooms)).toEqual({
      success: false,
      error: "INVALID_DATE",
    });
  });
});

describe("dateValidation", () => {
  test("accepts a valid date", () => {
    expect(dateValidation("2026-06-01")).toBe(true);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("")).toBe(false);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("2026-2-3")).toBe(false);
  });
  test("rejects an invalid date format", () => {
  expect(dateValidation("2026-02-03 ")).toBe(false);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("2026-02-03\n")).toBe(false);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("2026-00-10")).toBe(false);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("2026-13-10")).toBe(false);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("2026-01-00")).toBe(false);
  });
  test("rejects an invalid date format", () => {
    expect(dateValidation("2026-01-32")).toBe(false);
  });
  test("accepts a valid month length (April)", () => {
    expect(dateValidation("2026-04-30")).toBe(true);
  });
  test("rejects an invalid month length (April)", () => {
    expect(dateValidation("2026-04-31")).toBe(false);
  });
  test("accepts a valid month length (February)", () => {
    expect(dateValidation("2026-02-28")).toBe(true);
  });
  test("rejects an invalid month length (February)", () => {
    expect(dateValidation("2026-02-30")).toBe(false);
  });
  test("accepts a valid leap year date (February)", () => {
    expect(dateValidation("2024-02-29")).toBe(true);
  });
  test("accepts a valid leap year date (February)", () => {
    expect(dateValidation("2000-02-29")).toBe(true);
  });
  test("rejects an invalid leap year date (February)", () => {
    expect(dateValidation("1900-02-29")).toBe(false);
  });
  test("rejects an invalid leap year date (February)", () => {
    expect(dateValidation("2026-02-29")).toBe(false);
  });

});
