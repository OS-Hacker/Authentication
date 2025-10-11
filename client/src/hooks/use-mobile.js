import { useState, useEffect } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export const useIsMobile = (breakpoint = "md") => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = breakpoints[breakpoint] || breakpoints.md;
      setIsMobile(window.innerWidth < width);
    };

    checkDevice();

    const handleResize = () => {
      checkDevice();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};
