export interface EducationArticle {
  id: string;
  category:
    | "Menstrual Health"
    | "Cycle Phases"
    | "Hygiene & Comfort"
    | "Symptoms & Relief"
    | "Myths vs. Facts"
    | "Self-Care";
  title: string;
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  body: string[];
  accentColor: string;
}

export interface HealthcareResource {
  id: string;
  name: string;
  type: "Community Clinic" | "Telehealth" | "National Helpline" | "Student & Youth";
  affordability: string;
  description: string;
  services: string[];
  contactInfo: string;
  websiteUrl: string;
}

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: "four-cycle-phases",
    category: "Cycle Phases",
    title: "Understanding Your 4 Inner Seasons: Menstrual, Follicular, Ovulatory & Luteal",
    readTime: "4 min read",
    summary:
      "Learn how estrogen and progesterone gently rise and fall across the month—and how to align rest, nutrition, and movement with each phase.",
    keyTakeaways: [
      "Menstrual Phase (Days 1–5): Hormone levels are lowest; prioritize warmth, iron, and restorative rest.",
      "Follicular Phase (Days 6–13): Rising estrogen supports mental clarity, curiosity, and fresh energy.",
      "Ovulation Window (Around Day 14): Peak estrogen and luteinizing hormone boost communication and vitality.",
      "Luteal Phase (Days 15–28): Progesterone rises; steady complex carbs and magnesium ease PMS.",
    ],
    body: [
      "Your menstrual cycle is far more than just the days you bleed—it is a continuous, dynamic hormonal rhythm often described as four internal seasons. Understanding these shifts helps replace self-judgment with body literacy.",
      "During the Menstrual Phase, the uterine lining sheds. Energy naturally turns inward, making gentle walks, stretching, iron-rich foods (lentils, spinach, lean proteins), and hydration especially supportive.",
      "In the Follicular Phase, follicles mature in the ovaries and estrogen climbs steadily. Many people notice brighter mood, sharper focus, and higher physical stamina.",
      "Around Ovulation, a mature egg is released. You may feel socially outgoing and energetic. Afterwards, the Luteal Phase begins: progesterone prepares the body and gently slows metabolism, increasing appetite and need for quality sleep.",
    ],
    accentColor: "#F9A8D4",
  },
  {
    id: "menstrual-hygiene-guide",
    category: "Hygiene & Comfort",
    title: "Modern Menstrual Hygiene: Comparing Pads, Cups, Discs & Period Underwear",
    readTime: "5 min read",
    summary:
      "An unbiased, practical guide to choosing breathable, body-safe menstrual products and preventing irritation or Toxic Shock Syndrome (TSS).",
    keyTakeaways: [
      "Change pads and tampons every 4–6 hours (never exceed 8 hours for tampons).",
      "Medical-grade silicone menstrual cups and discs can be worn up to 12 hours and last for years.",
      "Wash reusable cups with fragrance-free mild soap and boil between cycles.",
      "Choose breathable cotton underwear and avoid scented wipes or douches that disrupt vaginal pH.",
    ],
    body: [
      "Healthy menstrual care starts with keeping the vulvar area clean, breathable, and free from harsh synthetic fragrances. The vagina is self-cleaning and maintains a slightly acidic pH that protects against infections.",
      "Disposable organic cotton pads and tampons remain convenient staples—always pick the lowest tampon absorbency suited to your flow and change regularly.",
      "Reusable options such as medical-grade silicone menstrual cups, discs, and moisture-wicking period underwear reduce waste and long-term cost while offering comfortable overnight protection.",
    ],
    accentColor: "#C4B5FD",
  },
  {
    id: "cramp-pms-relief",
    category: "Symptoms & Relief",
    title: "Evidence-Based Relief for Period Cramps, Bloating & Fatigue",
    readTime: "4 min read",
    summary:
      "Why prostaglandins cause uterine cramping and which gentle remedies—from heat therapy to anti-inflammatory nutrition—help calm discomfort.",
    keyTakeaways: [
      "Continuous low-level heat therapy relaxes uterine muscle contractions as effectively as mild analgesics for many.",
      "Omega-3 fatty acids, ginger, turmeric, and magnesium support lower prostaglandin inflammation.",
      "Gentle pelvic tilts, child's pose, and walking improve pelvic blood circulation.",
    ],
    body: [
      "Primary dysmenorrhea (common menstrual cramps) happens when natural compounds called prostaglandins trigger the uterus to contract and shed its lining. Higher prostaglandin levels often mean stronger cramps.",
      "Applying a warm heating pad or hot water bottle to your lower abdomen increases blood flow and soothes tight muscles. Sipping freshly steeped ginger or chamomile tea also calms digestive bloating.",
      "If pain regularly interrupts school, work, or sleep despite over-the-counter remedies, consult a healthcare provider to screen for conditions like endometriosis or fibroids.",
    ],
    accentColor: "#FDBA74",
  },
  {
    id: "myths-vs-facts",
    category: "Myths vs. Facts",
    title: "7 Common Period Myths Debunked by Reproductive Health Science",
    readTime: "3 min read",
    summary:
      "Separating cultural misconceptions from medical facts—from exercise and bathing during your period to cycle regularity.",
    keyTakeaways: [
      "Myth: You shouldn't exercise or wash your hair on your period. Fact: Warm showers and light movement actually relieve cramps.",
      "Myth: Every healthy cycle is strictly 28 days. Fact: Adult cycles normally range from 21 to 35 days.",
      "Myth: Severe, debilitating pain is 'just normal.' Fact: Extreme pain deserves compassionate medical evaluation.",
    ],
    body: [
      "For generations, stigma and silence allowed myths about menstruation to persist. In reality, menstruation is a vital sign of overall health.",
      "Light-to-moderate exercise releases endorphins—your body's natural pain relievers—while warm baths or showers relax tense lower-back muscles.",
      "Additionally, minor variations of 2–4 days in cycle length from month to month are completely normal and can reflect travel, stress, sleep shifts, or illness.",
    ],
    accentColor: "#F472B6",
  },
  {
    id: "cycle-nutrition-selfcare",
    category: "Self-Care",
    title: "Nourishing Your Cycle: Iron, Magnesium & Nervous System Care",
    readTime: "4 min read",
    summary:
      "Simple, comforting food pairings and daily nervous-system rituals that replenish nutrients lost during menstruation.",
    keyTakeaways: [
      "Pair plant-based iron (lentils, tofu, pumpkin seeds) with Vitamin C (citrus, bell peppers) to boost absorption.",
      "Stay hydrated with electrolyte-rich broths, coconut water, or herbal infusions.",
      "Slow diaphragmatic breathing activates the vagus nerve and lowers cortisol during PMS.",
    ],
    body: [
      "Menstruation leads to modest iron loss, which can contribute to tiredness or brain fog. Combining iron-rich foods with Vitamin C significantly enhances absorption.",
      "During the late luteal phase, stabilizing blood sugar with regular balanced meals containing protein, healthy fats, and fiber prevents sudden mood dips and energy crashes.",
    ],
    accentColor: "#A78BFA",
  },
  {
    id: "menstrual-health-vital-sign",
    category: "Menstrual Health",
    title: "Your Period as a Fifth Vital Sign: What Cycle Tracking Reveals",
    readTime: "5 min read",
    summary:
      "Why clinicians encourage tracking cycle length, flow volume, and mood patterns to spot thyroid, PCOS, or stress signals early.",
    keyTakeaways: [
      "Tracking 3+ cycles creates a clear baseline you can share at annual wellness visits.",
      "Noticeable shifts in flow volume, spotting between periods, or missed cycles provide helpful clues for doctors.",
      "Predictions in wellness apps are helpful estimates based on averages—never rigid medical guarantees.",
    ],
    body: [
      "Leading medical organizations recognize the menstrual cycle as a key indicator of endocrine, metabolic, and nutritional well-being.",
      "Keeping a calm, non-judgmental log of period start dates, flow heaviness, and energy patterns empowers you to advocate for yourself in healthcare appointments.",
    ],
    accentColor: "#FB7185",
  },
];

