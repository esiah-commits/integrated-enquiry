import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepHeader } from "@/components/enquiry/FormField";
import { HEAR_ABOUT_OPTIONS } from "@/lib/formConfig";

export interface ContactValues {
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
}

export interface ContactErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  hearAboutUs?: string;
}

interface StepContactProps {
  values: ContactValues;
  errors: ContactErrors;
  onChange: <K extends keyof ContactValues>(
    key: K,
    value: ContactValues[K],
  ) => void;
}

export const StepContact = ({ values, errors, onChange }: StepContactProps) => {
  return (
    <div>
      <StepHeader
        eyebrow="Contact"
        title="Where can we reach you?"
        description="We only use these details to follow up on your enquiry. No marketing lists, no spam."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldWrap
          id="firstName"
          label="First name"
          required
          error={errors.firstName}
        >
          <Input
            id="firstName"
            value={values.firstName}
            aria-invalid={!!errors.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            autoComplete="given-name"
          />
        </FieldWrap>

        <FieldWrap
          id="lastName"
          label="Last name"
          required
          error={errors.lastName}
        >
          <Input
            id="lastName"
            value={values.lastName}
            aria-invalid={!!errors.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            autoComplete="family-name"
          />
        </FieldWrap>

        <FieldWrap id="email" label="Email" required error={errors.email}>
          <Input
            id="email"
            type="email"
            value={values.email}
            aria-invalid={!!errors.email}
            onChange={(e) => onChange("email", e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </FieldWrap>

        <FieldWrap id="phone" label="Phone" required error={errors.phone}>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            aria-invalid={!!errors.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            autoComplete="tel"
            placeholder="021 234 5678"
          />
        </FieldWrap>

        <div className="sm:col-span-2">
          <FieldWrap
            id="streetAddress"
            label="Street Address"
            required
            error={undefined}
          >
            <Input
              id="streetAddress"
              value={values.streetAddress}
              onChange={(e) => onChange("streetAddress", e.target.value)}
              autoComplete="street-address"
              placeholder="Address"
            />
          </FieldWrap>
        </div>

        <FieldWrap id="city" label="City" required error={undefined}>
          <Input
            id="city"
            value={values.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="City"
          />
        </FieldWrap>

        <FieldWrap id="region" label="Region" required error={undefined}>
          <Input
            id="region"
            value={values.region || ""}
            onChange={(e) => onChange("region", e.target.value)}
            placeholder="State"
          />
        </FieldWrap>

        <FieldWrap id="country" label="Country" required error={undefined}>
          <Input
            id="country"
            value={values.country || "New Zealand"}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="Country"
          />
        </FieldWrap>

        <FieldWrap
          id="postalCode"
          label="Postal Code"
          required
          error={undefined}
        >
          <Input
            id="postalCode"
            value={values.postalCode || ""}
            onChange={(e) => onChange("postalCode", e.target.value)}
            placeholder="Postal Code"
          />
        </FieldWrap>

        <FieldWrap
          id="hearAboutUs"
          label="How did you hear about us?"
          error={errors.hearAboutUs}
        >
          <Select
            value={values.hearAboutUs || ""}
            onValueChange={(v) => onChange("hearAboutUs", v)}
          >
            <SelectTrigger
              id="hearAboutUs"
              aria-invalid={!!errors.hearAboutUs}
              className="w-full bg-white"
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {HEAR_ABOUT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrap>
      </div>
    </div>
  );
};

interface FieldWrapProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const FieldWrap = ({
  id,
  label,
  required,
  error,
  hint,
  children,
}: FieldWrapProps) => (
  <div>
    <Label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
    {children}
    {hint && !error && (
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    )}
    {error && (
      <p role="alert" className="mt-1 text-xs font-medium text-destructive">
        {error}
      </p>
    )}
  </div>
);
