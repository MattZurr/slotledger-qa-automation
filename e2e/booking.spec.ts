import { test, expect } from "@playwright/test";

test("creates a booking and preserves it after reload", async ({ page }) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page.reload();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");
});

test("rejects an overlapping booking", async ({ page }) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page.reload();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:30");
  await page.getByLabel("End time", { exact: true }).fill("10:30");
  await page.getByRole("button", { name: "Create booking" }).click();
  const errorOverlapMessage = page.getByText(
    "This room is already booked for the selected time.",
  );
  await expect(errorOverlapMessage).toBeVisible();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("09:00 – 10:00");

  await page.reload();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");
});

test("rejects an end time before the start time", async ({ page }) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("10:00");
  await page.getByLabel("End time", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  const errorEndTimeMessage = page.getByText(
    "Choose an end time later than the start time on the same day.",
  );
  await expect(errorEndTimeMessage).toBeVisible();
  await expect(booking).toHaveCount(0);
});

test("allows back-to-back bookings in the same room", async ({ page }) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("10:00");
  await page.getByLabel("End time", { exact: true }).fill("11:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  await expect(booking).toHaveCount(2);
  await expect(booking).toContainText(["Room A", "Room A"]);
  await expect(booking).toContainText(["2026-10-19", "2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00", "10:00 – 11:00"]);
});

test("allows bookings at the same time in different rooms", async ({
  page,
}) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room B" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  await expect(booking).toHaveCount(2);
  await expect(booking).toContainText(["Room A", "Room B"]);
  await expect(booking).toContainText(["2026-10-19", "2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00", "09:00 – 10:00"]);
});

test("allows bookings at the same time on different dates", async ({
  page,
}) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-20");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  await expect(booking).toHaveCount(2);
  await expect(booking).toContainText(["Room A", "Room A"]);
  await expect(booking).toContainText(["2026-10-19", "2026-10-20"]);
  await expect(booking).toContainText(["09:00 – 10:00", "09:00 – 10:00"]);
});

test("rejects a booking with equal start and end times", async ({ page }) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  const invalidTimeMessage = page.getByText(
    "Choose an end time later than the start time on the same day.",
  );
  await expect(invalidTimeMessage).toBeVisible();
  await expect(booking).toHaveCount(0);
});

test("allows creating a booking after correcting an invalid end time", async ({
  page,
}) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("10:00");
  await page.getByLabel("End time", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  const errorEndTimeMessage = page.getByText(
    "Choose an end time later than the start time on the same day.",
  );
  await expect(errorEndTimeMessage).toBeVisible();
  await expect(booking).toHaveCount(0);

  await page.getByLabel("End time", { exact: true }).fill("11:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("10:00 – 11:00");
  await expect(errorEndTimeMessage).not.toBeVisible();
  const successMessage = page.getByText("Booking created successfully.");
  await expect(successMessage).toBeVisible();
});

test("blocks booking creation and preserves malformed stored data", async ({
  page,
}) => {
  const invalidData = "{broken";
  await page.addInitScript((storedValue) => {
    localStorage.setItem("slotledger.bookings", storedValue);
  }, invalidData);

  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();

  await expect(
    page
      .getByRole("alert")
      .getByText(
        "Bookings could not be loaded. Your stored data has not been changed.",
      ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeDisabled();

  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  await expect(booking).toHaveCount(0);
  await expect(
    page.evaluate(() => localStorage.getItem("slotledger.bookings")),
  ).resolves.toBe(invalidData);
  await expect(page.getByText("No bookings yet")).not.toBeVisible();
});

test("preserves existing bookings when saving a new booking fails", async ({
  page,
}) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page.evaluate(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === "slotledger.bookings") {
        throw new Error("Simulated storage write failure");
      }
      originalSetItem.call(this, key, value);
    };
  });

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("10:00");
  await page.getByLabel("End time", { exact: true }).fill("11:00");
  await page.getByRole("button", { name: "Create booking" }).click();
  await expect(
    page
      .getByRole("status")
      .getByText(
        "Booking could not be saved. Your stored data has not been changed.",
      ),
  ).toBeVisible();
  const successMessage = page.getByText("Booking created successfully.");
  await expect(successMessage).not.toBeVisible();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");

  await page.reload();
  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText("Room A");
  await expect(booking).toContainText("2026-10-19");
  await expect(booking).toContainText("09:00 – 10:00");
});

