import { useState } from 'react';

import { GaugeChart } from '@/components/basic/charts/gauge-chart/gauge-chart';
import { LabeledInput } from '@/components/basic/input/labeled-input';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';

import styles from './gauge-chart-d3.module.scss';

export const GaugeChartD3 = () => {
  const [value, setValue] = useState<number>(50);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = Number.parseFloat(inputValue);

    if (!Number.isNaN(numValue)) {
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setValue(clampedValue);
    } else if (inputValue === '') {
      setValue(0);
    }
  };

  return (
    <div className={styles.container}>
      <LabeledInput
        label="Value (0-100)"
        type="number"
        min={0}
        max={100}
        value={value.toString()}
        onChange={handleInputChange}
        className={styles.input}
      />
      <div className={styles.chartContainer}>
        <ResponsiveChartWrapper>
          {({ width, height }) => {
            const chartSize = Math.min(width, height || 200);
            const chartWidth = chartSize > 0 ? chartSize : 250;
            const chartHeight = chartSize > 0 ? chartSize : 200;
            return (
              <GaugeChart value={value} width={chartWidth} height={chartHeight} variant="normal" />
            );
          }}
        </ResponsiveChartWrapper>
      </div>
    </div>
  );
};
