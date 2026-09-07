import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { StepTrigger } from "@/components/enquiry/StepTrigger";
import {
  StepDetails,
  type FieldErrors,
  type FieldValues,
} from "@/components/enquiry/StepDetails";
import {
  StepContact,
  type ContactValues,
  type ContactErrors,
} from "@/components/enquiry/StepContact";
import {
  StepReview,
  StepSuccess,
  type FieldValues as ReviewValues,
} from "@/components/enquiry/StepReview";
import { StepIndicator } from "@/components/enquiry/FormField";
import {
  BRANCHES,
  ADDITIONAL_MESSAGE_FIELD,
  FIELD_IDS,
  FIELD_LABELS,
} from "@/lib/formConfig";
import {
  postTrackingEvent,
  buildTrackingPayload,
  getHiddenValues,
} from "@/lib/tracking";
import {
  isProxyEnabled,
  submitToProxy,
  buildOpportunitySubmission,
} from "@/lib/opportunitySubmit";

const STEP_LABELS = [
  { label: "Service" },
  { label: "Details" },
  { label: "Contact" },
  { label: "Review" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

const STORAGE_KEY = "ies_enquiry_draft_v1";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const initialContact: ContactValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  region: "",
  country: "New Zealand",
  postalCode: "",
  hearAboutUs: "",
};

interface DraftState {
  step: number;
  service: string;
  detailValues: Record<string, string>;
  contact: ContactValues;
  highestCompleted: number;
  savedAt: number;
}

const loadDraft = (): DraftState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftState;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const saveDraft = (state: DraftState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable or full, carry on without persistence */
  }
};

