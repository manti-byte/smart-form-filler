import type { GenderMode, Profile, RegionCode } from "./types";

const FIRST_M = ["James","Liam","Noah","William","Oliver","Ethan","Lucas","Mason","Logan","Daniel","Ivan","Sergei","Dmitri","Pavel","Andrei","Mark","Paul","Thomas","Felix","Anton"];
const FIRST_F = ["Emma","Olivia","Ava","Isabella","Sophia","Mia","Charlotte","Amelia","Harper","Evelyn","Anna","Maria","Olga","Elena","Natalia","Irina","Sofia","Julia","Laura","Nina"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Ivanov","Petrov","Smirnov","Kowalski","Nowak","Müller","Schmidt","Dupont","Martin","Van den Berg","De Jong","Jansen"];
const COMPANY_PREFIX = ["Global","Apex","Nova","Pioneer","Summit","Vertex","Quantum","Cobalt","Bright","Iron"];
const COMPANY_SUFFIX = ["Solutions","Systems","Labs","Group","Industries","Technologies","Partners","Dynamics","Networks","Ventures"];
const JOB_TITLES = ["Software Engineer","Product Manager","Data Analyst","UX Designer","Marketing Specialist","Sales Manager","DevOps Engineer","Financial Analyst","HR Coordinator","Operations Manager","Frontend Developer","Backend Developer","QA Engineer","Account Executive","Research Scientist"];
const CC_TESTS = ["4111111111111111","5555555555554444","378282246310005","6011111111111117","4222222222222"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

interface RegionMeta {
  country: string;
  cities: string[];
  states: string[];
  zip: () => string;
  phonePrefix: string;
  websiteTld: string;
}

const REGION_META: Record<Exclude<RegionCode, "random">, RegionMeta> = {
  US: {
    country: "United States",
    cities: ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose"],
    states: ["California","Texas","New York","Florida","Illinois","Pennsylvania","Ohio","Georgia","North Carolina","Michigan"],
    zip: () => String(randInt(10000, 99999)),
    phonePrefix: "+1",
    websiteTld: "com",
  },
  GB: {
    country: "United Kingdom",
    cities: ["London","Manchester","Birmingham","Leeds","Glasgow","Liverpool","Edinburgh","Bristol","Cardiff","Sheffield"],
    states: ["England","Scotland","Wales","Northern Ireland"],
    zip: () => `${pick(["AB","CD","EF","GH","JK"])}${randInt(1,9)} ${randInt(1,9)}${pick(["AA","BB","CC","DD"])}`,
    phonePrefix: "+44",
    websiteTld: "co.uk",
  },
  DE: {
    country: "Germany",
    cities: ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dortmund","Essen"],
    states: ["Bavaria","Berlin","Hamburg","Hesse","Saxony","Lower Saxony","Rhineland-Palatinate","Baden-Württemberg"],
    zip: () => String(randInt(10000, 99999)),
    phonePrefix: "+49",
    websiteTld: "de",
  },
  FR: {
    country: "France",
    cities: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille"],
    states: ["Île-de-France","Provence-Alpes-Côte d'Azur","Auvergne-Rhône-Alpes","Occitanie","Nouvelle-Aquitaine","Hauts-de-France"],
    zip: () => String(randInt(10000, 99999)),
    phonePrefix: "+33",
    websiteTld: "fr",
  },
  NL: {
    country: "Netherlands",
    cities: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen","Tilburg","Almere","Breda","Nijmegen"],
    states: ["North Holland","South Holland","Utrecht","North Brabant","Gelderland","Limburg"],
    zip: () => `${randInt(1000,9999)} ${pick(["AB","CD","EF","GH","JK","LM","NP","QR","ST","UV"])}`,
    phonePrefix: "+31",
    websiteTld: "nl",
  },
  RU: {
    country: "Russia",
    cities: ["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Kazan","Nizhny Novgorod","Chelyabinsk","Samara","Omsk","Rostov-on-Don"],
    states: ["Moscow","Saint Petersburg","Novosibirsk Oblast","Sverdlovsk Oblast","Tatarstan","Nizhny Novgorod Oblast"],
    zip: () => String(randInt(100000, 999999)),
    phonePrefix: "+7",
    websiteTld: "ru",
  },
  PL: {
    country: "Poland",
    cities: ["Warsaw","Kraków","Łódź","Wrocław","Poznań","Gdańsk","Szczecin","Bydgoszcz","Lublin","Katowice"],
    states: ["Masovian","Lesser Poland","Silesian","Greater Poland","Lower Silesian","Pomeranian"],
    zip: () => `${randInt(10,99)}-${randInt(100,999)}`,
    phonePrefix: "+48",
    websiteTld: "pl",
  },
  CA: {
    country: "Canada",
    cities: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Halifax"],
    states: ["Ontario","Quebec","British Columbia","Alberta","Manitoba","Saskatchewan","Nova Scotia"],
    zip: () => `${pick(["A","B","C","D","E","G","H","J","K","L","M","N","P","R","S","T","V","X","Y"])}${randInt(1,9)}${pick(["A","B","C","E","G","H","J","K","L","M","N","P","R","S","T","V","X","Y","Z"])} ${randInt(1,9)}${pick(["A","B","C","E","G","H","J","K","L","M","N","P","R","S","T","V","X","Y","Z"])}${randInt(1,9)}`,
    phonePrefix: "+1",
    websiteTld: "ca",
  },
  AU: {
    country: "Australia",
    cities: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Newcastle","Wollongong","Hobart"],
    states: ["New South Wales","Victoria","Queensland","Western Australia","South Australia","Tasmania"],
    zip: () => String(randInt(200, 9999)),
    phonePrefix: "+61",
    websiteTld: "com.au",
  },
};

function pickRegion(region: RegionCode): Exclude<RegionCode, "random"> {
  if (region !== "random") return region;
  const keys = Object.keys(REGION_META) as Exclude<RegionCode, "random">[];
  return pick(keys);
}

function randomDate(minAge: number, maxAge: number): string {
  const now = new Date();
  const year = now.getFullYear() - randInt(minAge, maxAge);
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function generateLocalProfile(
  region: RegionCode,
  genderMode: GenderMode
): Profile {
  const meta = REGION_META[pickRegion(region)];
  const gender: "male" | "female" =
    genderMode === "random" ? (Math.random() < 0.5 ? "male" : "female") : genderMode;
  const firstName = pick(gender === "male" ? FIRST_M : FIRST_F);
  const lastName = pick(LAST);
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999)}`.replace(/[^a-z0-9.]/g, "");
  const domain = `${pick(["gmail","outlook","yahoo","proton","mail"])}.com`;
  const website = `https://${username}.${meta.websiteTld}`;
  const zip = meta.zip();
  const street = `${randInt(1, 9999)} ${pick(["Main","Oak","Maple","Cedar","Pine","Elm","Washington","Park","Lake","Hill"])} ${pick(["St","Ave","Rd","Blvd","Ln"])}`;

  const profile: Profile = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    username,
    email: `${username.replace(/\./g, "")}@${domain}`,
    phone: `${meta.phonePrefix}${randInt(200, 999)}${randInt(100, 999)}${randInt(1000, 9999)}`,
    address: street,
    city: pick(meta.cities),
    state: pick(meta.states),
    country: meta.country,
    zip,
    company: `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`,
    jobTitle: pick(JOB_TITLES),
    dob: randomDate(21, 65),
    gender,
    password: `${pick(["A","B","C","D","E","F","G","H"])}${pick(["x","y","z","k","m"])}${randInt(100,999)}!${pick(["a","b","c"])}${pick(["Q","R","S"])}`,
    website,
    creditCard: pick(CC_TESTS),
  };
  return profile;
}

