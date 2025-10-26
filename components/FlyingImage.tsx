
import React, { useEffect, useState } from 'react';

interface FlyingImageProps {
  src: string;
  startRect: DOMRect;
  endRect: DOMRect;
}

export const FlyingImage: React.FC<FlyingImageProps> = ({ src, startRect, endRect }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: startRect.left,
    top: startRect.top,
    width: startRect.width,
    height: startRect.height,
    borderRadius: '0.5rem',
    objectFit: 'cover',
    zIndex: 100,
    transition: 'all 0.6s ease-in-out',
  });

  useEffect(() => {
    // Timeout to allow initial render before transition starts
    const timer = setTimeout(() => {
      setStyle(prevStyle => ({
        ...prevStyle,
        left: endRect.left + endRect.width / 2,
        top: endRect.top + endRect.height / 2,
        width: 0,
        height: 0,
        opacity: 0.5,
        transform: 'rotate(360deg) scale(0.2)',
      }));
    }, 10);

    return () => clearTimeout(timer);
  }, [endRect]);

  return <img src={src} alt="Flying item" style={style} />;
};
