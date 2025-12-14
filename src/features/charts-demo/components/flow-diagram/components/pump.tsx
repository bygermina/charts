interface PumpProps {
  x: number;
  y: number;
  label?: string;
  color: string;
  fontSize?: number;
  rotationSpeed?: number;
}

export const Pump = ({ x, y, label, color, fontSize = 12, rotationSpeed = 0 }: PumpProps) => {
  const radius = 40;
  const innerRadius = radius - 5;
  const fillOpacity = 0.05;
  const rotationDuration = rotationSpeed > 0 ? 360 / rotationSpeed : 0;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={3}
      />
      <circle
        cx={x}
        cy={y}
        r={innerRadius}
        fill={color}
        fillOpacity={fillOpacity * 0.5}
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
      {label && (
        <text
          x={x + radius + 8}
          y={y}
          fill="var(--color-slate-300)"
          fontSize={fontSize}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          dominantBaseline="middle"
          fontWeight="500"
        >
          {label}
        </text>
      )}
    </g>
  );
};
