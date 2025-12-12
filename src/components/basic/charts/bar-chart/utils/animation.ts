import * as d3 from 'd3';

import type { BarDataPoint } from '../../shared/types';

const updateBarPosition = (
  selection: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>,
  yScale: d3.ScaleLinear<number, number>,
  chartHeight: number,
): void => {
  selection.attr('y', (d) => yScale(d.value)).attr('height', (d) => chartHeight - yScale(d.value));
};

export const updateBars = ({
  barsEnter,
  barsUpdate,
  barsExit,
  yScale,
  chartHeight,
}: {
  barsEnter: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsUpdate: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsExit: d3.Selection<SVGRectElement, unknown, SVGGElement, unknown>;
  yScale: d3.ScaleLinear<number, number>;
  chartHeight: number;
}): void => {
  const barsEnterData = barsEnter.data() as BarDataPoint[];
  if (barsEnterData.length > 0) {
    const maxTime = Math.max(...barsEnterData.map((d) => d.time));
    const otherBars = barsEnter.filter((d) => d.time !== maxTime);

    updateBarPosition(otherBars, yScale, chartHeight);
  }

  const enterNodes = new Set(barsEnter.nodes());
  const barsToUpdate = barsUpdate.filter((_d, i, nodes) => !enterNodes.has(nodes[i]));
  updateBarPosition(barsToUpdate, yScale, chartHeight);

  barsExit.interrupt().remove();
};
