import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './card.module.scss';

export interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} className={cn(styles.card, className)} {...props}>
        {children}
      </Component>
    );
  },
);

Card.displayName = 'Card';
