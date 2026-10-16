import "./style.css";
import { loadBookings, saveBookings } from "./storage/bookingStorage";
import { createBooking } from "./validation/bookingValidator";
import type { Booking, CreateBookingInput } from "./models/booking";
import type { Room } from "./models/room";
import type { User } from "./models/user";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App element not found");
}

app.innerHTML = `
  <div class="app-shell">
    <header class="site-header">
      <a class="brand" href="./" aria-label="SlotLedger home">
        <span class="brand-mark" aria-hidden="true">SL</span>
        <span>SlotLedger<span class="brand-caption">ROOM BOOKING</span></span>
      </a>
      <div class="demo-user">
        <span class="avatar" aria-hidden="true">A</span>
        <span>Alice<span class="user-caption">Demo user · Booker</span></span>
      </div>
    </header>

    <main>
      <section class="page-intro" aria-labelledby="page-title">
        <p class="eyebrow">A LITTLE SPACE TO GET THINGS DONE</p>
        <h1 id="page-title">Make room for your next idea.</h1>
        <p class="intro-copy">Pick a room, choose your time, and keep your bookings in one place.</p>
      </section>

      <div class="workspace">
        <section class="panel booking-panel" aria-labelledby="form-title">
          <div class="panel-heading">
            <span class="section-number" aria-hidden="true">01</span>
            <div>
              <h2 id="form-title">Book a room</h2>
              <p>Find a moment that works for you.</p>
            </div>
          </div>

          <form id="booking-form">
            <div class="field">
              <label for="roomId">Room</label>
              <select id="roomId" name="roomId" required>
                <option value="">Choose a room</option>
                <option value="1">Room A</option>
                <option value="2">Room B</option>
              </select>
            </div>
            <div class="field">
              <label for="date">Date</label>
              <input id="date" name="date" type="date" required />
            </div>
            <div class="time-fields">
              <div class="field">
                <label for="startTime">Start time</label>
                <input id="startTime" name="startTime" type="time" step="60" required />
              </div>
              <div class="field">
                <label for="endTime">End time</label>
                <input id="endTime" name="endTime" type="time" step="60" required />
              </div>
            </div>
            <p class="field-hint">Choose a start and end time on the same day.</p>
            <button id="create-booking" class="primary-button" type="submit" disabled>
              Create booking <span aria-hidden="true">↗</span>
            </button>
            <p id="booking-message" class="message" role="status" aria-atomic="true"></p>
          </form>
          <div class="form-note">
            <span class="note-dot" aria-hidden="true"></span>
            <p>One room, one booking at a time. Overlapping time slots aren't available.</p>
          </div>
        </section>

        <section class="panel bookings-panel" aria-labelledby="list-title">
          <div class="panel-heading">
            <span class="section-number" aria-hidden="true">02</span>
            <div>
              <h2 id="list-title">Your booking ledger</h2>
              <p>All bookings saved in this browser.</p>
            </div>
          </div>
          <p id="storage-message" class="message" role="alert" aria-atomic="true"></p>
          <div id="booking-empty" class="empty-state">
            <svg class="calendar-illustration" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <circle cx="60" cy="60" r="56" fill="currentColor" opacity=".06" />
              <rect x="30" y="32" width="60" height="60" rx="10" stroke="currentColor" stroke-width="2" />
              <path d="M30 49H90M45 26V38M75 26V38" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <rect x="43" y="60" width="11" height="11" rx="3" fill="currentColor" opacity=".2" />
              <path d="M67 66H78M72.5 60.5V71.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <h3>No bookings yet</h3>
            <p>Your next meeting starts here.<br />Choose a room and time to add your first booking.</p>
          </div>
          <ul id="booking-list" class="booking-list" aria-label="Saved bookings"></ul>
          <div class="ledger-note">
            <span aria-hidden="true">↳</span>
            <p>Back-to-back meetings? A booking can start exactly when another ends.</p>
          </div>
        </section>
      </div>

      <aside class="demo-notice" aria-label="About this demo">
        <span class="demo-badge">LOCAL DEMO</span>
        <p>Bookings are stored in this browser. They aren't shared with other people or devices.
          Alice is a demo identity; no sign-in is required.</p>
      </aside>
    </main>
    <footer class="site-footer">
      <span>SlotLedger <span aria-hidden="true">/</span> A room for every plan.</span>
      <span>QA automation portfolio · In development</span>
    </footer>
  </div>

  <template id="booking-item-template">
    <li class="booking-item">
      <div class="booking-item-heading">
        <h3 class="booking-room"></h3>
        <span class="booking-reference"></span>
      </div>
      <div class="booking-details">
        <time class="booking-date"></time>
        <span class="booking-time"></span>
      </div>
    </li>
  </template>
`;

