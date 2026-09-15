import React, { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export function AnimatedCounter({ 
  endValue, 
  duration = 1500, // 1.5 seconds default
  className = '',
  suffix = ''
}) {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Fallback for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      if (prefersReducedMotion) {
        setCount(endValue);
        setHasAnimated(true);
        return;
      }

      let startTime;
      let animationFrameId;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - Math.min(progress / duration, 1), 4);
        
        const currentCount = Math.floor(easeProgress * endValue);
        setCount(currentCount);

        if (progress < duration) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(endValue);
          setHasAnimated(true);
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isIntersecting, endValue, duration, hasAnimated, prefersReducedMotion]);

  return (
    <div className={`inline-block text-center ${className}`} ref={ref}>
      {/* Screen reader only output with the final value */}
      <span className="sr-only">{endValue}{suffix}</span>
      
      {/* Visual output, hidden from screen readers to prevent announcing every tick */}
      <span aria-hidden="true">
        {count.toLocaleString()}{suffix}
      </span>
    </div>
  );
}
