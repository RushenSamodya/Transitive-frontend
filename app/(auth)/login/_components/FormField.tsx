import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  Icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ id, label, Icon, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-700 text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        {children}
      </div>
      {error && (
        <p className="text-xs text-red-600 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
