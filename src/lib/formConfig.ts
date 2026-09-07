// Form configuration and custom opportunity field identifiers for
// Integrated Electrical & Solar enquiry form. Custom field ids are returned
// by the CRM custom field registration step and must not be changed.

export const FIELD_IDS = {
  serviceNeeded: "Fj8WRlCzZbkNJqAmBF8i",
  leadSource: "5zDPUZdcX1xKM0zbPsuH",
  utmSource: "iQf26ndVbpMJcc0J4iRh",
  utmMedium: "hf8VWTNWjJSPxFrKEUdX",
  utmCampaign: "3JeKExko0kvfu2Ih9dR1",

  propertyType: "GQT6XtMO7g8mYq4MyGMT",
  roofType: "k3l7kca9kxwkJA3JO2pQ",
  roofAge: "dohSUQ52V20intLVGpdV",
  monthlyPowerBill: "288BqqlZUGyxzcKXrDL3",
  powerBillUpload: "izAZIACHXuSFiDongUO5",
  batteryInterest: "ADOwLRZFUhb9rjIgY1r7",
  evChargingInterest: "ab88fwxRtUuqI8yqfHDQ",
  homeOwnership: "jLrjqaH5g0TjDwHqfdyg",
  callToDiscussSolar: "yDbsYRQ6wlaLvRrYrVy8",
  solarInterests: "ZMZheDBe4awHByCLL0FV",

  heatPumpPurpose: "gxT0W6p5oqBM0HbGm3P2",
  roomsOrSpaceSize: "jaExkbW32L71TCVornWV",
  existingHeatPump: "nx6rapZOj2WFWxUgV7xU",
  whenLookingToInstall: "p0hpp9TXsZlrVmBIgPSk",

  whatDoYouNeedDone: "7yMYg5yo5pfCIEfN8SCV",
  urgent: "mhThYdHSuSwsZV0VDJgM",
  whenLookingToGetThisDone: "qpm9ZUWDJUVubfChWbev",

  projectType: "6oFpAbtw63aBx0Sbh0ZS",
  projectStage: "ZjGWOaHXqbNUzlowNNou",
  plansUpload: "U1M0mZWVo2mhlRSaaCvd",
  projectScope: "P08yJF5encB7S0F6j5iE",
  builderName: "fgv7uTLPrYZXmg3upUd4",

  commercialWorkType: "4Jp8yz7rG5jaAas3YGHy",
  commercialSiteAddress: "7eXWB4PzsDimiwvx20HZ",
  commercialTiming: "PaSNX2FIsY3eRSBEmXwv",

  whatIsTheProblem: "yvXfkCsogPuz1gyRK55V",
  isItNotWorkingRightNow: "rlVK5jxTQzTVwTRK2QgS",
  isThisUrgent: "zWhBsWViZZgZlQxYqiSb",
  preferredVisitTime: "XAMBv5XQOFXgZA8apMo4",

  otherEnquiryDetails: "wJsTnWhsmNAYQRU0vXIH",
  additionalMessage: "M40iqkNXauJEGD2zTSjF",
  howDidYouHearAboutUs: "CQfRY6SksRNCO5cFveXG",
} as const;

export const SERVICE_OPTIONS = [
  "Solar and Battery",
  "Heat Pump",
  "General Electrical",
  "New Build or Renovation",
  "Commercial",
  "Maintenance or Repair",
  "Other",
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  "Residential",
  "Commercial",
  "Rural",
] as const;

export const ROOF_TYPE_OPTIONS = [
  "Tile",
  "Metal/Iron",
  "Concrete",
  "Flat/Membrane",
  "Other",
] as const;

export const ROOF_AGE_OPTIONS = [
  "0 to 5 years",
  "6 to 10 years",
  "11 to 20 years",
  "Over 20 years",
  "Not sure",
] as const;

export const HOME_OWNERSHIP_OPTIONS = ["Yes", "No"] as const;

export const CALL_DISCUSS_SOLAR_OPTIONS = ["Yes", "No"] as const;

export const SOLAR_INTERESTS_OPTIONS = [
  "Residential Solar Installation",
  "Option of Batteries",
  "Off-grid Solar Installation",
  "Commercial Solar Installation",
] as const;

export const BATTERY_INTEREST_OPTIONS = [
  "Yes interested",
  "No just solar",
  "Not sure yet",
] as const;

export const EV_INTEREST_OPTIONS = ["Yes", "No", "Not sure yet"] as const;

export const HEAT_PUMP_PURPOSE_OPTIONS = [
  "Heating only",
  "Heating and Cooling",
  "Whole home ducted",
] as const;

export const EXISTING_HEAT_PUMP_OPTIONS = [
  "Yes replacing existing",
  "No first install",
] as const;

export const WHEN_INSTALL_OPTIONS = [
  "ASAP",
  "Within 1 month",
  "1 to 3 months",
  "Just researching",
] as const;

export const URGENT_OPTIONS = ["Yes urgent", "No can wait"] as const;
export const WHEN_DONE_OPTIONS = [
  "ASAP",
  "Within 2 weeks",
  "Within a month",
  "Flexible",
] as const;

