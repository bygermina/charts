import { select } from 'd3-selection';

export const cleanupSVGElement = (svgElement: SVGSVGElement | null): void => {
  if (!svgElement) return;
  const svg = select(svgElement);
  svg.selectAll('*').interrupt();
  svg.selectAll('*').remove();
};
