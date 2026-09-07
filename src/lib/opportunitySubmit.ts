// Client side helper that posts the enquiry to the Vercel proxy
// (api/submit.ts) which creates the opportunity directly with all
// custom fields written to the OPPORTUNITY record.
//
// Set VITE_PROXY_URL in Vercel env (the deployed /api/submit endpoint)
// to enable direct opportunity creation. If it is not set, the form
// falls back to the tracking endpoint behaviour.

import { FIELD_IDS } from "@/lib/formConfig";

const PROXY_URL = (import.meta as any).env?.VITE_PROXY_URL as
  string | undefined;

interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  companyName?: string;
}

interface CustomField {
  id: string;
  value: string;
}

interface FilePayload {
  fieldId: string;
  filename: string;
  mimeType: string;
  dataBase64: string;
}

export interface OpportunitySubmission {
  contact: ContactPayload;
  opportunityName: string;
  customFields: CustomField[];
  files: FilePayload[];
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:...;base64," prefix
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });

export const isProxyEnabled = (): boolean => Boolean(PROXY_URL);

export const submitToProxy = async (
  submission: OpportunitySubmission,
): Promise<{ opportunityId?: string; contactId?: string }> => {
  if (!PROXY_URL) {
    throw new Error("Proxy URL is not configured.");
  }
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error || "";
    } catch {
      /* ignore */
    }
    throw new Error(
      detail ||
        `Enquiry submission failed (status ${res.status}). Please try again.`,
    );
  }
  return res.json();
};

// Build the proxy payload from the form state. Mirrors the field mapping
// already used by the tracking path so both stay in sync.
export const buildOpportunitySubmission = async (params: {
  service: string;
  detailValues: Record<string, string | File[]>;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    hearAboutUs: string;
  };
  hidden: {
    leadSource: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
  branchFields: { key: string; type: string; label: string }[];
  additionalMessage?: string;
}): Promise<OpportunitySubmission> => {
  const { service, detailValues, contact, hidden, branchFields } = params;

  const customFields: CustomField[] = [];
  const files: FilePayload[] = [];

  // Hidden fields (always sent)
  customFields.push({ id: FIELD_IDS.serviceNeeded, value: service });
  customFields.push({ id: FIELD_IDS.leadSource, value: hidden.leadSource });
  if (hidden.utmSource)
    customFields.push({ id: FIELD_IDS.utmSource, value: hidden.utmSource });
  if (hidden.utmMedium)
    customFields.push({ id: FIELD_IDS.utmMedium, value: hidden.utmMedium });
  if (hidden.utmCampaign)
    customFields.push({ id: FIELD_IDS.utmCampaign, value: hidden.utmCampaign });
  if (contact.hearAboutUs)
    customFields.push({
      id: FIELD_IDS.howDidYouHearAboutUs,
      value: contact.hearAboutUs,
    });

  let companyName: string | undefined;

  for (const field of branchFields) {
    const v = detailValues[field.key];
    if (field.key === "businessName") {
      if (v && String(v).trim()) companyName = String(v).trim();
      continue;
    }
    const fid = detailToFieldId(field.key);
    if (!fid) continue;
    if (field.type === "file") {
      const fileArr = (v as File[] | undefined) || [];
      for (const file of fileArr) {
        if (!file) continue;
        const dataBase64 = await fileToBase64(file);
        files.push({
          fieldId: fid,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          dataBase64,
        });
      }
    } else if (v !== undefined && v !== null && String(v).trim() !== "") {
      customFields.push({ id: fid, value: String(v) });
    }
  }

  if (params.additionalMessage && params.additionalMessage.trim()) {
    customFields.push({
      id: FIELD_IDS.additionalMessage,
      value: params.additionalMessage.trim(),
    });
  }

  const opportunityName =
    `${service} enquiry — ${contact.firstName} ${contact.lastName}`.trim();

  return {
    contact: {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      address1: contact.streetAddress.trim() || undefined,
      city: contact.city.trim() || undefined,
      state: contact.region.trim() || undefined,
      country: contact.country.trim() || undefined,
      postalCode: contact.postalCode.trim() || undefined,
      companyName,
    },
    opportunityName,
    customFields,
    files,
  };
};

// Map form field keys to registered custom field ids (opportunity fields).
const detailToFieldId = (key: string): string | undefined => {
  const map: Record<string, string> = {
    homeOwnership: FIELD_IDS.homeOwnership,
    callToDiscussSolar: FIELD_IDS.callToDiscussSolar,
    solarInterests: FIELD_IDS.solarInterests,
    solarPropertyType: FIELD_IDS.propertyType,
    solarRoofType: FIELD_IDS.roofType,
    roofAge: FIELD_IDS.roofAge,
    monthlyPowerBill: FIELD_IDS.monthlyPowerBill,
    powerBillFiles: FIELD_IDS.powerBillUpload,
    batteryInterest: FIELD_IDS.batteryInterest,
    evChargingInterest: FIELD_IDS.evChargingInterest,
    hpPropertyType: FIELD_IDS.propertyType,
    heatPumpPurpose: FIELD_IDS.heatPumpPurpose,
    roomsOrSpaceSize: FIELD_IDS.roomsOrSpaceSize,
    existingHeatPump: FIELD_IDS.existingHeatPump,
    whenLookingToInstall: FIELD_IDS.whenLookingToInstall,
    whatDoYouNeedDone: FIELD_IDS.whatDoYouNeedDone,
    urgent: FIELD_IDS.urgent,
    whenLookingToGetThisDone: FIELD_IDS.whenLookingToGetThisDone,
    projectType: FIELD_IDS.projectType,
    projectStage: FIELD_IDS.projectStage,
    plansFiles: FIELD_IDS.plansUpload,
    projectScope: FIELD_IDS.projectScope,
    builderName: FIELD_IDS.builderName,
    commercialWorkType: FIELD_IDS.commercialWorkType,
    commercialSiteAddress: FIELD_IDS.commercialSiteAddress,
    commercialTiming: FIELD_IDS.commercialTiming,
    whatIsTheProblem: FIELD_IDS.whatIsTheProblem,
    isItNotWorkingRightNow: FIELD_IDS.isItNotWorkingRightNow,
    isThisUrgent: FIELD_IDS.isThisUrgent,
    preferredVisitTime: FIELD_IDS.preferredVisitTime,
    otherEnquiryDetails: FIELD_IDS.otherEnquiryDetails,
  };
  return map[key];
};
