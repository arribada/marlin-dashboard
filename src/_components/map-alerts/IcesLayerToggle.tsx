import { Switch } from "../ui/switch";

interface IcesLayerToggleProps {
  showIcesAreas: boolean;
  onIcesAreasChange: (checked: boolean) => void;
}

export default function IcesLayerToggle({
  showIcesAreas,
  onIcesAreasChange,
}: IcesLayerToggleProps) {
  return (
    <div className="flex gap-6">
      <div className="flex items-center space-x-3">
        <Switch
          data-testid="ices-toggle"
          id="ices-toggle"
          checked={showIcesAreas}
          onCheckedChange={onIcesAreasChange}
        />
        <label htmlFor="ices-toggle" className="text-sm font-medium cursor-pointer">
          Show ICES Areas
        </label>
      </div>
    </div>
  );
}