export const HEALTHCARE_RESOURCES: HealthcareResource[] = [
  {
    id: "fqhc-clinics",
    name: "HRSA Community Health Centers (FQHCs)",
    type: "Community Clinic",
    affordability: "Sliding-Scale Fees ($0 – Low Cost based on income)",
    description:
      "Federally funded local health centers providing comprehensive gynecological exams, Pap smears, STI testing, birth control, and primary care regardless of ability to pay or insurance status.",
    services: [
      "Annual Well-Woman Exams",
      "Cycle & PCOS Evaluation",
      "Sliding-Scale Sliding Fees",
      "Multilingual Care Teams",
    ],
    contactInfo: "1-877-464-4772 • findahealthcenter.hrsa.gov",
    websiteUrl: "https://findahealthcenter.hrsa.gov",
  },
  {
    id: "planned-parenthood",
    name: "Planned Parenthood Health Centers",
    type: "Community Clinic",
    affordability: "Accepts Medicaid, Most Insurance & Sliding Scale",
    description:
      "Trusted nationwide reproductive and sexual healthcare clinics offering in-person and telehealth visits for menstrual pain, irregular periods, contraception, and preventive screenings.",
    services: [
      "Menstrual Disorder Consults",
      "Telehealth Prescriptions",
      "Preventive Screenings",
      "Confidential Counseling",
    ],
    contactInfo: "1-800-230-PLAN • plannedparenthood.org",
    websiteUrl: "https://www.plannedparenthood.org",
  },
  {
    id: "title-x-clinics",
    name: "Title X Family Planning Clinics",
    type: "Community Clinic",
    affordability: "Free or Low-Cost Confidential Services",
    description:
      "Publicly funded clinics across every U.S. state dedicated to confidential reproductive healthcare, menstrual health education, and preventive care for teens and adults.",
    services: [
      "Confidential Youth & Adult Care",
      "Free/Low-Cost Visits",
      "Pelvic Health Screenings",
      "No Insurance Required",
    ],
    contactInfo: "opa-fpclinicdb.hhs.gov",
    websiteUrl: "https://opa-fpclinicdb.hhs.gov",
  },
  {
    id: "womens-health-helpline",
    name: "Office on Women's Health (OWH) Helpline",
    type: "National Helpline",
    affordability: "Free Information & Local Referral Service",
    description:
      "U.S. Department of Health & Human Services resource offering free, medically reviewed guidance on menstruation, endometriosis, PCOS, fibroids, and local low-cost clinic referrals.",
    services: [
      "Free Nurse/Specialist Referrals",
      "Endometriosis & PCOS Guides",
      "English & Spanish Support",
    ],
    contactInfo: "1-800-994-9662 • womenshealth.gov",
    websiteUrl: "https://www.womenshealth.gov",
  },
  {
    id: "campus-telehealth",
    name: "Campus Health & Low-Cost Women's Telehealth",
    type: "Student & Youth",
    affordability: "Included in Student Fees or $15–$35 Telehealth",
    description:
      "University health centers and accredited women's telehealth platforms offer convenient virtual consultations for period pain relief, cycle regulation, and iron-deficiency labs.",
    services: [
      "Same-Week Virtual Visits",
      "Lab Order Referrals",
      "Prescription Delivery",
    ],
    contactInfo: "Check your university health portal or local Medicaid telehealth directory",
    websiteUrl: "https://www.medicaid.gov",
  },
];

