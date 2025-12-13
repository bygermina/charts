import { select, type Selection } from 'd3-selection';

export const cleanupSVG = (svg: Selection<SVGSVGElement, unknown, null, undefined>): void => {
  svg.selectAll('*').interrupt();
  svg.selectAll('*').remove();
};

export const cleanupSVGElement = (svgElement: SVGSVGElement | null): void => {
  if (!svgElement) return;
  const svg = select(svgElement);
  cleanupSVG(svg);
};
