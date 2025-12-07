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
  // Рефы для хранения актуальных значений без пересоздания эффектов

  /** Текущие генераторы данных (обновляются при изменении пропсов) */
  const generatorsRef = useRef(generators);

  /** Буферы данных для каждой линии графика (массив массивов точек) */
  const dataBuffersRef = useRef<DataPoint[][]>(
    generators.map((_, index) => createInitialData(initialCount, index)),
  );

  /** Флаг инициализации начальных данных */
  const isInitializedRef = useRef(false);

  /** Время последнего обновления данных (для контроля задержки) */
  const lastDataUpdateTimeRef = useRef(0);

  /** ID кадра requestAnimationFrame для возможности отмены */
  const dataUpdateFrameIdRef = useRef<number | null>(null);

  /** Флаг монтирования компонента (для очистки при размонтировании) */
  const isMountedRef = useRef(true);

  /** Флаг того, что страница была скрыта (для сброса данных при возврате) */
  const wasHiddenRef = useRef(false);

  /** Реф для колбэка обновления данных (обновляется при изменении пропса) */
  const onDataUpdateRef = useRef(onDataUpdate);

  // Обновляем реф генераторов при изменении пропса
  useEffect(() => {
    generatorsRef.current = generators;
  }, [generators]);

  // Обновляем реф колбэка при изменении пропса
  useEffect(() => {
    onDataUpdateRef.current = onDataUpdate;
  }, [onDataUpdate]);

  // Инициализируем начальные данные при первом рендере или изменении параметров
  useEffect(() => {
    if (!isInitializedRef.current) {
      dataBuffersRef.current = generators.map((_, index) => createInitialData(initialCount, index));
      isInitializedRef.current = true;
    }
  }, [initialCount, generators, createInitialData]);

  // Основной эффект: запускает и управляет потоком данных
  useEffect(() => {
    // Инициализация состояния при монтировании
    isMountedRef.current = true;
    wasHiddenRef.current = false;
    lastDataUpdateTimeRef.current = 0;

    /**
     * Сбрасывает буферы данных, создавая новые начальные данные
     * Используется при возврате на страницу после скрытия
     */
    const resetData = () => {
      dataBuffersRef.current = generators.map((_, index) => createInitialData(initialCount, index));
    };

    /**
     * Основная функция обновления данных
     * Вызывается через requestAnimationFrame для плавной генерации
     */
    const updateDataBuffer = () => {
      // Прерываем обновление, если компонент размонтирован или страница скрыта
      if (!isMountedRef.current || document.hidden) return;

      const now = Date.now(); // Время для метки точки данных
      const currentTime = performance.now(); // Точное время для контроля задержки

      // Проверяем, прошла ли необходимая задержка с последнего обновления
      if (currentTime - lastDataUpdateTimeRef.current >= delay) {
        // Обновляем данные для каждого генератора (каждой линии графика)
        generatorsRef.current.forEach((generator, index) => {
          const buffer = dataBuffersRef.current[index];
          if (!buffer) return;

          // Добавляем новую точку данных: текущее время и значение от генератора
          buffer.push({ time: now, value: generator() });

          // Удаляем самую старую точку, если буфер превысил максимальный размер (FIFO)
          if (buffer.length > bufferSize) buffer.shift();
        });

        // Обновляем время последнего обновления
        lastDataUpdateTimeRef.current = currentTime;

        // Вызываем колбэк с обновленными данными (если он передан)
        onDataUpdateRef.current?.(dataBuffersRef.current);
      }

      // Планируем следующий кадр обновления, если компонент еще смонтирован и страница видима
      if (isMountedRef.current && !document.hidden) {
        dataUpdateFrameIdRef.current = requestAnimationFrame(updateDataBuffer);
      }
    };

    /**
     * Обработчик изменения видимости страницы
     * Останавливает генерацию при скрытии и возобновляет при показе
     */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Страница скрыта: останавливаем генерацию данных
        wasHiddenRef.current = true;
        if (dataUpdateFrameIdRef.current !== null) {
          cancelAnimationFrame(dataUpdateFrameIdRef.current);
          dataUpdateFrameIdRef.current = null;
        }
      } else if (isMountedRef.current) {
        // Страница снова видима: возобновляем генерацию
        if (wasHiddenRef.current) {
          // Если страница была скрыта, сбрасываем данные (чтобы не было разрыва во времени)
          wasHiddenRef.current = false;
          resetData();
        }
        // Запускаем обновление данных, если оно еще не запущено
        if (dataUpdateFrameIdRef.current === null) {
          lastDataUpdateTimeRef.current = performance.now();
          dataUpdateFrameIdRef.current = requestAnimationFrame(updateDataBuffer);
        }
      }
    };

    // Подписываемся на события изменения видимости страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Запускаем цикл обновления данных
    lastDataUpdateTimeRef.current = performance.now();
    dataUpdateFrameIdRef.current = requestAnimationFrame(updateDataBuffer);

    // Очистка при размонтировании компонента
    return () => {
      isMountedRef.current = false;
      // Отменяем запланированный кадр обновления
      if (dataUpdateFrameIdRef.current !== null) {
        cancelAnimationFrame(dataUpdateFrameIdRef.current);
      }
      // Удаляем обработчик события видимости
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, bufferSize, initialCount, generators, createInitialData]);
};
