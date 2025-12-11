import { type ReactNode } from 'react';

import { Typography } from '@/components/basic/typography/typography';
import { Card } from '@/components/basic/card/card';

import styles from './chart-container.module.scss';
import { cn } from '@/utils/cn';

interface ChartContainerProps {
  header: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

export const ChartContainer = ({ header, subtitle, children, className }: ChartContainerProps) => {
  return (
    <Card className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <Typography variant="h3" size="lg" weight="bold" className={styles.chartTitle}>
          {header}
        </Typography>
        <Typography variant="caption" size="sm" color="muted">
          {subtitle}
        </Typography>
      </div>
      <div className={cn(styles.chart, className)}>{children}</div>
    </Card>
  );
};
