import { type RefObject, useEffect, useState } from 'react';

function isScrollable(el: Element) {
  const style = window.getComputedStyle(el);
  return /(auto|scroll)/.test(style.overflowY);
}

/** Finds the nearest scrollable ancestor of `ref`, for virtualizers that need
 * an explicit scroll container instead of the window (e.g. the app's
 * `.mainContent` region, which scrolls independently of the page body). */
export function useScrollParent(ref: RefObject<Element | null>) {
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let node = ref.current?.parentElement ?? null;
    while (node && node !== document.body) {
      if (isScrollable(node)) {
        setScrollParent(node);
        return;
      }
      node = node.parentElement;
    }
    setScrollParent(null);
  }, [ref]);

  return scrollParent;
}
