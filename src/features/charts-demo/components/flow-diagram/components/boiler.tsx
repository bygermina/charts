interface BoilerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  waterContainerX: number;
  waterContainerY: number;
  waterContainerWidth: number;
  waterContainerHeight: number;
}

export const Boiler = ({
  x,
  y,
  width,
  height,
  waterContainerX,
  waterContainerY,
  waterContainerWidth,
  waterContainerHeight,
}: BoilerProps) => {
  const centerX = x + width / 2;
  const flameY = y + height - 5;
  const spacing = 35;
  const dropHeight = 15;
  const dropWidth = 12;

  const renderDrop = (dropX: number, dropY: number) => {
    return (
      <g key={`drop-${dropX}`}>
        <path
          d={`M ${dropX} ${dropY - dropHeight} 
              Q ${dropX - dropWidth * 0.3} ${dropY - dropHeight * 0.7} ${dropX - dropWidth * 0.5} ${dropY - dropHeight * 0.3}
              Q ${dropX - dropWidth * 0.4} ${dropY} ${dropX} ${dropY + dropHeight * 0.2}
              Q ${dropX + dropWidth * 0.4} ${dropY} ${dropX + dropWidth * 0.5} ${dropY - dropHeight * 0.3}
              Q ${dropX + dropWidth * 0.3} ${dropY - dropHeight * 0.7} ${dropX} ${dropY - dropHeight}
              Z`}
          fill="var(--color-red-500-90)"
        />
        <path
          d={`M ${dropX} ${dropY - dropHeight * 0.8} 
              Q ${dropX - dropWidth * 0.2} ${dropY - dropHeight * 0.5} ${dropX - dropWidth * 0.3} ${dropY - dropHeight * 0.2}
              Q ${dropX - dropWidth * 0.25} ${dropY} ${dropX} ${dropY + dropHeight * 0.15}
              Q ${dropX + dropWidth * 0.25} ${dropY} ${dropX + dropWidth * 0.3} ${dropY - dropHeight * 0.2}
              Q ${dropX + dropWidth * 0.2} ${dropY - dropHeight * 0.5} ${dropX} ${dropY - dropHeight * 0.8}
              Z`}
          fill="var(--color-orange-600-95)"
        />
      </g>
    );
  };

  const drop1X = centerX - spacing;
  const drop2X = centerX;
  const drop3X = centerX + spacing;

  const gradientId = `water-gradient-${x}-${y}`;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--color-blue-400)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-red-500)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={18}
        fill="var(--color-slate-800)"
        stroke="var(--color-slate-600)"
        strokeWidth={2}
      />
      <rect
        x={waterContainerX}
        y={waterContainerY}
        width={waterContainerWidth}
        height={waterContainerHeight}
        rx={12}
        fill={`url(#${gradientId})`}
        stroke="var(--color-cyan-400-50)"
        strokeWidth={2}
      />
      {renderDrop(drop1X, flameY)}
      {renderDrop(drop2X, flameY)}
      {renderDrop(drop3X, flameY)}
    </g>
  );
};
