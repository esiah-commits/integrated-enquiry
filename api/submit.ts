// Vercel serverless function for the Integrated Electrical & Solar enquiry form.
//
// Receives the enquiry payload from the form, upserts a contact, uploads any
// attached files to media storage, then creates an opportunity with every
// custom field written directly to the OPPORTUNITY (not the contact).
//
// Required environment variables (set in Vercel Project Settings > Environment Variables):
//   GHL_API_KEY            Bearer access token for the CRM API (private integration key)
//   GHL_PIPELINE_ID        Pipeline to create the opportunity in
//   GHL_PIPELINE_STAGE_ID  Starting pipeline stage id
//   GHL_LOCATION_ID        (optional) overrides the hardcoded location id
//   ALLOWED_ORIGINS        (optional) comma-separated origins allowed to call this endpoint

const LOCATION_ID = process.env.GHL_LOCATION_ID || "rg9lQrkWzxUgMm9XuL4C";
const API_BASE = "https://services.leadconnectorhq.com";

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.GHL_API_KEY}`,
  Accept: "application/json",
  Version: "2021-07-28",
});

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

interface EnquiryPayload {
  contact: ContactPayload;
  opportunityName: string;
  customFields: CustomField[];
  files: FilePayload[];
}

export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Optional origin allowlist to stop random abuse of the public endpoint.
  const allowed = process.env.ALLOWED_ORIGINS;
  if (allowed) {
    const origin = req.headers.get("origin") || "";
    const list = allowed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (origin && !list.includes(origin) && !list.includes("*")) {
      return json({ error: "Origin not allowed" }, 403);
    }
  }

  if (
    !process.env.GHL_API_KEY ||
    !process.env.GHL_PIPELINE_ID ||
    !process.env.GHL_PIPELINE_STAGE_ID
  ) {
    return json({ error: "Server is missing required configuration." }, 500);
  }

  let body: EnquiryPayload;
  try {
    body = (await req.json()) as EnquiryPayload;
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (!body.contact?.email || !body.contact?.phone) {
    return json({ error: "Contact email and phone are required." }, 400);
  }

  try {
    // 1. Upsert the contact (creates or updates by email/phone) and get its id.
    const contactId = await upsertContact(body.contact);

    // 2. Upload files to media storage and collect the hosted URLs per field.
    const fileUrlsByField: Record<string, string[]> = {};
    for (const f of body.files || []) {
      try {
        const url = await uploadMedia(f);
        (fileUrlsByField[f.fieldId] ||= []).push(url);
      } catch {
        // A single failed upload should not block the whole enquiry.
      }
    }
    const fileCustomFields: CustomField[] = Object.entries(fileUrlsByField).map(
      ([id, urls]) => ({ id, value: urls.join("\n") }),
    );

    // 3. Create the opportunity with all custom fields on the opportunity record.
    const allCustomFields = [...body.customFields, ...fileCustomFields];
    const opportunityId = await createOpportunity(
      contactId,
      body.opportunityName,
      allCustomFields,
    );

    return json({ success: true, opportunityId, contactId }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create opportunity.";
    return json({ error: msg }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

async function upsertContact(c: ContactPayload): Promise<string> {
  const res = await fetch(`${API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      firstName: c.firstName,
      lastName: c.lastName,
      name: `${c.firstName} ${c.lastName}`.trim(),
      email: c.email,
      phone: c.phone,
      locationId: LOCATION_ID,
      address1: c.address1,
      city: c.city,
      state: c.state,
      country: c.country,
      postalCode: c.postalCode,
      companyName: c.companyName,
      source: "Website Enquiry Form",
    }),
  });
  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Contact upsert failed (${res.status}). ${detail}`);
  }
  const data = await res.json();
  const id = data?.contact?.id;
  if (!id) throw new Error("Contact upsert returned no contact id.");
  return id;
}

async function uploadMedia(f: FilePayload): Promise<string> {
  const bytes = Uint8Array.from(atob(f.dataBase64), (ch) => ch.charCodeAt(0));
  const blob = new Blob([bytes], {
    type: f.mimeType || "application/octet-stream",
  });
  const form = new FormData();
  form.append("file", blob, f.filename);
  form.append("name", f.filename);
  form.append("hosted", "true");
  const res = await fetch(`${API_BASE}/medias/upload-file`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(`File upload failed (${res.status}).`);
  const data = await res.json();
  const url = data?.url || data?.fileUrl;
  if (!url) throw new Error("File upload returned no url.");
  return url;
}

async function createOpportunity(
  contactId: string,
  name: string,
  customFields: CustomField[],
): Promise<string> {
  const res = await fetch(`${API_BASE}/opportunities/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      pipelineId: process.env.GHL_PIPELINE_ID,
      locationId: LOCATION_ID,
      name,
      pipelineStageId: process.env.GHL_PIPELINE_STAGE_ID,
      status: "open",
      contactId,
      customFields: customFields.map((f) => ({ id: f.id, fieldValue: f.value })),
    }),
  });
  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Opportunity creation failed (${res.status}). ${detail}`);
  }
  const data = await res.json();
  const id = data?.opportunity?.id || data?.id;
  if (!id) throw new Error("Opportunity creation returned no id.");
  return id;
}

async function safeText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t ? t.slice(0, 300) : "";
  } catch {
    return "";
  }
}
