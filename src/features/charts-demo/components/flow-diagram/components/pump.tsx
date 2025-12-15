interface PumpProps {
  x: number;
  y: number;
  color: string;
  rotationSpeed?: number;
}

const RADIUS = 40;
const INNER_RADIUS = 35;
const FILL_OPACITY = 0.05;

export const Pump = ({ x, y, color, rotationSpeed = 0 }: PumpProps) => {
  const rotationDuration = rotationSpeed > 0 ? 360 / rotationSpeed : 0;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={RADIUS}
        fill={color}
        fillOpacity={FILL_OPACITY}
        stroke={color}
        strokeWidth={3}
      />
      <circle
        cx={x}
        cy={y}
        r={INNER_RADIUS}
        fill={color}
        fillOpacity={FILL_OPACITY * 0.5}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.6}
      />
      {rotationSpeed > 0 ? (
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`0 ${x} ${y};360 ${x} ${y}`}
            dur={`${rotationDuration}s`}
            repeatCount="indefinite"
          />
          <line
            x1={x - 16}
            y1={y}
            x2={x + 16}
            y2={y}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1={y - 16}
            x2={x}
            y2={y + 16}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
      ) : (
        <>
          <line
            x1={x - 16}
            y1={y}
            x2={x + 16}
            y2={y}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1={y - 16}
            x2={x}
            y2={y + 16}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
};
