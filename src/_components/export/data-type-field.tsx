import { Database } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

type DataType = {
  id: string;
  label: string;
  formats: string[];
};

type DataTypeFieldProps = {
  dataTypes: DataType[];
  selectedDataTypes: string[];
  onChange: (id: string) => void;
};

export function DataTypeField({ dataTypes, selectedDataTypes, onChange }: DataTypeFieldProps) {
  return(
    <div className="space-y-3">
      <span className="flex items-center gap-2 font-medium">
        <Database className="h-4 w-4 text-ocean-blue" />
        Data Type
      </span>
      <div className="space-y-2">
        {dataTypes.map((type) => (
          <div key={type.id} className="flex items-center space-x-3 py-1">
            <Checkbox
              data-testid={`checkbox-${type.id}`}
              id={type.id}
              checked={selectedDataTypes.includes(type.id)}
              onCheckedChange={() => onChange(type.id)}
            />
            <label htmlFor={type.id} className="cursor-pointer flex-1 font-normal">
              <span>{type.label}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({type.formats.map(f => f.toUpperCase()).join(", ")})
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
