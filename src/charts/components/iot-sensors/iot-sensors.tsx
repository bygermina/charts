import { useState } from 'react';

import { LabeledInput } from '@/components/basic/input/labeled-input';
import { IoTSensor, ResponsiveChartWrapper } from '@/components/basic/charts';

import styles from './iot-sensors.module.scss';

const INITIAL_VALUE = 420;
const MIN = 300;
const MAX = 1000;
const LABEL = 'CO₂';
const UNIT = 'ppm';

export const IoTSensors = () => {
  const [value, setValue] = useState<number>(INITIAL_VALUE);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = Number.parseFloat(inputValue);

    if (!Number.isNaN(numValue)) {
      setValue(Math.max(MIN, Math.min(MAX, numValue)));
    } else if (inputValue === '') {
      setValue(MIN);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sensorCard}>
        <div className={styles.inputWrapper}>
          <LabeledInput
            label={LABEL}
            type="number"
            min={MIN}
            max={MAX}
            step={1}
            value={value.toString()}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveChartWrapper>
            {() => <IoTSensor value={value} label={LABEL} unit={UNIT} min={MIN} max={MAX} />}
          </ResponsiveChartWrapper>
        </div>
      </div>
    </div>
  );
};
