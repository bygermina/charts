import { select } from 'd3-selection';

export const cleanupBarChart = (svgElement: SVGSVGElement | null): void => {
  if (!svgElement) return;

  const svg = select(svgElement);
  svg.selectAll('.bar').interrupt().on('mouseenter', null).on('mouseleave', null);
  svg.selectAll('.bar-tooltip').remove();
};