test("blocks booking creation when reading stored bookings fails", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (this === localStorage && key === "slotledger.bookings") {
        throw new Error("Simulated storage read failure");
      }
      return originalGetItem.call(this, key);
    };
  });

  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeDisabled();
  await expect(page.getByText("No bookings yet")).not.toBeVisible();
  await expect(
    page
      .getByRole("alert")
      .getByText(
        "Bookings could not be loaded. Your stored data has not been changed.",
      ),
  ).toBeVisible();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(0);
});

test("blocks booking creation when date is invalid", async ({ page }) => {
  const invalidBooking = {
    id: 1,
    roomId: 1,
    userId: 1,
    date: "2026-02-31",
    startTime: "10:00",
    endTime: "11:00",
    createdAt: "2026-02-01T09:00:00.000Z",
  };
  const invalidData = JSON.stringify([invalidBooking]);

  await page.addInitScript((storedValue) => {
    localStorage.setItem("slotledger.bookings", storedValue);
  }, invalidData);

  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();

  await expect(
    page
      .getByRole("alert")
      .getByText(
        "Bookings could not be loaded. Your stored data has not been changed.",
      ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeDisabled();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  await expect(booking).toHaveCount(0);
  await expect(page.getByText("No bookings yet")).not.toBeVisible();

  await expect(
    page.evaluate(() => localStorage.getItem("slotledger.bookings")),
  ).resolves.toBe(invalidData);
});

test("allows retrying a booking after a temporary storage write failure", async ({
  page,
}) => {
  await page.goto("./");
  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End time", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  await page.evaluate(() => {
    const originalSetItem = Storage.prototype.setItem;
    let shouldFail = true;
    Storage.prototype.setItem = function (key, value) {
      if (
        this === localStorage &&
        key === "slotledger.bookings" &&
        shouldFail
      ) {
        shouldFail = false;
        throw new Error("Simulated storage write failure");
      }
      originalSetItem.call(this, key, value);
    };
  });

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("10:00");
  await page.getByLabel("End time", { exact: true }).fill("11:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  const saveError = page
    .getByRole("status")
    .getByText(
      "Booking could not be saved. Your stored data has not been changed.",
    );
  await expect(saveError).toBeVisible();

  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);

  await page.getByRole("button", { name: "Create booking" }).click();
  await expect(saveError).not.toBeVisible();
  await expect(
    page.getByRole("status").getByText("Booking created successfully."),
  ).toBeVisible();

  await expect(booking).toHaveCount(2);
  await expect(booking).toContainText(["Room A", "Room A"]);
  await expect(booking).toContainText(["2026-10-19", "2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00", "10:00 – 11:00"]);

  await page.reload();

  await expect(booking).toHaveCount(2);
  await expect(booking).toContainText(["Room A", "Room A"]);
  await expect(booking).toContainText(["2026-10-19", "2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00", "10:00 – 11:00"]);
});

