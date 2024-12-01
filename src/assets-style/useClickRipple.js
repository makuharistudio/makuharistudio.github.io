import { useEffect } from 'react';

export const useClickRipple = (element, config) => {

  const {
    size = 80,
    color = '#F595FF',
    duration = 600
  
  } = config;

  useEffect(() => {
    const applyInterfaceAnimation = () => {
        element.current.classList.add("ripple-effect");

    };

    const applyStyles = (e) => {
        const { offsetX, offsetY } = e;
        const { style } = element.current;
        const sizeOffset = 15;

        style.setProperty("--effect-duration", `${duration}ms`);
        style.setProperty("--effect-top", `${offsetY - sizeOffset}px`);
        style.setProperty("--effect-left", `${offsetX - sizeOffset}px`);
        style.setProperty("--effect-height", `${30}px`);
        style.setProperty("--effect-width", `${30}px`);
        style.setProperty("--effect-color", color);
    }

    const onClick = (e) => {
        element.current.classList.remove("active");
        applyStyles(e);
        element.current.classList.add("active");
    }

    applyInterfaceAnimation();

    element.current.addEventListener("mouseup", onClick);
    
    const cleanupRef = element.current;

    return () => {
        cleanupRef.removeEventListener("mouseup", onClick);
    };

}, [color, duration, element, size]);

};