export const PROJECT_TYPE_OPTIONS = [
  "New build",
  "Renovation",
  "Extension",
] as const;
export const PROJECT_STAGE_OPTIONS = [
  "Planning",
  "Consented",
  "Under construction",
] as const;

export const COMMERCIAL_WORK_TYPE_OPTIONS = [
  "Fit out",
  "Maintenance contract",
  "New installation",
  "Compliance/Testing",
  "Other",
] as const;

export const NOT_WORKING_OPTIONS = ["Yes", "No"] as const;
export const IS_URGENT_OPTIONS = ["Yes urgent", "No not urgent"] as const;
export const VISIT_TIME_OPTIONS = [
  "Morning",
  "Afternoon",
  "Evening",
  "Flexible",
] as const;

export const HEAR_ABOUT_OPTIONS = [
  "Google search",
  "Referral",
  "Social media",
  "Trade Me/online listing",
  "Other",
] as const;

export const POWER_BILL_ACCEPT =
  ".pdf,.png,.jpeg,.jpg,.docx,.doc,.xlsx,.xls,.csv";

export const PLANS_ACCEPT = ".pdf,.png,.jpeg,.jpg,.docx,.doc,.xlsx,.xls,.csv";

export type FieldType = "text" | "textarea" | "select" | "file" | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  hint?: string;
  full?: boolean;
}

export const SERVICE_KEY = "service" as const;

export interface BranchDef {
  key: string;
  title: string;
  fields: FieldDef[];
  showProgress?: boolean;
}

export const BRANCHES: Record<string, BranchDef> = {
  "Solar and Battery": {
    key: "solar",
    title: "Your solar and battery details",
    showProgress: true,
    fields: [
      {
        key: "homeOwnership",
        label: "Do you own your home?",
        type: "select",
        options: HOME_OWNERSHIP_OPTIONS,
        required: true,
      },
      {
        key: "callToDiscussSolar",
        label: "Call me to discuss about solar installation",
        type: "select",
        options: CALL_DISCUSS_SOLAR_OPTIONS,
      },
      {
        key: "solarInterests",
        label: "Interests",
        type: "select",
        options: SOLAR_INTERESTS_OPTIONS,
        required: true,
      },
      {
        key: "monthlyPowerBill",
        label: "Monthly Electricity Spend",
        type: "text",
        required: true,
        placeholder: "e.g. $280 per month",
      },
      {
        key: "solarPropertyType",
        label: "Property Type",
        type: "select",
        options: PROPERTY_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "solarRoofType",
        label: "Roof Type",
        type: "select",
        options: ROOF_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "roofAge",
        label: "Roof Age",
        type: "select",
        options: ROOF_AGE_OPTIONS,
        required: true,
      },
      {
        key: "powerBillFiles",
        label: "Power Bill Upload",
        type: "file",
        accept: POWER_BILL_ACCEPT,
        multiple: true,
        maxFiles: 10,
        hint: "Optional. PDF, PNG, JPEG, JPG, DOCX, DOC, XLSX, XLS or CSV. Up to 10 files, 50 MB each.",
      },
      {
        key: "batteryInterest",
        label: "Battery Interest",
        type: "select",
        options: BATTERY_INTEREST_OPTIONS,
      },
      {
        key: "evChargingInterest",
        label: "EV Charging Interest",
        type: "select",
        options: EV_INTEREST_OPTIONS,
      },
    ],
  },

  "Heat Pump": {
    key: "heatpump",
    title: "Your heat pump details",
    fields: [
      {
        key: "hpPropertyType",
        label: "Property Type",
        type: "select",
        options: PROPERTY_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "heatPumpPurpose",
        label: "Heat Pump Purpose",
        type: "select",
        options: HEAT_PUMP_PURPOSE_OPTIONS,
        required: true,
      },
      {
        key: "roomsOrSpaceSize",
        label: "Rooms or Space Size",
        type: "text",
        required: true,
        placeholder: "3 bedrooms, or open plan approx 45m2",
      },
      {
        key: "existingHeatPump",
        label: "Existing Heat Pump",
        type: "select",
        options: EXISTING_HEAT_PUMP_OPTIONS,
        required: true,
      },
      {
        key: "whenLookingToInstall",
        label: "When looking to install",
        type: "select",
        options: WHEN_INSTALL_OPTIONS,
        required: true,
      },
    ],
  },

  "General Electrical": {
    key: "general",
    title: "Your electrical job details",
    fields: [
      {
        key: "whatDoYouNeedDone",
        label: "What do you need done",
        type: "text",
        required: true,
        placeholder: "e.g. Replace old switchboard, add extra power points",
        full: true,
      },
      {
        key: "urgent",
        label: "Urgent",
        type: "select",
        options: URGENT_OPTIONS,
        required: true,
      },
      {
        key: "whenLookingToGetThisDone",
        label: "When looking to get this done",
        type: "select",
        options: WHEN_DONE_OPTIONS,
        required: true,
      },
    ],
  },

  "New Build or Renovation": {
    key: "newbuild",
    title: "Your project details",
    fields: [
      {
        key: "projectType",
        label: "Project Type",
        type: "select",
        options: PROJECT_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "projectStage",
        label: "Project Stage",
        type: "select",
        options: PROJECT_STAGE_OPTIONS,
        required: true,
      },
      {
        key: "plansFiles",
        label: "Plans Upload",
        type: "file",
        accept: PLANS_ACCEPT,
        multiple: true,
        maxFiles: 10,
        hint: "Optional. PDF, PNG, JPEG, JPG, DOCX, DOC, XLSX, XLS or CSV. Up to 10 files, 50 MB each.",
      },
      {
        key: "projectScope",
        label: "Project Scope",
        type: "textarea",
        placeholder:
          "Describe the scope of work, number of points, lighting, etc.",
        full: true,
      },
      {
        key: "builderName",
        label: "Builder Name",
        type: "text",
        placeholder: "Builder's name, or owner managed",
        full: true,
      },
    ],
  },

  Commercial: {
    key: "commercial",
    title: "Your commercial job details",
    fields: [
      {
        key: "businessName",
        label: "Business Name",
        type: "text",
        required: true,
      },
      {
        key: "commercialWorkType",
        label: "Commercial Work Type",
        type: "select",
        options: COMMERCIAL_WORK_TYPE_OPTIONS,
        required: true,
      },
      {
        key: "commercialSiteAddress",
        label: "Commercial Site Address",
        type: "text",
        required: true,
      },
      {
        key: "commercialTiming",
        label: "Commercial Timing",
        type: "textarea",
        required: true,
        placeholder: "Tell us your timing, access windows and any deadlines.",
        full: true,
      },
    ],
  },

  "Maintenance or Repair": {
    key: "maintenance",
    title: "Your maintenance or repair details",
    fields: [
      {
        key: "whatIsTheProblem",
        label: "What's the problem",
        type: "textarea",
        required: true,
        placeholder: "Describe what is happening and what you need fixed.",
        full: true,
      },
      {
        key: "isItNotWorkingRightNow",
        label: "Is it not working right now",
        type: "select",
        options: NOT_WORKING_OPTIONS,
        required: true,
      },
      {
        key: "isThisUrgent",
        label: "Is this urgent",
        type: "select",
        options: IS_URGENT_OPTIONS,
        required: true,
      },
      {
        key: "preferredVisitTime",
        label: "Preferred Visit Time",
        type: "select",
        options: VISIT_TIME_OPTIONS,
        required: true,
      },
    ],
  },

  Other: {
    key: "other",
    title: "Tell us what you need",
    fields: [
      {
        key: "otherEnquiryDetails",
        label: "Tell us what you need help with",
        type: "textarea",
        required: true,
        full: true,
      },
    ],
  },
};

