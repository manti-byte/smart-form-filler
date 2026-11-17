import type { FieldType } from "./types";

export interface FieldPattern {
  type: FieldType;
  patterns: RegExp[];
  weight: number;
  inputTypes?: string[];
}

// Order = priority. Earlier = stronger signal.
export const FIELD_PATTERNS: FieldPattern[] = [
  {
    type: "email",
    weight: 100,
    inputTypes: ["email"],
    patterns: [/e-?mail/i, /^mail$/i, /correo/i],
  },
  {
    type: "phone",
    weight: 100,
    inputTypes: ["tel"],
    patterns: [/phone/i, /^tel(ephone)?$/i, /mobile/i, /cell/i, /contact.?number/i],
  },
  {
    type: "password",
    weight: 100,
    inputTypes: ["password"],
    patterns: [/pass(word|wd)?/i, /pwd/i],
  },
  {
    type: "creditCard",
    weight: 95,
    inputTypes: ["cc-number", "cc-number"],
    patterns: [/credit.?card/i, /cc.?number/i, /card.?number/i, /pan/i],
  },
  {
    type: "dob",
    weight: 95,
    inputTypes: ["date"],
    patterns: [/birth/i, /dob/i, /birthday/i, /date.?of.?birth/i, /bday/i],
  },
  {
    type: "zip",
    weight: 95,
    inputTypes: ["postal-code"],
    patterns: [/zip/i, /postal/i, /postcode/i, /post.?code/i],
  },
  {
    type: "firstName",
    weight: 90,
    inputTypes: ["given-name"],
    patterns: [/first.?name/i, /given.?name/i, /^fname$/i, /forename/i, /^first$/i],
  },
  {
    type: "lastName",
    weight: 90,
    inputTypes: ["family-name"],
    patterns: [/last.?name/i, /family.?name/i, /^lname$/i, /surname/i, /^last$/i],
  },
  {
    type: "fullName",
    weight: 85,
    inputTypes: ["name"],
    patterns: [/full.?name/i, /^name$/i, /^your.?name$/i, /customer.?name/i],
  },
  {
    type: "username",
    weight: 85,
    inputTypes: ["username"],
    patterns: [/user.?name/i, /^login$/i, /^nick(name)?$/i, /screen.?name/i, /^handle$/i],
  },
  {
    type: "address",
    weight: 85,
    inputTypes: ["street-address", "address-line1"],
    patterns: [/address/i, /^street$/i, /address.?line.?1/i, /^addr$/i, /street.?address/i],
  },
  {
    type: "city",
    weight: 85,
    inputTypes: ["address-level2"],
    patterns: [/^city$/i, /town/i, /locality/i],
  },
  {
    type: "state",
    weight: 85,
    inputTypes: ["address-level1"],
    patterns: [/^state$/i, /province/i, /region/i, /county/i, /^state.?\/?.?province$/i],
  },
  {
    type: "country",
    weight: 85,
    inputTypes: ["country", "country-name"],
    patterns: [/^country$/i, /nation/i],
  },
  {
    type: "company",
    weight: 80,
    patterns: [/company/i, /organi[sz]ation/i, /^employer$/i, /^org$/i, /business/i],
  },
  {
    type: "jobTitle",
    weight: 80,
    patterns: [/job.?title/i, /^title$/i, /^position$/i, /^role$/i, /occupation/i],
  },
  {
    type: "gender",
    weight: 90,
    patterns: [/^gender$/i, /^sex$/i],
  },
  {
    type: "website",
    weight: 80,
    inputTypes: ["url"],
    patterns: [/website/i, /^url$/i, /^homepage$/i, /^site$/i, /web.?address/i],
  },
];

// Attributes to inspect, in order of reliability
export const ATTRIBUTE_KEYS = [
  "autocomplete",
  "name",
  "id",
  "placeholder",
  "aria-label",
  "data-testid",
  "data-field",
  "data-name",
] as const;