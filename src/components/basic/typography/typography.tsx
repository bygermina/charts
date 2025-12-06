import { forwardRef, type ElementType } from 'react';
import { cn } from '@/utils/cn';

import styles from './typography.module.scss';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'subheading' | 'body' | 'caption' | 'label';

export type TypographySize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export type TypographyWeight = 'normal' | 'medium' | 'bold' | 'extrabold';

export interface TypographyProps {
  variant?: TypographyVariant;
  size?: TypographySize;
  weight?: TypographyWeight;
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'accent';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  lineClamp?: number;
  as?: ElementType;
  className?: string;
  children: React.ReactNode;
}

const variantToTag: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  subheading: 'p',
  body: 'p',
  caption: 'span',
  label: 'label',
};

export const Typography = forwardRef<
  HTMLElement,
  TypographyProps & React.HTMLAttributes<HTMLElement>
>(
  (
    {
      variant = 'body',
      size,
      weight,
      color = 'default',
      align,
      truncate = false,
      lineClamp,
      as,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Tag = (as || variantToTag[variant]) as ElementType;

    const classes = cn(
      styles.typography,
      styles[`typography-${variant}`],
      size && styles[`typography-size-${size}`],
      weight && styles[`typography-weight-${weight}`],
      styles[`typography-color-${color}`],
      align && styles[`typography-align-${align}`],
      truncate && styles.typographyTruncate,
      lineClamp && styles[`typographyLineClamp-${lineClamp}`],
      className,
    );

    return (
      <Tag ref={ref} className={classes} {...props}>
        {children}
      </Tag>
    );
  },
);

Typography.displayName = 'Typography';
