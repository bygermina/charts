import { useState, type ReactNode } from 'react';

import styles from './toggle-panel.module.scss';

interface TogglePanelProps {
  buttonLabel: string;
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const TogglePanel = ({
  buttonLabel,
  children,
  position = 'top-right',
}: TogglePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={buttonLabel}
        data-position={position}
      >
        {buttonLabel}
      </button>
      {isOpen && (
        <div className={styles.panel} data-position={position}>
          {children}
        </div>
      )}
    </>
  );
};
