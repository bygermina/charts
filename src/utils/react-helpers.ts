export const setDisplayName = <T extends React.ComponentType<unknown>>(
  component: T,
  displayName: string,
): T => {
  if (component.displayName === undefined) {
    if ('$$typeof' in component && component.$$typeof?.toString().includes('Memo')) {
      Object.assign(component, { displayName });
    } else {
      component.displayName = displayName;
    }
  }
  return component;
};
