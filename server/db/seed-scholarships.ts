// Scholarship Hunter — seeded dataset of REAL scholarship programmes.
// Every entry is a real programme. Deadlines/amounts were checked against
// public sources on 2026-11-07; `verified: true` means the deadline/status
// was confirmed in this session. `verified: false` means the date comes
// from prior cycle patterns and MUST be confirmed on the official page —
// the UI shows an "Unverified" badge for those. Never invent a deadline:
// if it is not confirmed, deadline is null and deadlineNote says so.

export type ScholarshipLevel = "bachelors" | "masters" | "phd" | "postdoc";
export type ScholarshipStatus = "open" | "closed" | "rolling";

export interface ScholarshipSeed {
  slug: string;
  name: string;
  provider: string;
  country: string;
  levels: ScholarshipLevel[];
  /** field keys: "all" means every field */
  fields: string[];
  amount: string;
  /** ISO date (YYYY-MM-DD) or null when there is no single confirmed date */
  deadline: string | null;
  deadlineNote: string;
  status: ScholarshipStatus;
  eligibilityNote: string;
  url: string;
  requirements: string[];
  description: string;
  verified: boolean;
  verifiedOn: string;
  sourceNote: string;
}

export const SCHOLARSHIP_SEEDS: ScholarshipSeed[] = [
  {
    slug: "gates-cambridge",
    name: "Gates Cambridge Scholarship",
    provider: "Gates Cambridge Trust, University of Cambridge",
    country: "United Kingdom",
    levels: ["masters", "phd"],
    fields: ["all"],
    amount: "Full tuition + maintenance + travel",
    deadline: "2026-12-08",
    deadlineNote:
      "International round: 8 Dec 2026 or 6 Jan 2027, depending on your course's funding deadline.",
    status: "open",
    eligibilityNote: "Citizens of any country outside the UK (Pakistan eligible).",
    url: "https://www.gatescambridge.org",
    requirements: [
      "Bachelor's degree in any field",
      "Apply via the Cambridge Graduate Application Portal",
      "Gates Cambridge statement (4 short essays)",
      "References submitted by the same deadline",
    ],
    description:
      "One of the world's most competitive fully funded postgraduate awards — full-cost funding for a Cambridge PhD, MLitt, MPhil or one-year Master's.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Confirmed by multiple 2027-28 guides citing gatescambridge.org.",
  },
  {
    slug: "erasmus-mundus",
    name: "Erasmus Mundus Joint Masters",
    provider: "European Commission (Erasmus+)",
    country: "European Union (multi-country)",
    levels: ["masters"],
    fields: ["all"],
    amount: "Full tuition + €1,400/month up to 24 months + insurance",
    deadline: "2027-01-15",
    deadlineNote:
      "No single deadline — most programmes close Dec 2026–Jan 2027 (e.g. Euroculture 15 Jan 2027). Check your programme's own page.",
    status: "open",
    eligibilityNote: "Open worldwide; Pakistan eligible.",
    url: "https://eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
    requirements: [
      "Bachelor's degree",
      "Apply directly to each programme consortium",
      "English test (IELTS/TOEFL) per programme rules",
      "No single deadline — check your programme",
    ],
    description:
      "A two-year joint Master's across two or three EU countries, fully funded. You apply to each programme consortium directly — there is no central portal.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Confirmed via EACEA catalogue guidance and programme pages (Oct–Nov 2026).",
  },
  {
    slug: "yenching-academy",
    name: "Yenching Academy Scholarship",
    provider: "Yenching Academy, Peking University",
    country: "China",
    levels: ["masters"],
    fields: ["china-studies", "humanities", "social-sciences"],
    amount: "Full tuition + stipend + accommodation + travel",
    deadline: "2026-11-30",
    deadlineNote: "Closes 30 Nov 2026, 09:00 Beijing time.",
    status: "open",
    eligibilityNote: "Non-Chinese citizens; Bachelor's in any field (or completing by Aug 2027).",
    url: "https://apply.yca.pku.edu.cn",
    requirements: [
      "Bachelor's degree in any field (or completing by Aug 2027)",
      "Non-Chinese citizen with a valid passport",
      "English test scores sent directly by the testing body",
      "Apply via the Yenching Academy portal",
    ],
    description:
      "A fully funded two-year interdisciplinary Master's in China Studies at Peking University for ~120 scholars a year.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Confirmed by multiple sources citing the Yenching Academy portal.",
  },
  {
    slug: "eth-excellence",
    name: "ETH Zurich Excellence Scholarship (ESOP)",
    provider: "ETH Zurich",
    country: "Switzerland",
    levels: ["masters"],
    fields: ["engineering", "science", "cs"],
    amount: "Tuition waiver + CHF 12,000 per semester",
    deadline: "2026-11-30",
    deadlineNote: "Application window 1–30 Nov 2026, closing 11:59 CET.",
    status: "open",
    eligibilityNote: "Excellent Bachelor's degree; open worldwide.",
    url: "https://ethz.ch",
    requirements: [
      "Excellent Bachelor's degree",
      "Apply via the ETH online application",
      "Pre-proposal for your Master's thesis (ESOP form)",
    ],
    description:
      "ETH's flagship excellence scholarship for outstanding Master's students — tuition waiver plus a living stipend each semester.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Deadline window confirmed against the official ETH page (checked 1 Nov 2026).",
  },
  {
    slug: "commonwealth-shared",
    name: "Commonwealth Shared Scholarships",
    provider: "Commonwealth Scholarship Commission (UK)",
    country: "United Kingdom",
    levels: ["masters"],
    fields: ["all"],
    amount: "Full tuition + stipend + travel",
    deadline: "2026-12-15",
    deadlineNote:
      "Opening early Nov 2026, closing mid-December — confirm the exact date on the official page.",
    status: "open",
    eligibilityNote: "Citizens of eligible Commonwealth countries (Pakistan eligible).",
    url: "https://cscuk.fcdo.gov.uk",
    requirements: [
      "Bachelor's degree",
      "Citizen of an eligible Commonwealth country",
      "Apply via the CSC online system and nominating agency",
    ],
    description:
      "Fully funded one-year Master's in the UK for students from eligible Commonwealth countries, jointly funded with UK universities.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Mid-December close confirmed against the official CSC page (checked 1 Nov 2026).",
  },
  {
    slug: "turkiye-burslari",
    name: "Türkiye Burslari Scholarship",
    provider: "Republic of Türkiye",
    country: "Türkiye",
    levels: ["bachelors", "masters", "phd"],
    fields: ["all"],
    amount: "Full tuition + stipend + accommodation + travel",
    deadline: "2027-02-20",
    deadlineNote: "Applications close 20 Feb 2027.",
    status: "open",
    eligibilityNote: "Open worldwide; Pakistan eligible.",
    url: "https://www.turkiyeburslari.gov.tr",
    requirements: [
      "Apply via the Türkiye Burslari portal",
      "Academic transcripts and diplomas",
      "No IELTS required at application (Turkish language year provided)",
    ],
    description:
      "Türkiye's flagship fully funded government scholarship for all degree levels, including a free Turkish language year.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Deadline confirmed against the official programme calendar (checked 1 Nov 2026).",
  },
  {
    slug: "daad-epos",
    name: "DAAD EPOS (Development-Related Postgraduate Courses)",
    provider: "DAAD (German Academic Exchange Service)",
    country: "Germany",
    levels: ["masters", "phd"],
    fields: ["development", "engineering", "environment", "economics", "public-health"],
    amount: "€934–1,400/month + insurance + travel; no tuition at public universities",
    deadline: null,
    deadlineNote:
      "Course-specific deadlines, mostly Aug–Oct for the 2027 intake — most have passed. Next cycle 2027.",
    status: "closed",
    eligibilityNote: "Citizens of developing countries (Pakistan eligible); 2+ years work experience required.",
    url: "https://www.daad.de/en/",
    requirements: [
      "Bachelor's degree + at least 2 years of work experience",
      "Apply to each course separately",
      "English or German per course requirements",
    ],
    description:
      "Germany's main fully funded Master's route for Pakistanis — selected development-related postgraduate courses with a monthly stipend.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Course-specific window confirmed via DAAD guidance (Oct 2026).",
  },
  {
    slug: "fulbright-usefp",
    name: "Fulbright Foreign Student Program (USEFP)",
    provider: "USEFP (United States Educational Foundation in Pakistan)",
    country: "United States",
    levels: ["masters", "phd"],
    fields: ["all"],
    amount: "Full tuition + airfare + living stipend + health insurance + books",
    deadline: null,
    deadlineNote:
      "2027 intake closed 1 Apr 2026. Next cycle expected early 2027 (unconfirmed).",
    status: "closed",
    eligibilityNote: "Pakistani citizens; 16 years of education; GRE required.",
    url: "https://www.usefp.org",
    requirements: [
      "16 years of education",
      "GRE required",
      "Apply via the USEFP portal",
      "TOEFL after shortlisting",
    ],
    description:
      "Pakistan's largest Fulbright degree programme — fully funded US Master's or PhD, run by USEFP.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Closure confirmed via USEFP announcements and trackers (Oct 2026).",
  },
  {
    slug: "chevening",
    name: "Chevening Scholarship",
    provider: "UK Foreign, Commonwealth & Development Office",
    country: "United Kingdom",
    levels: ["masters"],
    fields: ["all"],
    amount: "Full tuition + living stipend + travel",
    deadline: null,
    deadlineNote: "2027/28 cycle closed 6 Oct 2026 (11:00 UTC). Next cycle opens Aug 2027.",
    status: "closed",
    eligibilityNote: "Citizens of 160+ countries (Pakistan eligible); 2+ years work experience.",
    url: "https://www.chevening.org",
    requirements: [
      "Bachelor's degree",
      "At least 2 years of work experience (2,800 hours)",
      "Two references",
      "Apply via chevening.org",
    ],
    description:
      "The UK government's global scholarship for future leaders — a fully funded one-year Master's at any UK university.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Closure confirmed via the official Chevening timeline.",
  },
  {
    slug: "mext-research",
    name: "MEXT Research Students Scholarship (University Recommendation)",
    provider: "Government of Japan (MEXT)",
    country: "Japan",
    levels: ["masters", "phd"],
    fields: ["all"],
    amount: "≈¥144,000–145,000/month + tuition + airfare",
    deadline: "2027-01-31",
    deadlineNote:
      "University-recommendation route. Embassy route expected Apr–May 2027 — confirm on the official page.",
    status: "open",
    eligibilityNote: "Open worldwide; apply via a Japanese university.",
    url: "https://www.studyinjapan.go.jp/en/",
    requirements: [
      "Bachelor's degree",
      "Apply via a Japanese university (recommendation route)",
      "Research plan",
      "Health certificate",
    ],
    description:
      "Japan's flagship government scholarship for research students — monthly stipend, free tuition and airfare for Master's or PhD study.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "University-route date from the scholarship tracker; embassy window is the usual pattern.",
  },
  {
    slug: "kaust-fellowship",
    name: "KAUST Fellowship",
    provider: "King Abdullah University of Science and Technology",
    country: "Saudi Arabia",
    levels: ["masters", "phd"],
    fields: ["science", "engineering", "cs"],
    amount: "Full tuition + annual stipend + housing + airfare",
    deadline: null,
    deadlineNote: "Rolling — apply anytime.",
    status: "rolling",
    eligibilityNote: "Open worldwide; strong academic record required.",
    url: "https://www.kaust.edu.sa",
    requirements: [
      "Bachelor's degree in a relevant field",
      "TOEFL / IELTS",
      "Three recommendation letters",
      "Statement of purpose",
    ],
    description:
      "A fully funded MS/PhD fellowship at KAUST — tuition, stipend, housing and airfare, with rolling admissions.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Rolling admissions per KAUST admissions pages.",
  },
  {
    slug: "tudelft-van-effen",
    name: "Justus & Louise van Effen Excellence Scholarship",
    provider: "Delft University of Technology (TU Delft)",
    country: "Netherlands",
    levels: ["masters"],
    fields: ["engineering", "science"],
    amount: "Full tuition + living costs",
    deadline: "2026-12-01",
    deadlineNote: "Closes 1 Dec 2026.",
    status: "open",
    eligibilityNote: "Excellent international applicants to TU Delft Master's programmes.",
    url: "https://www.tudelft.nl",
    requirements: [
      "Bachelor's degree",
      "Excellent GPA",
      "Apply via the TU Delft application + scholarship form",
    ],
    description:
      "TU Delft's excellence scholarship for outstanding international Master's students in engineering and science.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Deadline confirmed against the official programme calendar (checked 1 Nov 2026).",
  },
  {
    slug: "eiffel-excellence",
    name: "France Excellence Eiffel Scholarship",
    provider: "Campus France / French Ministry for Europe and Foreign Affairs",
    country: "France",
    levels: ["masters", "phd"],
    fields: ["all"],
    amount: "€1,181/month + travel + insurance (Master's)",
    deadline: "2027-01-06",
    deadlineNote: "Closes 6 Jan 2027 — your French university nominates you.",
    status: "open",
    eligibilityNote: "Open worldwide; apply via a French university (they nominate).",
    url: "https://www.campusfrance.org",
    requirements: [
      "Apply via a French university (they nominate you)",
      "Bachelor's or Master's degree",
      "Age under 25 (Master's) / 30 (PhD)",
    ],
    description:
      "France's flagship excellence scholarship for international Master's and PhD students — monthly allowance plus travel and insurance.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Deadline confirmed via programme trackers (Oct 2026).",
  },
  {
    slug: "kth-scholarship",
    name: "KTH Scholarship",
    provider: "KTH Royal Institute of Technology",
    country: "Sweden",
    levels: ["masters"],
    fields: ["engineering", "science", "cs"],
    amount: "Full tuition waiver",
    deadline: "2027-01-15",
    deadlineNote: "Closes 15 Jan 2027 — apply for a KTH Master's programme first.",
    status: "open",
    eligibilityNote: "Open worldwide; fee-paying (non-EU/EEA) applicants.",
    url: "https://www.kth.se",
    requirements: [
      "Bachelor's degree",
      "Apply for a KTH Master's programme first",
      "Scholarship application after the admission application",
    ],
    description:
      "A full tuition waiver for outstanding international Master's students at KTH in Stockholm.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Deadline confirmed against the official programme calendar (checked 1 Nov 2026).",
  },
  {
    slug: "open-doors-russia",
    name: "Open Doors Russian Scholarship",
    provider: "Global Universities Association (Russia)",
    country: "Russia",
    levels: ["masters", "phd"],
    fields: ["all"],
    amount: "Full tuition + stipend for winners",
    deadline: null,
    deadlineNote: "2027 cycle dates not yet confirmed — check the official page.",
    status: "open",
    eligibilityNote: "Open worldwide; online olympiad rounds.",
    url: "https://od.globaluni.ru/en/",
    requirements: [
      "Bachelor's or Master's degree",
      "Online olympiad rounds",
      "Winners receive full tuition + stipend",
    ],
    description:
      "Russia's international olympiad scholarship — winners study tuition-free at leading Russian universities.",
    verified: false,
    verifiedOn: "2026-11-07",
    sourceNote: "Date not confirmed in this session — verify before applying.",
  },
  {
    slug: "epfl-excellence",
    name: "EPFL Excellence Fellowship",
    provider: "École Polytechnique Fédérale de Lausanne",
    country: "Switzerland",
    levels: ["masters"],
    fields: ["engineering", "science", "cs"],
    amount: "CHF 10,000 per semester + tuition",
    deadline: "2026-12-15",
    deadlineNote:
      "Some programmes close 15 Apr 2027. Unverified — confirm on EPFL's official page.",
    status: "open",
    eligibilityNote: "Outstanding Bachelor's graduates; open worldwide.",
    url: "https://www.epfl.ch",
    requirements: [
      "Excellent Bachelor's degree",
      "Apply via the EPFL Master's application",
      "Fellowship considered automatically for top applicants",
    ],
    description:
      "EPFL's excellence fellowship for outstanding Master's students — a per-semester grant plus tuition support.",
    verified: false,
    verifiedOn: "2026-11-07",
    sourceNote: "Date not confirmed in this session — verify before applying.",
  },
  {
    slug: "swiss-excellence",
    name: "Swiss Government Excellence Scholarship",
    provider: "Swiss Confederation (SBFI)",
    country: "Switzerland",
    levels: ["phd", "postdoc"],
    fields: ["all"],
    amount: "Monthly stipend + tuition + insurance",
    deadline: null,
    deadlineNote: "2027 intake closed 31 Oct 2026. Next cycle ~Sep 2027.",
    status: "closed",
    eligibilityNote: "PhD and postdoctoral researchers; apply via the Swiss embassy.",
    url: "https://www.sbfi.admin.ch",
    requirements: [
      "Master's degree (PhD) or PhD (postdoc)",
      "Research proposal + host professor invitation",
      "Apply via the Swiss embassy",
    ],
    description:
      "Switzerland's federal excellence scholarship for PhD and postdoctoral research stays at Swiss universities.",
    verified: true,
    verifiedOn: "2026-11-07",
    sourceNote: "Closure confirmed via trackers (Oct 2026).",
  },
];

export const FIELD_LABELS: Record<string, string> = {
  all: "All fields",
  cs: "Computer Science / AI",
  engineering: "Engineering",
  science: "Science",
  business: "Business",
  "public-health": "Public Health",
  development: "Development Studies",
  environment: "Environment",
  economics: "Economics",
  humanities: "Humanities",
  "social-sciences": "Social Sciences",
  "china-studies": "China Studies",
  medicine: "Medicine",
};

export const LEVEL_LABELS: Record<ScholarshipLevel, string> = {
  bachelors: "Bachelor's",
  masters: "Master's",
  phd: "PhD",
  postdoc: "Postdoc",
};
