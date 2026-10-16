export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface CreateBookingInput {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export type CreateBookingResult =
  | { success: true; booking: Booking }
  | {
      success: false;
      error:
        | "NO_PERMISSION"
        | "ROOM_NOT_FOUND"
        | "INVALID_TIME"
        | "INVALID_DATE"
        | "ROOM_OVERLAP";
    };

export type LoadBookingsResult =
  | { success: true; bookings: Booking[] }
  | {
      success: false;
      error: "INVALID_STORED_DATA" | "STORAGE_READ_ERROR";
    };

export type SaveBookingsResult =
  | { success: true }
  | { success: false; error: "STORAGE_WRITE_ERROR" };