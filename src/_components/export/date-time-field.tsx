import { labelClass } from "@/_styles/text";
import { Input } from "../ui/input";

export function DateTimeField({ label, id, type, value, onChange  }: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <Input id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)} className="bg-input-background h-9" />
    </div>
  );
}