export const DOCTOR_RED_FLAGS = [
  {
    id: "heavy-bleeding",
    label: "Soaking through a pad or tampon every 1–2 hours for consecutive hours",
    advice:
      "Heavy menstrual bleeding (menorrhagia) can lead to iron-deficiency anemia and deserves prompt medical evaluation.",
  },
  {
    id: "severe-pain",
    label: "Severe pelvic cramps that do not improve with heat or standard OTC pain relief",
    advice:
      "Debilitating pain is not something you simply have to endure—ask an OB/GYN about endometriosis, adenomyosis, or pelvic floor therapy.",
  },
  {
    id: "irregular-cycles",
    label: "Cycles consistently shorter than 21 days, longer than 35 days, or 3+ missed periods",
    advice:
      "Persistent irregularity can be linked to PCOS, thyroid changes, stress, or nutritional factors that a simple blood panel can clarify.",
  },
  {
    id: "intermenstrual-bleeding",
    label: "Bleeding between periods, after intercourse, or sudden dizziness/shortness of breath",
    advice:
      "Schedule an appointment with a healthcare provider to check cervical health, hormone levels, and hemoglobin/ferritin.",
  },
];

export const POSITIVE_AFFIRMATIONS = [
  "My body is wise, resilient, and worthy of gentle care in every phase of my cycle.",
  "Resting when my energy dips is an act of self-respect, not weakness.",
  "I release tension with every slow exhale and welcome calm into my body.",
  "My feelings are valid messengers; I can hold space for them with kindness.",
  "I nourish myself with patience, warmth, hydration, and compassion today.",
  "Just like the moon, I am allowed to wax, wane, rest, and shine in my own rhythm.",
  "I deserve supportive relationships and safe spaces where my boundaries are honored.",
  "Every breath softens my shoulders and grounds me in the present moment.",
];
