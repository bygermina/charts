// Common chart constants
export const CHART_FONT_SIZE = '12px';
export const CHART_FONT_FAMILY = 'Arial, sans-serif';

export const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

// Axis constants
export const DEFAULT_X_AXIS_TICKS = 5;
export const DEFAULT_Y_AXIS_TICKS = 5;

// Scale constants
export const Y_SCALE_PADDING_MULTIPLIER = 1.1; // Adds 10% padding to top of Y axis

// Bar chart constants
export const BAR_WIDTH_RATIO = 0.8; // Width of bar relative to available space between bars
export const BAR_GAP = 2; // Gap between bars in pixels
export const BAR_ANIMATION_DURATION = 800;
export const BAR_ANIMATION_DELAY = 50;
export const BAR_OPACITY = 0.6;
export const BAR_BORDER_RADIUS = 2;
export const GRADIENT_START_OPACITY = 0.7;
export const GRADIENT_END_OPACITY = 0.4;
export const BAR_GRADIENT_ID = 'bar-gradient';

// Gauge chart constants
export const GAUGE_RADIUS = 80;
export const GAUGE_START_ANGLE = -Math.PI;
export const GAUGE_END_ANGLE = 0;
export const GAUGE_TICK_COUNT = 11;
export const GAUGE_NEEDLE_LENGTH = 60;
export const GAUGE_NEEDLE_WIDTH = 3;
export const GAUGE_LABEL_OFFSET = 15;
export const GAUGE_PADDING = 30;
export const GAUGE_VIEWBOX_WIDTH = (GAUGE_RADIUS + GAUGE_LABEL_OFFSET + GAUGE_PADDING) * 2;
export const GAUGE_VIEWBOX_HEIGHT = GAUGE_VIEWBOX_WIDTH * 0.7;
export const GAUGE_CENTER = GAUGE_VIEWBOX_WIDTH / 2;

// Utility constants
export const DEBOUNCE_DELAY = 150;
export const DEFAULT_CHART_SIZE = { width: 600, height: 250 };
