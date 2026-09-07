import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Upload, X, FileText } from "lucide-react";
import type { FieldDef } from "@/lib/formConfig";

interface FieldProps {
  field: FieldDef;
  value: string | string[] | File[];
  error?: string;
  onChange: (value: string | File[]) => void;
}

export const FormField = ({ field, value, error, onChange }: FieldProps) => {
  const fieldId = `field-${field.key}`;
  const errorId = `${fieldId}-error`;
  const describedBy = error
    ? errorId
    : field.hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className={field.full ? "sm:col-span-2" : "sm:col-span-1"}>
      <Label
        htmlFor={fieldId}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      {field.type === "text" && (
        <Input
          id={fieldId}
          value={(value as string) || ""}
          placeholder={field.placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          id={fieldId}
          value={(value as string) || ""}
          placeholder={field.placeholder}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "select" && (
        <Select
          value={(value as string) || ""}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="w-full bg-white"
          >
            <SelectValue
              placeholder={
                field.options?.length
                  ? `Select ${field.label.toLowerCase()}`
                  : "Select..."
              }
            />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "file" && (
        <FileInput
          field={field}
          value={(value as File[]) || []}
          onChange={(files) => onChange(files)}
          errorId={describedBy}
        />
      )}

      {field.hint && !error && (
        <p
          id={`${fieldId}-hint`}
          className="mt-1 text-xs text-muted-foreground"
        >
          {field.hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
};

interface FileInputProps {
  field: FieldDef;
  value: File[];
  onChange: (files: File[]) => void;
  errorId?: string;
}

const FileInput = ({ field, value, onChange, errorId }: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const acceptedTypes = (field.accept || "").split(",").filter(Boolean);
  const maxFiles = field.maxFiles || 1;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((f) => {
      if (!field.accept) return true;
      const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
      const typeOk =
        acceptedTypes.includes(ext) ||
        acceptedTypes.some((a) => f.type === a.replace(".", "image/")) ||
        acceptedTypes.some((a) => f.type === a.replace(".", "application/"));
      return typeOk;
    });

    const combined = [...(value || []), ...next].slice(0, maxFiles);
    onChange(combined);
  };

  const removeFile = (index: number) => {
    const next = (value || []).filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-describedby={errorId}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/40 hover:bg-muted"
        }`}
      >
        <Upload className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium text-foreground">
          Click to upload or drag and drop
        </span>
        <span className="mt-0.5 text-xs text-muted-foreground">
          {field.accept
            ? "PDF, PNG, JPEG, JPG, DOCX, DOC, XLSX, XLS or CSV"
            : "Any file type"}
          {field.multiple ? ` (up to ${maxFiles} files)` : ""}
        </span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={field.accept}
          multiple={field.multiple}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value && value.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {value.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-foreground">
                <FileText
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface ProgressIndicatorProps {
  percent: number;
}

export const ProgressIndicator = ({ percent }: ProgressIndicatorProps) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="mb-6" aria-label={`${pct} percent complete`}>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Your progress</span>
        <span className="tabular-nums text-primary">{pct}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

interface StepHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export const StepHeader = ({
  eyebrow,
  title,
  description,
}: StepHeaderProps) => (
  <div className="mb-6">
    {eyebrow && (
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
    )}
    <h2 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
      {title}
    </h2>
    {description && (
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    )}
  </div>
);

interface StepIndicatorProps {
  steps: { label: string }[];
  current: number;
  highestCompleted: number;
  onJump?: (index: number) => void;
}

export const StepIndicator = ({
  steps,
  current,
  highestCompleted,
  onJump,
}: StepIndicatorProps) => {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="mx-auto flex max-w-xs items-center sm:max-w-sm">
        {steps.map((step, i) => {
          const isComplete = i < highestCompleted || i < current;
          const isActive = i === current;
          const reachable = i <= highestCompleted;
          const number = i + 1;

          return (
            <li
              key={step.label}
              className="flex flex-1 items-center last:flex-none"
            >
              <button
                type="button"
                disabled={!reachable || !onJump}
                onClick={() => reachable && onJump?.(i)}
                className={`group flex flex-col items-center gap-2 outline-none ${
                  reachable && onJump ? "cursor-pointer" : "cursor-default"
                }`}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${number}: ${step.label}${
                  isComplete ? ", complete" : ""
                }${isActive ? ", current" : ""}`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-base font-semibold transition-colors sm:h-10 sm:w-10 sm:text-sm ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isComplete
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-muted-foreground"
                  }`}
                >
                  {isComplete && !isActive ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    number
                  )}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={`mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2 ${
                    i < current ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <ol className="mt-2 flex sm:hidden">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={`flex-1 text-center text-[10px] font-medium ${
              i === current ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {step.label}
          </li>
        ))}
      </ol>
    </nav>
  );
};
