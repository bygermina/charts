import { type ReactNode } from 'react';

import { Typography } from '@/components/basic/typography/typography';
import { Card } from '@/components/basic/card/card';

import styles from './chart-container.module.scss';

interface ChartContainerProps {
  header: string;
  subtitle: string;
  children: ReactNode;
}

export const ChartContainer = ({ header, subtitle, children }: ChartContainerProps) => {
  return (
    <Card>
      <div className={styles.chartHeader}>
        <Typography variant="h3" size="lg" weight="bold" className={styles.chartTitle}>
          {header}
        </Typography>
        <Typography variant="caption" size="sm" color="muted" className={styles.chartSubtitle}>
          {subtitle}
        </Typography>
      </div>
      <div className={styles.chart}>{children}</div>
    </Card>
  );
};
