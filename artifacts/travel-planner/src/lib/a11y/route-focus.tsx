import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/** The page a path belongs to: "/day/day-3" and "/day/day-4" are the same page; "/inbox" is another. */
export const pageOf = (path: string) => path.split("/")[1] ?? "";

/**
 * Route change → focus the new page's h1 (RFC §15), so keyboard and screen-reader users start at the
 * page subject instead of wherever the old page left them. Not on first load, and not when moving
 * within a page (selecting a day in the Itinerary, stepping between days), where the page owns focus.
 */
export function RouteFocus() {
  const [location] = useLocation();
  const previous = useRef(pageOf(location));
  useEffect(() => {
    const page = pageOf(location);
    if (page === previous.current) return;
    previous.current = page;
    const heading = document.querySelector<HTMLElement>("h1");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus();
  }, [location]);
  return null;
}
