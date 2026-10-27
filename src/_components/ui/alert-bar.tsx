import { AlertTriangle } from 'lucide-react';
import { BarProps } from 'recharts';

interface AlertBarProps extends BarProps {
  // 'value' is provided by recharts for each bar, but isn't part of the default BarProps type
  value?: number; // marked optional to prevent TS errors while recharts injects it automatically
}

export const AlertBar = (props: AlertBarProps) => {
  const { x = 0, y, height, value, index } = props;

  if (!value || value === 0) return null;

  return (
    <g data-testid={`alert-bar-${String(index)}`}>
      <rect
        x={x}
        y={y}
        width={6}
        height={height}
        opacity={0.5}
        rx={0.25}
        fill="var(--amber)"
      />
      <foreignObject x={(x as number) - 6} y={y} width={22} height={22}>
        <div className="flex justify-center items-center">
          <AlertTriangle className="h-6 w-6 text-amber-500" fill="white" />
        </div>
      </foreignObject>
    </g>
  );
};
