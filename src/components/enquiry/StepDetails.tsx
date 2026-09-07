import { useMemo } from "react";
import {
  ADDITIONAL_MESSAGE_FIELD,
  BRANCHES,
  type FieldDef,
} from "@/lib/formConfig";
import { FormField, ProgressIndicator } from "@/components/enquiry/FormField";

export interface FieldErrors {
  [key: string]: string | undefined;
}

export type FieldValues = Record<string, string | File[]>;

interface StepDetailsProps {
  service: string;
  values: FieldValues;
  errors: FieldErrors;
  onChange: (key: string, value: string | File[]) => void;
}

export const StepDetails = ({
  service,
  values,
  errors,
  onChange,
}: StepDetailsProps) => {
  const branch = BRANCHES[service];

  const completedRatio = useMemo(() => {
    if (!branch) return 0;
    const required = branch.fields.filter((f) => f.required);
    if (!required.length) return 1;
    const done = required.filter((f) => {
      const v = values[f.key];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && String(v).trim() !== "";
    }).length;
    return done / required.length;
  }, [branch, values]);

  if (!branch) {
    return null;
  }

  const renderField = (field: FieldDef) => (
    <FormField
      key={field.key}
      field={field}
      value={values[field.key] || (field.type === "file" ? [] : "")}
      error={errors[field.key]}
      onChange={(value) => onChange(field.key, value)}
    />
  );

  return (
    <div>
      <div className="mb-6">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          You selected
        </p>
        <h2 className="text-2xl font-bold leading-tight text-primary sm:text-3xl">
          {service}
        </h2>
        <p className="mt-2 text-base font-medium text-foreground">
          {branch.title}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The details you give us here let our team prepare the right advice
          before they call you back.
        </p>
      </div>

      {branch.showProgress && (
        <ProgressIndicator percent={completedRatio * 100} />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {branch.fields.map(renderField)}

        <div className="sm:col-span-2">
          {renderField(ADDITIONAL_MESSAGE_FIELD)}
        </div>
      </div>
    </div>
  );
};
