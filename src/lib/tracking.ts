// Form tracking helper for the Integrated Electrical & Solar enquiry form.
// Posts an external form submission event to the CRM using the tracking,
// location and project ids resolved from the form tracking integration.

type StandardTrackingFieldKey = string;
type RegisteredCustomFieldId = string;
type TrackingCustomField = { value?: unknown; label: string };
type TrackingFileField = { file?: File | File[]; label: string };
type TrackingImageDataField = { dataUrl?: string; label: string };

export const TRACKING_IDS = {
  trackingId: "tk_bbfa614cdb134efd9367733c88f051e8",
  locationId: "rg9lQrkWzxUgMm9XuL4C",
  projectId: "1788667270330991430",
  formId: "integrated-electrical-solar-enquiry",
  formName: "Integrated Electrical Solar Enquiry",
} as const;

export const postTrackingEvent = (
  trackingPayload: Record<string, unknown> & {
    formData: Record<StandardTrackingFieldKey, unknown>;
    formLabels: Record<StandardTrackingFieldKey, string>;
  },
  options: {
    customFields?: Record<RegisteredCustomFieldId, TrackingCustomField>;
    fileFields?: Record<RegisteredCustomFieldId, TrackingFileField>;
    imageDataFields?: Record<RegisteredCustomFieldId, TrackingImageDataField>;
  } = {},
): Promise<void> => {
  const { customFields = {}, fileFields = {}, imageDataFields = {} } = options;
  const eventPayload = {
    ...trackingPayload,
    formData: { ...trackingPayload.formData },
    formLabels: { ...trackingPayload.formLabels },
  };
  const body = new FormData();

  for (const [key, field] of Object.entries(customFields)) {
    if (field.value === undefined || field.value === "") continue;
    eventPayload.formData[key] = field.value;
    eventPayload.formLabels[key] = field.label;
  }

  for (const [key, field] of Object.entries(imageDataFields)) {
    const dataUrl = field.dataUrl;
    if (!dataUrl) continue;
    if (!dataUrl.startsWith("data:image/")) {
      return Promise.reject(
        new Error("Image data field must be a data:image/* base64 string"),
      );
    }
    eventPayload.formData[key] = dataUrl;
    eventPayload.formLabels[key] = field.label;
  }

  for (const [key, field] of Object.entries(fileFields)) {
    const files = Array.isArray(field.file)
      ? field.file
      : field.file
        ? [field.file]
        : [];
    files.forEach((file, index) => {
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("File must be 50 MB or smaller");
      }
      eventPayload.formData[key] = {
        filename: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      };
      eventPayload.formLabels[key] = field.label;
      body.append(index === 0 ? key : `${key}_${index}`, file, file.name);
    });
  }

  for (const key of Object.keys(eventPayload.formData)) {
    eventPayload.formLabels[key] ||= key;
  }

  body.append("event", JSON.stringify(eventPayload));

  // Files are sent as multipart to the tracking endpoint, which attaches them
  // to the opportunity it creates. We await the response so callers can
  // surface failures instead of silently showing a success screen.
  return fetch("https://backend.leadconnectorhq.com/external-tracking/events", {
    method: "POST",
    headers: {
      version: "2021-07-28",
    },
    body,
  }).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Enquiry submission failed (status ${res.status}). Please try again.`,
      );
    }
  });
};

// When embedded in an iframe (e.g. on a WordPress contact page), the visitor's
// UTMs live on the parent page URL, not the iframe URL. document.referrer
// exposes the parent page URL (including its query string) cross-origin, so we
// can forward UTMs from the WordPress page into the form automatically.
const isEmbedded = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const parentUrl = (() => {
  if (!isEmbedded || !document.referrer) return null;
  try {
    return new URL(document.referrer);
  } catch {
    return null;
  }
})();

/** Read a UTM value from the iframe URL first, then the parent page URL. */
const readUtm = (key: string): string => {
  const own = new URLSearchParams(window.location.search).get(key);
  if (own) return own;
  if (parentUrl) {
    const fromParent = parentUrl.searchParams.get(key);
    if (fromParent) return fromParent;
  }
  return "";
};

export const buildTrackingPayload = (params?: {
  service?: string;
}): Record<string, unknown> & {
  formData: Record<StandardTrackingFieldKey, unknown>;
  formLabels: Record<StandardTrackingFieldKey, string>;
} => {
  const leadSource = "Website Enquiry Form";
  const utmSource = readUtm("utm_source");
  const utmMedium = readUtm("utm_medium");
  const utmCampaign = readUtm("utm_campaign");

  // Stash utms + lead source so the hidden field block can read them.
  if (utmSource) sessionStorage.setItem("ies_utm_source", utmSource);
  if (utmMedium) sessionStorage.setItem("ies_utm_medium", utmMedium);
  if (utmCampaign) sessionStorage.setItem("ies_utm_campaign", utmCampaign);

  // Prefer the parent page URL when embedded so the enquiry records where the
  // visitor actually came from (the WordPress contact page), not the iframe.
  const recordedUrl = parentUrl?.href ?? window.location.href;
  const recordedPath = parentUrl?.pathname ?? window.location.pathname;

  return {
    type: "external_form_submission",
    timestamp: Date.now(),
    formId: TRACKING_IDS.formId,
    formData: {
      lead_source: leadSource,
    },
    formLabels: {
      lead_source: "Lead Source",
    },
    url: recordedUrl,
    title: document.title,
    path: recordedPath,
    userAgent: navigator.userAgent,
    trackingId: TRACKING_IDS.trackingId,
    locationId: TRACKING_IDS.locationId,
    projectId: TRACKING_IDS.projectId,
    sessionId: crypto.randomUUID(),
    properties: {
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop",
      source: "ai_studio",
      projectId: TRACKING_IDS.projectId,
      formName: TRACKING_IDS.formName,
    },
  };
};

export const getHiddenValues = () => {
  return {
    leadSource: "Website Enquiry Form",
    utmSource:
      readUtm("utm_source") || sessionStorage.getItem("ies_utm_source") || "",
    utmMedium:
      readUtm("utm_medium") || sessionStorage.getItem("ies_utm_medium") || "",
    utmCampaign:
      readUtm("utm_campaign") ||
      sessionStorage.getItem("ies_utm_campaign") ||
      "",
  };
};
