import { useState } from 'react';

import { GaugeChart } from '@/components/basic/charts/gauge-chart';
import { LabeledInput } from '@/components/basic/input/labeled-input';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <LabeledInput
        label="Value (0-100)"
        type="number"
        min={0}
        max={100}
        value={value.toString()}
        onChange={handleInputChange}
        style={{ width: '200px' }}
      />
      <GaugeChart value={value} width={250} height={200} variant="normal" />
    </div>
  );
};
