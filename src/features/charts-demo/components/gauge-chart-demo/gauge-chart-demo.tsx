import { useState } from 'react';

import { GaugeChart, ResponsiveChartWrapper } from '@/entities/chart';
import { clamp } from '@/shared/lib/utils';
import { LabeledInput } from '@/shared/ui';

import styles from './gauge-chart-demo.module.scss';

export const GaugeChartDemo = () => {
  const [value, setValue] = useState<number>(50);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = Number.parseFloat(inputValue);

    if (!Number.isNaN(numValue)) {
      setValue(clamp(numValue, 0, 100));
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
          {() => <GaugeChart value={value} variant="normal" />}
        </ResponsiveChartWrapper>
      </div>
    </div>
  );
};
