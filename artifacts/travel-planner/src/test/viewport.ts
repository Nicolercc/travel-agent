/** Make `matchMedia` answer min-/max-width queries as if the viewport were `width` px wide (jsdom has no layout). */
export function setViewportWidth(width: number): () => void {
  const original = window.matchMedia;
  window.matchMedia = (query: string) => {
    const min = /min-width:\s*(\d+)px/.exec(query);
    const max = /max-width:\s*(\d+)px/.exec(query);
    const matches = (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
  return () => {
    window.matchMedia = original;
  };
}
