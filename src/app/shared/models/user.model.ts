export interface UserRole {
  description: string;
  routes: unknown[];
  users: unknown[];
  id: number;
  name: string;
  addedOn: string | null;
}


export interface User {
  userFriendlyName: string;
  hasGlobalAccess: boolean;
  needToPasswordChange: boolean;

  email: string;
  address: string;

  cityId: number;
  city: string;

  referralCode: string;

  membership: string;

  points: number;
  coins: number;
  balance: number;

  walletId: number;

  profilePictureURL: string;

  roles: UserRole[];

  branches: unknown[];
  routes: unknown[];

  isFleetManager: boolean;
  isCorporateCardHolder: boolean;
  isCashCardFleetManager: boolean;

  id: number;

  name: string;

  addedOn: string;
}