// Shared optional message field shown on every Step 2 variant.
export const ADDITIONAL_MESSAGE_FIELD: FieldDef = {
  key: "additionalMessage",
  label: "Anything else you'd like to add?",
  type: "textarea",
  placeholder:
    "Optional. Add any extra context that helps us prepare for your enquiry.",
  full: true,
};

// Friendly label map for review summary and tracking labels.
export const FIELD_LABELS: Record<string, string> = {
  service: "What do you need help with?",
  homeOwnership: "Do you own your home?",
  callToDiscussSolar: "Call me to discuss about solar installation",
  solarInterests: "Interests",
  solarPropertyType: "Property Type",
  solarRoofType: "Roof Type",
  roofAge: "Roof Age",
  monthlyPowerBill: "Monthly Electricity Spend",
  powerBillFiles: "Power Bill Upload",
  batteryInterest: "Battery Interest",
  evChargingInterest: "EV Charging Interest",
  hpPropertyType: "Property Type",
  heatPumpPurpose: "Heat Pump Purpose",
  roomsOrSpaceSize: "Rooms or Space Size",
  existingHeatPump: "Existing Heat Pump",
  whenLookingToInstall: "When looking to install",
  whatDoYouNeedDone: "What do you need done",
  urgent: "Urgent",
  whenLookingToGetThisDone: "When looking to get this done",
  projectType: "Project Type",
  projectStage: "Project Stage",
  plansFiles: "Plans Upload",
  projectScope: "Project Scope",
  builderName: "Builder Name",
  businessName: "Business Name",
  commercialWorkType: "Commercial Work Type",
  commercialSiteAddress: "Commercial Site Address",
  commercialTiming: "Commercial Timing",
  whatIsTheProblem: "What's the problem",
  isItNotWorkingRightNow: "Is it not working right now",
  isThisUrgent: "Is this urgent",
  preferredVisitTime: "Preferred Visit Time",
  otherEnquiryDetails: "Tell us what you need help with",
  additionalMessage: "Anything else you'd like to add?",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  streetAddress: "Street address",
  city: "City",
  region: "Region",
  country: "Country",
  postalCode: "Postal code",
  hearAboutUs: "How did you hear about us",
};