/**
 * Normalize a RandomUser.me result into our Profile shape.
 * RandomUser.me does NOT provide company or job title — those get patched locally.
 */
export function normalizeRandomUser(
  raw: any,
  region: RegionCode
): Profile {
  const gender: "male" | "female" = raw.gender === "female" ? "female" : "male";
  const firstName = String(raw.name?.first ?? "").trim();
  const lastName = String(raw.name?.last ?? "").trim();
  const meta = REGION_META[pickRegion(region)];

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    username: String(raw.login?.username ?? `${firstName}.${lastName}`.toLowerCase()),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    address: `${raw.location?.street?.number ?? ""} ${raw.location?.street?.name ?? ""}`.trim(),
    city: String(raw.location?.city ?? ""),
    state: String(raw.location?.state ?? ""),
    country: String(raw.location?.country ?? meta.country),
    zip: String(raw.location?.postcode ?? ""),
    company: `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`,
    jobTitle: pick(JOB_TITLES),
    dob: String(raw.dob?.date ?? "").slice(0, 10),
    gender,
    password: String(raw.login?.password ?? "Passw0rd!123"),
    website: `https://${String(raw.login?.username ?? "site").toLowerCase()}.${meta.websiteTld}`,
    creditCard: pick(CC_TESTS),
  };
}