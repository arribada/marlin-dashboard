import { AlertCircle } from 'lucide-react';
import { BarProps } from 'recharts';

interface BycatchBarProps extends BarProps {
  // 'value' is provided by recharts for each bar, but isn't part of the default BarProps type
  value?: number; // marked optional to prevent TS errors while recharts injects it automatically
}

export const BycatchBar = (props: BycatchBarProps) => {
  const { x = 0, y, height, value, index } = props;

  if (!value || value === 0) return null;

  return (
    <g data-testid={`bycatch-bar-${String(index)}`}>
      <rect
        x={x}
        y={y}
        width={6}
        height={height}
        opacity={0.5}
        rx={0.25}
        fill="var(--destructive)"
      />
      <foreignObject x={(x as number) - 6} y={y} width={22} height={22}>
        <div className="flex justify-center items-center">
          <AlertCircle className="h-6 w-6 text-destructive" fill="white" />
        </div>
      </foreignObject>
    </g>
  );
};
