import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StepHeader } from "@/components/enquiry/FormField";
import { SERVICE_OPTIONS, SERVICE_KEY } from "@/lib/formConfig";

interface StepTriggerProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export const StepTrigger = ({ value, error, onChange }: StepTriggerProps) => {
  return (
    <div>
      <StepHeader
        title="What do you need help with?"
        description="Tell us what's going on and we'll get back to you as soon as possible."
      />

      <div>
        <Label
          htmlFor={SERVICE_KEY}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Service type
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger
            id={SERVICE_KEY}
            aria-invalid={!!error}
            aria-describedby={error ? `${SERVICE_KEY}-error` : undefined}
            className="w-full bg-white"
          >
            <SelectValue placeholder="Select a service..." />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p
            id={`${SERVICE_KEY}-error`}
            role="alert"
            className="mt-1 text-xs font-medium text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
