import { useEffect } from "react";

/**
 * Posts the document height to the parent window so an embedding page
 * (e.g. a WordPress contact page) can size the iframe to fit.
 *
 * Works cross-origin via window.postMessage. The parent listens for a
 * message of the shape { source: "ies-enquiry-resize", height: number }
 * and sets the iframe height accordingly.
 */
export const useIframeResizer = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only bother when we are actually embedded in someone else's page.
    if (window.parent === window) return;

    const send = () => {
      const height = Math.ceil(
        document.documentElement.getBoundingClientRect().height,
      );
      window.parent.postMessage({ source: "ies-enquiry-resize", height }, "*");
    };

    // Send once on load (after paint) and again whenever the body size changes.
    const raf = requestAnimationFrame(send);
    const ro = new ResizeObserver(() => send());
    ro.observe(document.body);

    // Re-send after fonts/images settle, which can shift layout height.
    window.addEventListener("load", send);
    const settle = window.setTimeout(send, 400);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("load", send);
      window.clearTimeout(settle);
    };
  }, []);
};
