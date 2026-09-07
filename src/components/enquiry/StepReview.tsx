import { Check, Pencil } from "lucide-react";
import { StepHeader } from "@/components/enquiry/FormField";
import {
  ADDITIONAL_MESSAGE_FIELD,
  BRANCHES,
  FIELD_LABELS,
} from "@/lib/formConfig";
import type { ContactValues } from "@/components/enquiry/StepContact";

export type FieldValues = Record<string, string | File[]>;

interface StepReviewProps {
  service: string;
  detailValues: FieldValues;
  contact: ContactValues;
  onEdit: (stepIndex: number) => void;
}

const formatValue = (value: string | File[] | undefined): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "None uploaded";
    return value.map((f) => f.name).join(", ");
  }
  return String(value);
};

const isFieldVisible = (service: string, key: string): boolean => {
  const branch = BRANCHES[service];
  if (!branch) return false;
  return (
    branch.fields.some((f) => f.key === key) ||
    key === ADDITIONAL_MESSAGE_FIELD.key
  );
};

export const StepReview = ({
  service,
  detailValues,
  contact,
  onEdit,
}: StepReviewProps) => {
  const branch = BRANCHES[service];

  const detailRows = branch
    ? [
        { key: "service", label: FIELD_LABELS.service, value: service },
        ...branch.fields.map((f) => ({
          key: f.key,
          label: FIELD_LABELS[f.key] ?? f.label,
          value: detailValues[f.key],
        })),
        {
          key: ADDITIONAL_MESSAGE_FIELD.key,
          label: ADDITIONAL_MESSAGE_FIELD.label,
          value: detailValues[ADDITIONAL_MESSAGE_FIELD.key],
        },
      ]
    : [];

  const contactRows = [
    {
      key: "firstName",
      label: "Name",
      value: `${contact.firstName} ${contact.lastName}`.trim(),
    },
    { key: "email", label: "Email", value: contact.email },
    { key: "phone", label: "Phone", value: contact.phone },
    {
      key: "streetAddress",
      label: "Address",
      value:
        [
          contact.streetAddress,
          contact.city,
          contact.region,
          contact.postalCode,
          contact.country,
        ]
          .filter(Boolean)
          .join(", ") || "Not provided",
    },
    {
      key: "hearAboutUs",
      label: "How did you hear about us",
      value: contact.hearAboutUs,
    },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Review"
        title="Check your answers before you submit"
        description="A quick look over your enquiry so nothing is missed. Use Edit to change anything before you send it through."
      />

      <div className="space-y-6">
        <ReviewSection
          title={service}
          onEdit={() => onEdit(1)}
          rows={detailRows.map((r) => ({
            label: r.label,
            value: formatValue(r.value as string | File[] | undefined),
            hidden:
              r.key === "service" || isFieldVisible(service, r.key)
                ? false
                : true,
          }))}
        />

        <ReviewSection
          title="Your contact details"
          onEdit={() => onEdit(2)}
          rows={contactRows.map((r) => ({ label: r.label, value: r.value }))}
        />
      </div>
    </div>
  );
};

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  rows: { label: string; value: string; hidden?: boolean }[];
}

const ReviewSection = ({ title, onEdit, rows }: ReviewSectionProps) => (
  <section className="rounded-lg border border-border bg-white">
    <header className="flex items-center justify-between border-b border-border px-5 py-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h3>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    </header>
    <dl className="divide-y divide-border">
      {rows
        .filter((r) => !r.hidden && r.value)
        .map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="text-sm font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="whitespace-pre-wrap break-words text-sm text-foreground sm:col-span-2">
              {row.value}
            </dd>
          </div>
        ))}
    </dl>
  </section>
);

interface StepSuccessProps {
  service: string;
  onRestart: () => void;
}

export const StepSuccess = ({ service, onRestart }: StepSuccessProps) => (
  <div className="py-8 text-center">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Check className="h-8 w-8" />
    </div>
    <h2 className="text-2xl font-semibold text-foreground">
      Thanks, your {service.toLowerCase()} enquiry is in safe hands
    </h2>
    <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
      A real person on our team will look over your details today and call you
      back to talk through options, pricing and timing. Keep an eye on your
      phone and inbox over the next business day.
    </p>
    <div className="mt-8 inline-flex rounded-lg border border-border bg-white px-5 py-4 text-left">
      <p className="text-sm text-muted-foreground">
        Need to start again for a different job?
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="ml-3 text-sm font-medium text-primary hover:text-primary/80"
      >
        Submit another enquiry
      </button>
    </div>
  </div>
);
