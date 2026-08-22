export interface RSVPFormData {
    name: string;
    attendance: "attending" | "not-attending" | "";
    guestCount: string;
    message: string;
  }