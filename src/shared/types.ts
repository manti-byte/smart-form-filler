export type FieldType =
  | "firstName"
  | "lastName"
  | "fullName"
  | "username"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "country"
  | "zip"
  | "company"
  | "jobTitle"
  | "dob"
  | "gender"
  | "password"
  | "website"
  | "creditCard";

export interface Profile {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  company: string;
  jobTitle: string;
  dob: string; // ISO yyyy-mm-dd
  gender: "male" | "female";
  password: string;
  website: string;
  creditCard: string;
}

export type GenderMode = "random" | "male" | "female";

export type RegionCode =
  | "US"
  | "GB"
  | "DE"
  | "FR"
  | "NL"
  | "RU"
  | "PL"
  | "CA"
  | "AU"
  | "random";

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  confidence: number;
  descriptor: string;
}

export interface FillSummary {
  found: number;
  filled: number;
  skipped: number;
  failed: number;
}

export interface CustomFieldRule {
  id: string;
  matchOn: "name" | "id" | "placeholder";
  matchValue: string;
  mapsTo: FieldType | "randomId" | "randomNumber";
}

export interface HistoryEntry {
  id: string;
  profile: Profile;
  createdAt: number;
  region: RegionCode;
}

export interface ExtensionSettings {
  enabledFields: Record<FieldType, boolean>;
  language: "en" | "ru";
  theme: ThemeId;
  region: RegionCode;
  genderMode: GenderMode;
  customRules: CustomFieldRule[];
}

export type ThemeId =
  | "midnight"
  | "nord"
  | "dracula"
  | "ocean"
  | "emerald"
  | "light"
  | "cyberpunk";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  vars: Record<string, string>;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabledFields: {
    firstName: true,
    lastName: true,
    fullName: true,
    username: true,
    email: true,
    phone: true,
    address: true,
    city: true,
    state: true,
    country: true,
    zip: true,
    company: true,
    jobTitle: true,
    dob: true,
    gender: true,
    password: true,
    website: true,
    creditCard: false,
  },
  language: "en",
  theme: "midnight",
  region: "random",
  genderMode: "random",
  customRules: [],
};

export type BgMessage =
  | { type: "GENERATE_PROFILE"; region: RegionCode; genderMode: GenderMode }
  | { type: "GET_SETTINGS" }
  | { type: "SAVE_SETTINGS"; settings: ExtensionSettings }
  | { type: "GET_HISTORY" }
  | { type: "ADD_HISTORY"; entry: HistoryEntry }
  | { type: "DELETE_HISTORY"; id: string };

export type ContentMessage =
  | { type: "FILL_PAGE"; profile: Profile; settings: ExtensionSettings }
  | { type: "CLEAR_PAGE" }
  | { type: "DETECT_ONLY" }
  | { type: "PING" };

