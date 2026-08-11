export interface User {
  id: string;
  companyName: string;
  email: string;
  theme: string;
}

export interface Booking {
  id: string;
  companyName: string;
  startTime: string;
  endTime: string;
  userId: string;
}