test("displays a stored booking for an unknown room", async ({ page }) => {
  const validBooking = {
    id: 1,
    roomId: 99,
    userId: 1,
    date: "2026-10-19",
    startTime: "09:00",
    endTime: "10:00",
    createdAt: "2026-10-19T09:00:00.000Z",
  };
  const validData = JSON.stringify([validBooking]);
  await page.addInitScript((storedValue) => {
    localStorage.setItem("slotledger.bookings", storedValue);
  }, validData);

  await page.goto("./");
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText(["Room #99"]);
  await expect(booking).toContainText(["2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00"]);
  await expect(page.getByText("No bookings yet")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeEnabled();

  await expect(
    page.evaluate(() => localStorage.getItem("slotledger.bookings")),
  ).resolves.toBe(validData);
  await expect(
    page
      .getByRole("alert")
      .getByText(
        "Bookings could not be loaded. Your stored data has not been changed.",
      ),
  ).not.toBeVisible();
});

test("blocks booking creation and preserves stored bookings with duplicate IDs", async ({
  page,
}) => {
  const validBooking1 = {
    id: 1,
    roomId: 1,
    userId: 1,
    date: "2026-10-19",
    startTime: "09:00",
    endTime: "10:00",
    createdAt: "2026-10-19T09:00:00.000Z",
  };
  const validBooking2 = {
    id: 1,
    roomId: 1,
    userId: 1,
    date: "2026-10-19",
    startTime: "10:00",
    endTime: "11:00",
    createdAt: "2026-10-19T09:00:00.000Z",
  };
  const validData = JSON.stringify([validBooking1, validBooking2]);
  await page.addInitScript((storedValue) => {
    localStorage.setItem("slotledger.bookings", storedValue);
  }, validData);

  await page.goto("./");

  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();

  await expect(
    page
      .getByRole("alert")
      .getByText(
        "Bookings could not be loaded. Your stored data has not been changed.",
      ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeDisabled();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  await expect(booking).toHaveCount(0);
  await expect(page.getByText("No bookings yet")).not.toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem("slotledger.bookings")),
  ).resolves.toBe(validData);
});

test("rejects an overlapping booking against a stored booking", async ({
  page,
}) => {
  const validBooking = {
    id: 7,
    roomId: 1,
    userId: 1,
    date: "2026-10-19",
    startTime: "09:00",
    endTime: "10:00",
    createdAt: "2026-10-19T09:00:00.000Z",
  };
  const validData = JSON.stringify([validBooking]);
  await page.addInitScript((storedValue) => {
    localStorage.setItem("slotledger.bookings", storedValue);
  }, validData);

  await page.goto("./");

  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();

  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText(["Room A"]);
  await expect(booking).toContainText(["2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00"]);

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("09:30");
  await page.getByLabel("End time", { exact: true }).fill("10:30");
  await page.getByRole("button", { name: "Create booking" }).click();

  const errorOverlapMessage = page.getByText(
    "This room is already booked for the selected time.",
  );
  await expect(errorOverlapMessage).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeEnabled();

  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText(["Room A"]);
  await expect(booking).toContainText(["2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00"]);
  await expect(
    page.evaluate(() => localStorage.getItem("slotledger.bookings")),
  ).resolves.toBe(validData);
});

test("creates a booking with the next highest ID after loading stored bookings", async ({
  page,
}) => {
  const validBooking1 = {
    id: 7,
    roomId: 1,
    userId: 1,
    date: "2026-10-19",
    startTime: "09:00",
    endTime: "10:00",
    createdAt: "2026-10-19T09:00:00.000Z",
  };
  const validBooking2 = {
    id: 3,
    roomId: 1,
    userId: 1,
    date: "2026-10-19",
    startTime: "10:00",
    endTime: "11:00",
    createdAt: "2026-10-19T09:00:00.000Z",
  };
  const validData = JSON.stringify([validBooking1, validBooking2]);
  await page.addInitScript((storedValue) => {
    localStorage.setItem("slotledger.bookings", storedValue);
  }, validData);

  await page.goto("./");

  const heading = page.getByRole("heading", {
    name: "Book a room",
  });
  await expect(heading).toBeVisible();
  const booking = page
    .getByRole("list", { name: "Saved bookings" })
    .getByRole("listitem");
  await expect(booking).toHaveCount(2);
  await expect(booking).toContainText(["Room A", "Room A"]);
  await expect(booking).toContainText(["2026-10-19", "2026-10-19"]);
  await expect(booking).toContainText(["09:00 – 10:00", "10:00 – 11:00"]);

  await page
    .getByLabel("Room", { exact: true })
    .selectOption({ label: "Room A" });
  await page.getByLabel("Date", { exact: true }).fill("2026-10-19");
  await page.getByLabel("Start time", { exact: true }).fill("11:00");
  await page.getByLabel("End time", { exact: true }).fill("12:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  const successMessage = page.getByText("Booking created successfully.");
  await expect(successMessage).toBeVisible();
  await expect(booking).toHaveCount(3);
  await expect(booking).toContainText(["Room A", "Room A", "Room A"]);
  await expect(booking).toContainText([
    "2026-10-19",
    "2026-10-19",
    "2026-10-19",
  ]);
  await expect(booking).toContainText([
    "09:00 – 10:00",
    "10:00 – 11:00",
    "11:00 – 12:00",
  ]);

  const storedData = await page.evaluate(() =>
    localStorage.getItem("slotledger.bookings"),
  );
  if (storedData === null) {
    throw new Error("Expected saved bookings in localStorage");
  }

  const validBookingData = JSON.parse(storedData);
  await expect(validBookingData).toHaveLength(3);
  await expect(validBookingData[0]).toEqual(validBooking1);
  await expect(validBookingData[1]).toEqual(validBooking2);
  await expect(validBookingData[2]).toMatchObject({
    id: 8,
    roomId: 1,
    userId: 1,
    date: "2026-10-19",
    startTime: "11:00",
    endTime: "12:00",
  });
});
