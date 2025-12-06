export const colorWithOpacity = (colorVar: string, opacity: number): string => {
  return `rgba(from ${colorVar} r g b / ${opacity})`;
};
