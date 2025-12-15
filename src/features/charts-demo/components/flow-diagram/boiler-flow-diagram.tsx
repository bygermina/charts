import { StaticDiagram } from './components/static-diagram';
import { PipesLayer } from './components/pipes-layer';
import { ParticlesLayerCss } from './components/particles-layer-css';
import { createFlowSegments } from './config/flow-config-segments';

import styles from './boiler-flow-diagram.module.scss';

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 500;

// Absolute boiler and water container coordinates matching FLOW_SEGMENTS.
const BOILER = {
  x: 330,
  y: 100,
  w: 240,
  h: 300,
};

const WATER_CONTAINER = {
  x: 360,
  y: 130,
  w: 180,
  h: 240,
};

export const BoilerFlowDiagram = () => {
  const segments = createFlowSegments();

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className={styles.svg}>
        <PipesLayer segments={segments} />
        <ParticlesLayerCss segments={segments} />
        <StaticDiagram boiler={BOILER} waterContainer={WATER_CONTAINER} />
      </svg>
    </div>
  );
};