const clearDraft = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const EnquiryForm = () => {
  const restored = useRef(loadDraft());

  const [step, setStep] = useState(() =>
    Math.min(3, Math.max(0, restored.current?.step ?? 0)),
  ); // 0..3, 4 = success
  const [service, setService] = useState(() => restored.current?.service ?? "");
  const [serviceError, setServiceError] = useState<string>();

  const [detailValues, setDetailValues] = useState<FieldValues>(
    () => restored.current?.detailValues ?? {},
  );
  const [detailErrors, setDetailErrors] = useState<FieldErrors>({});

  const [contact, setContact] = useState<ContactValues>(
    () => restored.current?.contact ?? initialContact,
  );
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [highestCompleted, setHighestCompleted] = useState(
    () => restored.current?.highestCompleted ?? -1,
  );

  const currentBranch = service ? BRANCHES[service] : undefined;

  // Persist answers so a visitor who closes the tab keeps their progress.
  // File selections cannot be serialised, so they are skipped on restore.
  useEffect(() => {
    if (step === 4) return;
    const serialisableDetails: Record<string, string> = {};
    for (const [key, value] of Object.entries(detailValues)) {
      if (Array.isArray(value)) continue;
      serialisableDetails[key] = String(value ?? "");
    }
    saveDraft({
      step,
      service,
      detailValues: serialisableDetails,
      contact,
      highestCompleted,
      savedAt: Date.now(),
    });
  }, [step, service, detailValues, contact, highestCompleted]);

  const setDetail = useCallback((key: string, value: string | File[]) => {
    setDetailValues((prev) => ({ ...prev, [key]: value }));
    setDetailErrors((prev) => {
      if (!prev[key]) return prev;
      return { ...prev, [key]: undefined };
    });
  }, []);

  const setContactField = useCallback(
    <K extends keyof ContactValues>(key: K, value: ContactValues[K]) => {
      setContact((prev) => ({ ...prev, [key]: value }));
      setContactErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validateService = useCallback(() => {
    if (!service) {
      setServiceError("Please select what you need help with.");
      return false;
    }
    setServiceError(undefined);
    return true;
  }, [service]);

  const validateDetails = useCallback((): boolean => {
    if (!currentBranch) return false;
    const next: FieldErrors = {};
    for (const field of currentBranch.fields) {
      if (!field.required) continue;
      const v = detailValues[field.key];
      const empty = Array.isArray(v)
        ? v.length === 0
        : !v || String(v).trim() === "";
      if (empty) {
        next[field.key] = `${field.label} is required.`;
      }
    }
    setDetailErrors(next);
    return Object.keys(next).length === 0;
  }, [currentBranch, detailValues]);

  const validateContact = useCallback((): boolean => {
    const next: ContactErrors = {};
    if (!contact.firstName.trim())
      next.firstName = "Please enter your first name.";
    if (!contact.lastName.trim())
      next.lastName = "Please enter your last name.";
    if (!contact.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(contact.email.trim()))
      next.email = "Please enter a valid email address.";
    if (!contact.phone.trim()) next.phone = "Please enter your phone number.";
    else if (!PHONE_RE.test(contact.phone.trim()))
      next.phone = "Please enter a valid phone number.";
    setContactErrors(next);
    return Object.keys(next).length === 0;
  }, [contact]);

  const submitEnquiry = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const hidden = getHiddenValues();

      // Direct-to-opportunity path: POST to the Vercel proxy which holds the
      // private API key and writes every custom field straight to the
      // opportunity record. Falls back to the tracking endpoint if the
      // proxy URL is not configured.
      if (isProxyEnabled()) {
        const branchFields = currentBranch
          ? currentBranch.fields.map((f) => ({
              key: f.key,
              type: f.type,
              label: FIELD_LABELS[f.key] ?? f.label,
            }))
          : [];
        const msg = currentBranch
          ? (detailValues[ADDITIONAL_MESSAGE_FIELD.key] as string | undefined)
          : undefined;
        const submission = await buildOpportunitySubmission({
          service,
          detailValues,
          contact,
          hidden,
          branchFields,
          additionalMessage: msg,
        });
        await submitToProxy(submission);
      } else {
        const payload = buildTrackingPayload({ service });

        const customFields: Record<string, { value?: unknown; label: string }> =
          {
            [FIELD_IDS.serviceNeeded]: {
              value: service,
              label: "Service Needed",
            },
            [FIELD_IDS.leadSource]: {
              value: hidden.leadSource,
              label: "Lead Source",
            },
            [FIELD_IDS.utmSource]: {
              value: hidden.utmSource,
              label: "UTM Source",
            },
            [FIELD_IDS.utmMedium]: {
              value: hidden.utmMedium,
              label: "UTM Medium",
            },
            [FIELD_IDS.utmCampaign]: {
              value: hidden.utmCampaign,
              label: "UTM Campaign",
            },
            [FIELD_IDS.howDidYouHearAboutUs]: {
              value: contact.hearAboutUs,
              label: "How Did You Hear About Us",
            },
          };

        const formData = { ...payload.formData } as Record<string, unknown>;
        const formLabels = { ...payload.formLabels } as Record<string, string>;

        // Also put lead_source and service directly in formData for automation rules
        formData.lead_source = hidden.leadSource;
        formData.leadSource = hidden.leadSource;
        formData.service_needed = service;
        formData.serviceNeeded = service;
        formData.service = service;

        const fileFields: Record<
          string,
          { file?: File | File[]; label: string }
        > = {};

        const branch = currentBranch;
        if (branch) {
          for (const field of branch.fields) {
            const v = detailValues[field.key];
            // Business Name maps to the standard organization field.
            if (field.key === "businessName") {
              if (v && String(v).trim() !== "") {
                formData.organization = String(v).trim();
                formLabels.organization = "Business Name";
              }
              continue;
            }
            const fid = detailToFieldId(field.key);
            if (!fid) continue;
            if (field.type === "file") {
              const files = (v as File[] | undefined) || [];
              if (files.length > 0) {
                fileFields[fid] = {
                  file: files,
                  label: FIELD_LABELS[field.key] ?? field.label,
                };
              }
            } else if (
              v !== undefined &&
              v !== null &&
              String(v).trim() !== ""
            ) {
              customFields[fid] = {
                value: v,
                label: FIELD_LABELS[field.key] ?? field.label,
              };
            }
          }
          const msg = detailValues[ADDITIONAL_MESSAGE_FIELD.key];
          if (msg && String(msg).trim() !== "") {
            customFields[FIELD_IDS.additionalMessage] = {
              value: msg,
              label: ADDITIONAL_MESSAGE_FIELD.label,
            };
          }
        }

        const fullName =
          `${contact.firstName.trim()} ${contact.lastName.trim()}`.trim();
        formData.name = fullName;
        formData.first_name = contact.firstName.trim();
        formData.firstName = contact.firstName.trim();
        formData.last_name = contact.lastName.trim();
        formData.lastName = contact.lastName.trim();
        formData.email = contact.email.trim();
        formData.phone = contact.phone.trim();
        if (contact.streetAddress.trim()) {
          formData.address1 = contact.streetAddress.trim();
          formData.address = contact.streetAddress.trim();
        }
        if (contact.city.trim()) formData.city = contact.city.trim();
        if (contact.region.trim()) {
          formData.state = contact.region.trim();
          formData.region = contact.region.trim();
        }
        if (contact.country.trim()) formData.country = contact.country.trim();
        if (contact.postalCode.trim()) {
          formData.postalCode = contact.postalCode.trim();
          formData.postal_code = contact.postalCode.trim();
        }
        formLabels.name = "Full name";
        formLabels.first_name = "First name";
        formLabels.firstName = "First name";
        formLabels.last_name = "Last name";
        formLabels.lastName = "Last name";
        formLabels.email = "Email";
        formLabels.phone = "Phone";
        formLabels.address1 = "Street address";
        formLabels.address = "Street address";

        // Await the submission (including file uploads) so a failure surfaces
        // to the visitor instead of silently showing the success screen.
        await postTrackingEvent(
          { ...payload, formData, formLabels },
          { customFields, fileFields },
        );
      }

      clearDraft();
      setHighestCompleted(3);
      setStep(4);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong sending your enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [submitting, service, currentBranch, detailValues, contact]);

  const goNext = useCallback(() => {
    if (step === 0) {
      if (!validateService()) return;
      setHighestCompleted(0);
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!validateDetails()) return;
      setHighestCompleted(1);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validateContact()) return;
      setHighestCompleted(2);
      setStep(3);
      return;
    }
    if (step === 3) {
      void submitEnquiry();
    }
  }, [step, validateService, validateDetails, validateContact, submitEnquiry]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const jumpTo = useCallback(
    (target: number) => {
      if (target <= highestCompleted) setStep(target);
    },
    [highestCompleted],
  );

  const reset = useCallback(() => {
    clearDraft();
    setStep(0);
    setService("");
    setServiceError(undefined);
    setDetailValues({});
    setDetailErrors({});
    setContact(initialContact);
    setContactErrors({});
    setHighestCompleted(-1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isFirst = step === 0;
  const isReview = step === 3;
  const isSuccess = step === 4;

  const continueLabel = isReview ? "Submit Enquiry" : "Continue";
  const ContinueIcon = isReview ? Send : ChevronRight;

  return (
    <div>
      {!isSuccess && (
        <div className="sticky top-0 z-20 -mx-4 bg-background px-4 py-3 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
          <StepIndicator
            steps={STEP_LABELS}
            current={step}
            highestCompleted={highestCompleted}
            onJump={jumpTo}
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-9">
        {isSuccess ? (
          <StepSuccess service={service} onRestart={reset} />
        ) : (
          <>
            {step === 0 && (
              <StepTrigger
                value={service}
                error={serviceError}
                onChange={(v) => {
                  setService(v);
                  setServiceError(undefined);
                }}
              />
            )}

            {step === 1 && currentBranch && (
              <StepDetails
                service={service}
                values={detailValues}
                errors={detailErrors}
                onChange={setDetail}
              />
            )}

            {step === 2 && (
              <StepContact
                values={contact}
                errors={contactErrors}
                onChange={setContactField}
              />
            )}

            {step === 3 && (
              <StepReview
                service={service}
                detailValues={detailValues as ReviewValues}
                contact={contact}
                onEdit={(target) => setStep(target)}
              />
            )}

            {submitError && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {submitError}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              {!isFirst ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={submitting}
                  className="h-12 bg-white sm:h-10"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <span />
              )}

              <Button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="h-12 min-w-40 sm:h-10"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {continueLabel}
                    <ContinueIcon className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Map form field keys to registered custom field ids.
const detailToFieldId = (key: string): string | undefined => {
  const map: Record<string, string> = {
    solarPropertyType: FIELD_IDS.propertyType,
    solarRoofType: FIELD_IDS.roofType,
    roofAge: FIELD_IDS.roofAge,
    monthlyPowerBill: FIELD_IDS.monthlyPowerBill,
    powerBillFiles: FIELD_IDS.powerBillUpload,
    batteryInterest: FIELD_IDS.batteryInterest,
    evChargingInterest: FIELD_IDS.evChargingInterest,
    homeOwnership: FIELD_IDS.homeOwnership,
    callToDiscussSolar: FIELD_IDS.callToDiscussSolar,
    solarInterests: FIELD_IDS.solarInterests,
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
