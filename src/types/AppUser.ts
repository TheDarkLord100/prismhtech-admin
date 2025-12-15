export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  location?: string;
  gstin?: string;
  created_at: string;
  email_verified: boolean;
}
