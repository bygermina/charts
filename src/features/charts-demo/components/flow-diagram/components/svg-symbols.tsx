export const SvgSymbols = () => (
  <defs>
    <symbol id="pump" viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r="40"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="currentColor"
        fillOpacity="0.025"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <line
        x1="24"
        y1="40"
        x2="56"
        y2="40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="24"
        x2="40"
        y2="56"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </symbol>

    <symbol id="sensor" viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r="40"
        fill="var(--color-background-dark)"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="var(--color-slate-800-50)"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </symbol>

    <symbol id="gas-valve" viewBox="0 0 28 28">
      <path
        d="M 14 0 L 28 14 L 14 28 L 0 14 Z"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line
        x1="4"
        y1="14"
        x2="24"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </symbol>

    <symbol id="flame-drop" viewBox="0 0 24 30">
      <path
        d="M 12 0 Q 8.4 4.5 6 9 Q 4.8 12 12 15 Q 19.2 12 18 9 Q 15.6 4.5 12 0 Z"
        fill="var(--color-red-500-90)"
      />
      <path
        d="M 12 2.4 Q 9.6 6 8.1 9.6 Q 7.5 12 12 14.25 Q 16.5 12 15.9 9.6 Q 14.4 6 12 2.4 Z"
        fill="var(--color-orange-600-95)"
      />
    </symbol>
  </defs>
);
