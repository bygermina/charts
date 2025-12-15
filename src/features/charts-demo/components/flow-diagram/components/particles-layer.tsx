import { useCallback, useEffect, memo, useMemo, useRef, useState } from 'react';

import { useVisibility } from '@/entities/chart';

import type { Particle, Segment } from '../config/types';
import { getParticleColor } from '../config/flow-config';
import { getInitialParticles, updateParticles } from '../utils/particle-utils';

interface ParticlesLayerProps {
  segments: Segment[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  particleRadius?: number;
}

export const ParticlesLayer = memo(
  ({ segments, containerRef, particleRadius = 5 }: ParticlesLayerProps) => {
    const [particles, setParticles] = useState<Particle[]>(() => getInitialParticles(segments));
    const animationIdRef = useRef<number | null>(null);
    const loopRef = useRef<((now: number) => void) | null>(null);
    const isVisibleRef = useRef(true);

    const stopLoop = useCallback(() => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }, []);

    const startLoop = useCallback(() => {
      if (animationIdRef.current === null && isVisibleRef.current && loopRef.current) {
        animationIdRef.current = requestAnimationFrame(loopRef.current);
      }
    }, []);

    useVisibility({
      onHidden: stopLoop,
      onVisible: startLoop,
    });

    useEffect(() => {
      let lastTime = performance.now();

      const loop = (now: number) => {
        animationIdRef.current = null;
        if (document.hidden || !isVisibleRef.current) return;

        const dt = now - lastTime;
        lastTime = now;

        setParticles((prevParticles) => updateParticles(prevParticles, segments, dt));

        animationIdRef.current = requestAnimationFrame(loop);
      };

      loopRef.current = loop;

      const observer = new IntersectionObserver(
        (entries) => {
          isVisibleRef.current = entries[0]?.isIntersecting ?? true;
          if (!isVisibleRef.current) {
            stopLoop();
          } else if (!document.hidden) {
            startLoop();
          }
        },
        { threshold: 0 },
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      startLoop();

      return () => {
        observer.disconnect();
        stopLoop();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segments]);

    useEffect(() => {
      setParticles(getInitialParticles(segments));
    }, [segments]);

    const circles = useMemo(() => {
      const result: React.ReactElement[] = [];
      let index = 0;

      particles.forEach((p) => {
        const seg = segments[p.segmentIndex];
        if (!seg || p.t < 0 || p.t > 1) return;

        const x1 = seg.from.x;
        const y1 = seg.from.y;
        const x2 = seg.to.x;
        const y2 = seg.to.y;

        const x = x1 + (x2 - x1) * p.t;
        const y = y1 + (y2 - y1) * p.t;
        const radius = seg.type === 'gas' ? particleRadius + 1 : particleRadius;
        const color = getParticleColor(seg.type);

        result.push(
          <circle
            key={`particle-${p.segmentIndex}-${index}`}
            cx={x}
            cy={y}
            r={radius}
            fill={color}
            opacity={0.8}
          />,
        );
        index++;
      });

      return result;
    }, [particles, segments, particleRadius]);

    return <g>{circles}</g>;
  },
);
