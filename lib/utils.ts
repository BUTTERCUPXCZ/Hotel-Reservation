import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to notify room booking updates across the app
export function notifyRoomBookingUpdate(roomId: string) {
  // Set localStorage flag for cross-tab communication
  localStorage.setItem(
    "room-booking-update",
    JSON.stringify({
      roomId,
      timestamp: Date.now(),
    })
  );

  // Dispatch custom event for same-tab communication
  window.dispatchEvent(
    new CustomEvent("room-booking-complete", {
      detail: { roomId, timestamp: Date.now() },
    })
  );

  console.log(`📢 Room booking notification sent for room: ${roomId}`);
}
