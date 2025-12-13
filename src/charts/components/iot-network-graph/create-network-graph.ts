import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { drag } from 'd3-drag';
import { type ChartColors } from '@/components/basic/charts';

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

const getNodeColor = (type: Node['type'], chartColors: ChartColors): string => {
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

const getNodeById = (id: string | Node, nodes: Node[]): Node => {
  return typeof id === 'string' ? nodes.find((n) => n.id === id)! : id;
};

interface CreateNetworkGraphConfig {
  svgElement: SVGSVGElement;
  width: number;
  height: number;
  chartColors: ChartColors;
}

export const createNetworkGraph = ({
  svgElement,
  width,
  height,
  chartColors,
}: CreateNetworkGraphConfig): (() => void) => {
  const { nodes, links } = generateIoTNetwork();

  const svg = select(svgElement);
  svg.selectAll('*').remove();

  const g = svg.append('g');

  const zoomBehavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);

  const centerX = width / 2;
  const centerY = height / 2;

  const simulation = forceSimulation<Node>(nodes)
    .force(
      'link',
      forceLink<Node, Link>(links)
        .id((d) => d.id)
        .distance(100),
    )
    .force('charge', forceManyBody<Node>().strength(-300))
    .force('center', forceCenter(centerX, centerY))
    .force('collision', forceCollide<Node>().radius(25));

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

  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, Node>('g.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(
      drag<SVGGElement, Node>()
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

  node
    .append('circle')
    .attr('r', (d) => getNodeRadius(d.type))
    .attr('fill', (d) => getNodeColor(d.type, chartColors))
    .style('cursor', 'grab')
    .on('mouseenter', function (_event, d) {
      select(this).attr('r', getNodeRadiusHover(d.type));
    })
    .on('mouseleave', function (_event, d) {
      select(this).attr('r', getNodeRadius(d.type));
    });

  node
    .append('text')
    .text((d) => d.label)
    .attr('dx', 15)
    .attr('dy', 4)
    .attr('font-size', '11px')
    .attr('fill', chartColors.text)
    .attr('pointer-events', 'none')
    .style('user-select', 'none');

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => getNodeById(d.source, nodes).x ?? 0)
      .attr('y1', (d) => getNodeById(d.source, nodes).y ?? 0)
      .attr('x2', (d) => getNodeById(d.target, nodes).x ?? 0)
      .attr('y2', (d) => getNodeById(d.target, nodes).y ?? 0);

    node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
  });

  const initialTransform = zoomIdentity
    .translate(width / 2 - centerX, height / 2 - centerY)
    .scale(0.8);
  svg.call(zoomBehavior.transform, initialTransform);

  return () => {
    simulation.stop();
    svg.on('.zoom', null);
  };
};
