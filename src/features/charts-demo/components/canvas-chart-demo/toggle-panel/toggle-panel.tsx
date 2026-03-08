import { useState, type ReactNode, useId } from 'react';

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
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={buttonLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        data-position={position}
      >
        {buttonLabel}
      </button>
      {isOpen && (
        <div
          id={panelId}
          className={styles.panel}
          role="region"
          aria-label={buttonLabel}
          data-position={position}
        >
          {children}
        </div>
      )}
    </>
  );
};