const bookingList = document.querySelector<HTMLUListElement>("#booking-list");
const bookingEmpty = document.querySelector<HTMLDivElement>("#booking-empty");
const storageMessage =
  document.querySelector<HTMLParagraphElement>("#storage-message");
const bookingItemTemplate = document.querySelector<HTMLTemplateElement>(
  "#booking-item-template",
);
const bookingForm = document.querySelector<HTMLFormElement>("#booking-form");
const createBookingButton = document.querySelector<HTMLButtonElement>("#create-booking");
const bookingMessage = document.querySelector<HTMLParagraphElement>("#booking-message");

let rooms: Room[] = [
  { id: 1, name: "Room A", capacity: 4 },
  { id: 2, name: "Room B", capacity: 8 },
];
let bookings: Booking[] = [];
export function renderBookings(bookings: Booking[]): void {
  if (!bookingList || !bookingEmpty || !bookingItemTemplate) {
    throw new Error("Booking UI elements not found");
  }
  bookingList.replaceChildren();
  bookingEmpty.hidden = bookings.length > 0;

  for (const booking of bookings) {
    const item = bookingItemTemplate.content.cloneNode(
      true,
    ) as DocumentFragment;
    const roomElement = item.querySelector<HTMLElement>(".booking-room");
    const referenceElement =
      item.querySelector<HTMLElement>(".booking-reference");
    const dateElement = item.querySelector<HTMLTimeElement>(".booking-date");
    const timeElement = item.querySelector<HTMLElement>(".booking-time");

    if (!roomElement || !referenceElement || !dateElement || !timeElement) {
      throw new Error("Booking template elements not found");
    }

    const room = rooms.find((room) => room.id === booking.roomId);

    roomElement.textContent = room ? room.name : `Room #${booking.roomId}`;
    referenceElement.textContent = `#${booking.id}`;
    dateElement.textContent = booking.date;
    dateElement.dateTime = booking.date;
    timeElement.textContent = `${booking.startTime} – ${booking.endTime}`;

    bookingList.append(item);
  }
}

if (!bookingList) {
  throw new Error("Booking list element not found");
}

if (!bookingEmpty) {
  throw new Error("Booking empty element not found");
}

if (!storageMessage) {
  throw new Error("Storage message element not found");
}

if (!bookingItemTemplate) {
  throw new Error("Booking item template element not found");
}

const result = loadBookings();

if (result.success) {
  bookings = result.bookings;
  renderBookings(bookings);
} else {
  bookingEmpty.hidden = true;
  storageMessage.dataset.kind = "error";
  storageMessage.textContent =
    "Bookings could not be loaded. Your stored data has not been changed.";
}

const currentUser: User = {
  id: 1,
  name: "Alice",
  role: "booker",
};

if (!bookingForm || !createBookingButton || !bookingMessage) {
  throw new Error("Booking form elements not found");
}

const bookingErrorMessages = {
  NO_PERMISSION: "You do not have permission to create bookings.",
  ROOM_NOT_FOUND: "The selected room could not be found.",
  INVALID_TIME: "Choose an end time later than the start time on the same day.",
  INVALID_DATE: "Choose a valid date.",
  ROOM_OVERLAP: "This room is already booked for the selected time.",
};

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!result.success) {
    bookingMessage.dataset.kind = "error";
    bookingMessage.textContent =
      "Bookings could not be loaded. Your stored data has not been changed.";
    return;
  }

  const formData = new FormData(bookingForm);
  const input: CreateBookingInput = {
    roomId: Number(formData.get("roomId")),
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
  };

  const createResult = createBooking(input, bookings, currentUser, rooms);

  if (!createResult.success) {
    bookingMessage.dataset.kind = "error";
    bookingMessage.textContent = bookingErrorMessages[createResult.error];
    return;
  }

  const updatedBookings = [...bookings, createResult.booking];
  if (saveBookings(updatedBookings).success) {
    bookings = updatedBookings;
    renderBookings(bookings);
    bookingMessage.dataset.kind = "success";
    bookingMessage.textContent = "Booking created successfully.";
  } else {
    bookingMessage.dataset.kind = "error";
    bookingMessage.textContent =
      "Booking could not be saved. Your stored data has not been changed.";
  }
});

createBookingButton.disabled = !result.success;