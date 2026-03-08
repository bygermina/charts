import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

import styles from './labeled-input.module.scss';

interface LabeledInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  id?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  ariaDescribedBy?: string;
}

export const LabeledInput = ({
  label,
  id,
  className,
  labelClassName,
  inputClassName,
  ariaDescribedBy,
  type = 'text',
  ...inputProps
}: LabeledInputProps) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const inputVariant = type === 'range' ? styles.inputRange : styles.inputText;

  return (
    <div className={className}>
      <label htmlFor={inputId} className={cn(styles.label, labelClassName)}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}
        {...inputProps}
        className={cn(styles.input, inputVariant, inputClassName)}
      />
    </div>
  );
};
