import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export function Reveal({ 
  children, 
  className = '', 
  delay = 'delay-0',
  threshold = 0.1,
  direction = 'up' // up, down, left, right, none
}) {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold });

  // Map directions to translate classes
  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    none: ''
  };

  const initialClass = `opacity-0 ${directionClasses[direction]}`;
  const finalClass = 'opacity-100 translate-y-0 translate-x-0';

  return (
    <div
      ref={ref}
      className={`transition-all duration-slow ease-out-soft ${delay} ${
        isIntersecting ? finalClass : initialClass
      } ${className}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  );
}
