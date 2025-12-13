import type { ScaleLinear } from 'd3-scale';
import type { Selection } from 'd3-selection';

import type { BarDataPoint } from '../../../model/types';

const updateBarPosition = (
  selection: Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>,
  yScale: ScaleLinear<number, number>,
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
  barsEnter: Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsUpdate: Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsExit: Selection<SVGRectElement, unknown, SVGGElement, unknown>;
  yScale: ScaleLinear<number, number>;
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
