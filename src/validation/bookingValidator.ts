import type { User } from "../models/user";
import type { Room } from "../models/room";
import type { Booking, CreateBookingInput, CreateBookingResult } from "../models/booking";

export function timeValidation(startTime: string, endTime: string): boolean {
  if (
    startTime.length !== 5 ||
    endTime.length !== 5 ||
    startTime[2] !== ":" ||
    endTime[2] !== ":"
  ) {
    return false;
  }
  const startParts = startTime.split(":");
  const endParts = endTime.split(":");
  const twoDigits = /^[0-9]{2}$/;

  if (
    !twoDigits.test(startParts[0]) ||
    !twoDigits.test(startParts[1]) ||
    !twoDigits.test(endParts[0]) ||
    !twoDigits.test(endParts[1])
  ) {
    return false;
  }

  const startHour = Number(startParts[0]);
  const startMinute = Number(startParts[1]);
  const endHour = Number(endParts[0]);
  const endMinute = Number(endParts[1]);
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  if (
    startHour < 0 ||
    startHour > 23 ||
    endHour < 0 ||
    endHour > 23 ||
    startMinute < 0 ||
    startMinute > 59 ||
    endMinute < 0 ||
    endMinute > 59
  ) {
    return false;
  }
  return startTotalMinutes < endTotalMinutes;
}

export function canCreateBooking(user: User): boolean {
  return user.role === "booker";
}

export function roomExists(roomId: number, rooms: Room[]): boolean {
  return rooms.some((room) => room.id === roomId);
}

export function roomOverlap(
  startTime: string,
  endTime: string,
  roomId: number,
  bookings: Booking[],
  date: string,
): boolean {
  return bookings.some((booking) => {
    if (
      booking.roomId !== roomId ||
      booking.date !== date ||
      endTime <= booking.startTime ||
      startTime >= booking.endTime
    ) {
      return false;
    }
    return true;
  });
}

export function createBooking(
  input: CreateBookingInput,
  bookings: Booking[],
  user: User,
  rooms: Room[],
): CreateBookingResult {
  if (!canCreateBooking(user)) {
    return { success: false, error: "NO_PERMISSION" };
  }
  if (!roomExists(input.roomId, rooms)) {
    return { success: false, error: "ROOM_NOT_FOUND" };
  }
  if (!timeValidation(input.startTime, input.endTime)) {
    return { success: false, error: "INVALID_TIME" };
  }
  if (!dateValidation(input.date)) {
    return { success: false, error: "INVALID_DATE" };
  }
  if (roomOverlap(input.startTime, input.endTime, input.roomId, bookings, input.date)) {
    return { success: false, error: "ROOM_OVERLAP" };
  }
  let maxId = 0;
  for (const booking of bookings) {
    if (booking.id > maxId) {
      maxId = booking.id;
    }
  }
  const createdAt = new Date().toISOString();
  const id = maxId + 1;
  const newBooking: Booking = {
    ...input,
    id,
    createdAt,
    userId: user.id,
  };
  return { success: true, booking: newBooking };
}

export function dateValidation(date: string): boolean {
  const datePattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  if (!datePattern.test(date)) {
    return false;
  }
  const dateParts = date.split("-");
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);
  const leapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };
  if (month < 1 || month > 12) {
    return false;
  }
  if (day < 1 || day > 31) {
    return false;
  }
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && leapYear(year)) {
    return day <= 29;
  }
  return day <= daysInMonth[month - 1];
}