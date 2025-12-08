import { type LineSeries } from '../multi-line-chart/types';
import { type DataPoint } from '../types';

export interface ProcessLinesDataCache {
  result: LineSeries[];
  reusableLineSeries: LineSeries[];
  slicedArrays: DataPoint[][]; // Кэш для срезов массивов
}

export const processLinesData = (
  lines: LineSeries[],
  timeWindowStart: number,
  maxDisplayPoints: number = 200,
  cache?: ProcessLinesDataCache,
): LineSeries[] => {
  const result = cache?.result || [];
  result.length = 0;

  const reusableLineSeries = cache?.reusableLineSeries || [];
  const slicedArrays = cache?.slicedArrays || [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line?.data?.length) {
      result.push(line);
      continue;
    }

    const dataLength = line.data.length;
    let startIndex = Math.max(0, dataLength - maxDisplayPoints);

    if (line.data[startIndex]?.time < timeWindowStart) {
      let left = startIndex;
      let right = dataLength - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (line.data[mid].time < timeWindowStart) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      startIndex = left;
    }

    if (startIndex === 0 && dataLength <= maxDisplayPoints) {
      result.push(line);
      continue;
    }

    let finalData: DataPoint[];
    if (startIndex > 0) {
      const cachedSlice = slicedArrays[i];
      if (cachedSlice?.length === dataLength - startIndex) {
        for (let j = 0; j < cachedSlice.length; j++) {
          cachedSlice[j] = line.data[startIndex + j];
        }
        finalData = cachedSlice;
      } else {
        finalData = line.data.slice(startIndex);
        slicedArrays[i] = finalData;
      }
    } else {
      finalData = line.data;
    }

    const resultLine = reusableLineSeries[i] || { ...line, data: finalData };
    resultLine.data = finalData;
    resultLine.color = line.color;
    resultLine.label = line.label;
    if (!reusableLineSeries[i]) reusableLineSeries[i] = resultLine;
    result.push(resultLine);
  }

  reusableLineSeries.length = lines.length;
  slicedArrays.length = lines.length;

  return result;
};
