import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { getChartColors, type ChartVariant } from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';

import styles from './iot-network-graph.module.scss';

interface IoTNetworkGraphProps {
  width?: number;
  height?: number;
  variant?: ChartVariant;
}

interface Node {
  id: string;
  type: 'gateway' | 'sensor' | 'actuator' | 'server';
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
}

const NODE_RADIUS = {
  server: 14,
  gateway: 12,
  sensor: 10,
  actuator: 10,
} as const;

const NODE_RADIUS_HOVER = {
  server: 18,
  gateway: 16,
  sensor: 14,
  actuator: 14,
} as const;

const getNodeRadius = (type: Node['type']): number => NODE_RADIUS[type] ?? 10;

const getNodeRadiusHover = (type: Node['type']): number => NODE_RADIUS_HOVER[type] ?? 14;

const getNodeColor = (
  type: Node['type'],
  chartColors: ReturnType<typeof getChartColors>,
): string => {
  const colorMap: Record<Node['type'], string> = {
    server: chartColors.primary,
    gateway: chartColors.secondary,
    sensor: chartColors.tertiary,
    actuator: chartColors.quaternary,
  };
  return colorMap[type] ?? chartColors.quaternary;
};

const generateIoTNetwork = (): { nodes: Node[]; links: Link[] } => {
  const nodes: Node[] = [
    { id: 'server-1', type: 'server', label: 'Server' },
    { id: 'gateway-1', type: 'gateway', label: 'Gateway' },
    { id: 'sensor-1', type: 'sensor', label: 'Sensor 1' },
    { id: 'sensor-2', type: 'sensor', label: 'Sensor 2' },
    { id: 'sensor-3', type: 'sensor', label: 'Sensor 3' },
    { id: 'actuator-1', type: 'actuator', label: 'Actuator 1' },
    { id: 'actuator-2', type: 'actuator', label: 'Actuator 2' },
  ];

  const links: Link[] = [
    { source: 'server-1', target: 'gateway-1' },
    { source: 'gateway-1', target: 'sensor-1' },
    { source: 'gateway-1', target: 'sensor-2' },
    { source: 'gateway-1', target: 'sensor-3' },
    { source: 'gateway-1', target: 'actuator-1' },
    { source: 'gateway-1', target: 'actuator-2' },
  ];

  return { nodes, links };
};

const NetworkGraphContent = ({
  width,
  height,
  variant = 'normal',
}: {
  width: number;
  height: number;
  variant?: ChartVariant;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartColors = getChartColors(variant);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0) return;

    const { nodes, links } = generateIoTNetwork();

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const centerX = width / 2;
    const centerY = height / 2;

    // Physics simulation
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(100),
      )
      .force('charge', d3.forceManyBody<Node>().strength(-300))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide<Node>().radius(25));

    // Create links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', chartColors.text)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.4);

    // Create nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, Node>('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Circles for nodes
    node
      .append('circle')
      .attr('r', (d) => getNodeRadius(d.type))
      .attr('fill', (d) => getNodeColor(d.type, chartColors))
      .style('cursor', 'grab')
      .on('mouseenter', function (_event, d) {
        d3.select(this).attr('r', getNodeRadiusHover(d.type));
      })
      .on('mouseleave', function (_event, d) {
        d3.select(this).attr('r', getNodeRadius(d.type));
      });

    // Text labels
    node
      .append('text')
      .text((d) => d.label)
      .attr('dx', 15)
      .attr('dy', 4)
      .attr('font-size', '11px')
      .attr('fill', chartColors.text)
      .attr('pointer-events', 'none')
      .style('user-select', 'none');

    const getNodeById = (id: string | Node): Node => {
      return typeof id === 'string' ? nodes.find((n) => n.id === id)! : id;
    };

    // Update positions during simulation
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => getNodeById(d.source).x ?? 0)
        .attr('y1', (d) => getNodeById(d.source).y ?? 0)
        .attr('x2', (d) => getNodeById(d.target).x ?? 0)
        .attr('y2', (d) => getNodeById(d.target).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Set initial scale
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - centerX, height / 2 - centerY)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);

    return () => {
      simulation.stop();
      svg.on('.zoom', null);
    };
  }, [width, height, chartColors]);

  return (
    <div className={styles.container}>
      <svg ref={svgRef} width={width} height={height} className={styles.svg} />
    </div>
  );
};

export const IoTNetworkGraph = ({
  width,
  height = 300,
  variant = 'normal',
}: IoTNetworkGraphProps) => {
  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }) => (
        <NetworkGraphContent width={chartWidth} height={chartHeight} variant={variant} />
      )}
    </ResponsiveChartWrapper>
  );
};
