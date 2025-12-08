import { useEffect, useRef } from 'react';

import { type DataPoint } from './types';

/**
 * Функция-генератор, которая возвращает новое числовое значение для точки данных
 */
interface DataGenerator {
  (): number;
}

/**
 * Конфигурация для хука потока данных в реальном времени
 */
interface UseRealTimeDataStreamConfig {
  /** Массив генераторов данных - каждый генератор создает значения для одной линии графика */
  generators: DataGenerator[];
  /** Задержка между обновлениями данных в миллисекундах */
  delay: number;
  /** Максимальный размер буфера данных для каждой линии (старые точки удаляются) */
  bufferSize: number;
  /** Количество начальных точек данных для каждой линии */
  initialCount: number;
  /** Функция для создания начальных данных при инициализации */
  createInitialData: (count: number, generatorIndex: number) => DataPoint[];
  /** Опциональный колбэк, вызываемый при каждом обновлении данных */
  onDataUpdate?: (data: DataPoint[][]) => void;
}

/**
 * Хук для создания потока данных в реальном времени для графиков
 *
 * Основные возможности:
 * - Генерирует данные с заданной частотой через requestAnimationFrame
 * - Поддерживает несколько линий данных (по одному генератору на линию)
 * - Ограничивает размер буфера данных (FIFO - удаляет старые точки)
 * - Останавливает генерацию при скрытии страницы (visibilitychange)
 * - Сбрасывает данные при возврате на страницу после скрытия
 */
export const useRealTimeDataStream = ({
  generators,
  delay,
  bufferSize,
  initialCount,
  createInitialData,
  onDataUpdate,
}: UseRealTimeDataStreamConfig): void => {
  const generatorsRef = useRef(generators);
  const dataBuffersRef = useRef<DataPoint[][]>(
    generators.map((_, index) => createInitialData(initialCount, index)),
  );
  const isInitializedRef = useRef(false);
  const lastDataUpdateTimeRef = useRef(0);
  const dataUpdateFrameIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const wasHiddenRef = useRef(false);
  const onDataUpdateRef = useRef(onDataUpdate);

  useEffect(() => {
    generatorsRef.current = generators;
  }, [generators]);

  useEffect(() => {
    onDataUpdateRef.current = onDataUpdate;
  }, [onDataUpdate]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      dataBuffersRef.current = generators.map((_, index) => createInitialData(initialCount, index));
      isInitializedRef.current = true;
    }
  }, [initialCount, generators, createInitialData]);

  useEffect(() => {
    isMountedRef.current = true;
    wasHiddenRef.current = false;
    lastDataUpdateTimeRef.current = 0;

    const resetData = () => {
      dataBuffersRef.current = generators.map((_, index) => createInitialData(initialCount, index));
    };

    const updateDataBuffer = () => {
      if (!isMountedRef.current || document.hidden) return;

      const now = Date.now();
      const currentTime = performance.now();

      // Добавляем данные плавно по одной точке с заданной задержкой
      if (currentTime - lastDataUpdateTimeRef.current >= delay) {
        generatorsRef.current.forEach((generator, index) => {
          const buffer = dataBuffersRef.current[index];
          buffer.push({ time: now, value: generator() });

          if (buffer.length > bufferSize) {
            const removeCount = buffer.length - bufferSize;
            for (let i = 0; i < bufferSize; i++) {
              buffer[i] = buffer[i + removeCount];
            }
            buffer.length = bufferSize;
          }
        });

        lastDataUpdateTimeRef.current = currentTime;
        onDataUpdateRef.current?.(dataBuffersRef.current);
      }

      if (isMountedRef.current && !document.hidden) {
        dataUpdateFrameIdRef.current = requestAnimationFrame(updateDataBuffer);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        if (dataUpdateFrameIdRef.current !== null) {
          cancelAnimationFrame(dataUpdateFrameIdRef.current);
          dataUpdateFrameIdRef.current = null;
        }
      } else if (isMountedRef.current && dataUpdateFrameIdRef.current === null) {
        if (wasHiddenRef.current) {
          wasHiddenRef.current = false;
          resetData();
        }
        lastDataUpdateTimeRef.current = performance.now();
        dataUpdateFrameIdRef.current = requestAnimationFrame(updateDataBuffer);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    lastDataUpdateTimeRef.current = performance.now();
    dataUpdateFrameIdRef.current = requestAnimationFrame(updateDataBuffer);

    return () => {
      isMountedRef.current = false;
      if (dataUpdateFrameIdRef.current !== null) {
        cancelAnimationFrame(dataUpdateFrameIdRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, bufferSize, initialCount, generators, createInitialData]);
};
