/**
 * Optimized auto-scroll hook for drag & drop operations
 * Reduces performance overhead and provides better UX
 */

import { useRef, useCallback, useEffect } from 'react';
import { debugLog } from '../utils/debug';

interface AutoScrollConfig {
  threshold: number; // Distance from edge to trigger scroll
  topThreshold: number; // Specific threshold for top edge (usually larger)
  speed: number; // Scroll speed in pixels per frame
  maxSpeed: number; // Maximum scroll speed
  acceleration: number; // Speed increase factor when closer to edge
  showDebugZones?: boolean; // Show visual indicators for scroll zones
}

interface ScrollDirection {
  vertical: 'up' | 'down' | null;
  horizontal: 'left' | 'right' | null;
}

const defaultConfig: AutoScrollConfig = {
  threshold: 150, // Increased general threshold
  topThreshold: 220, // Larger top area for easier upward scrolling (was 200)
  speed: 15,
  maxSpeed: 45,
  acceleration: 1.5,
  showDebugZones: false, // Set to true to see scroll zones visually
};

export const useAutoScroll = (
  containerRef: React.RefObject<HTMLElement>,
  config: Partial<AutoScrollConfig> = {}
) => {
  const finalConfig = { ...defaultConfig, ...config };
  const intervalRef = useRef<number | undefined>(undefined);
  const currentDirectionRef = useRef<ScrollDirection>({ vertical: null, horizontal: null });
  const lastMousePositionRef = useRef({ x: 0, y: 0 });

  // Optimized scroll calculation with acceleration
  const calculateScrollSpeed = useCallback((distanceFromEdge: number, direction: 'up' | 'down' | 'left' | 'right'): number => {
    const { threshold, topThreshold, speed, maxSpeed, acceleration } = finalConfig;
    
    // Use topThreshold for upward scrolling, regular threshold for others
    const activeThreshold = direction === 'up' ? topThreshold : threshold;
    
    if (distanceFromEdge >= activeThreshold) return 0;
    
    // Calculate acceleration based on proximity to edge
    const proximityFactor = 1 - (distanceFromEdge / activeThreshold);
    const acceleratedSpeed = speed * Math.pow(proximityFactor * acceleration, 2);
    
    return Math.min(acceleratedSpeed, maxSpeed);
  }, [finalConfig]);

  // Throttled scroll detection to reduce CPU usage
  const detectScrollDirection = useCallback((mouseX: number, mouseY: number): ScrollDirection => {
    if (!containerRef.current) return { vertical: null, horizontal: null };

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate distances from viewport edges (not container edges)
    const distanceFromTop = mouseY;
    const distanceFromBottom = viewportHeight - mouseY;
    const distanceFromLeft = mouseX;
    const distanceFromRight = viewportWidth - mouseX;

    // Check if mouse is over the scrollable container
    const isOverContainer = (
      mouseY >= Math.max(containerRect.top, 0) &&
      mouseY <= Math.min(containerRect.bottom, viewportHeight) &&
      mouseX >= Math.max(containerRect.left, 0) &&
      mouseX <= Math.min(containerRect.right, viewportWidth)
    );

    if (!isOverContainer) {
      return { vertical: null, horizontal: null };
    }

    const direction: ScrollDirection = { vertical: null, horizontal: null };

    // Vertical scrolling - use larger threshold for top area
    if (distanceFromTop < finalConfig.topThreshold && container.scrollTop > 0) {
      direction.vertical = 'up';
    } else if (distanceFromBottom < finalConfig.threshold && 
               container.scrollTop < (container.scrollHeight - container.clientHeight)) {
      direction.vertical = 'down';
    }

    // Horizontal scrolling (for future use)
    if (distanceFromLeft < finalConfig.threshold && container.scrollLeft > 0) {
      direction.horizontal = 'left';
    } else if (distanceFromRight < finalConfig.threshold && 
               container.scrollLeft < (container.scrollWidth - container.clientWidth)) {
      direction.horizontal = 'right';
    }

    return direction;
  }, [containerRef, finalConfig.threshold, finalConfig.topThreshold]);

  // Optimized scroll execution
  const executeScroll = useCallback((direction: ScrollDirection) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { x: mouseX, y: mouseY } = lastMousePositionRef.current;

    let scrolled = false;

    if (direction.vertical) {
      const distanceFromEdge = direction.vertical === 'up' ? mouseY : window.innerHeight - mouseY;
      const scrollSpeed = calculateScrollSpeed(distanceFromEdge, direction.vertical);

      if (scrollSpeed > 0) {
        const scrollDelta = direction.vertical === 'up' ? -scrollSpeed : scrollSpeed;
        const newScrollTop = Math.max(
          0,
          Math.min(
            container.scrollHeight - container.clientHeight,
            container.scrollTop + scrollDelta
          )
        );

        if (newScrollTop !== container.scrollTop) {
          container.scrollTop = newScrollTop;
          scrolled = true;
        }
      }
    }

    if (direction.horizontal) {
      const distanceFromEdge = direction.horizontal === 'left' ? mouseX : window.innerWidth - mouseX;
      const scrollSpeed = calculateScrollSpeed(distanceFromEdge, direction.horizontal);

      if (scrollSpeed > 0) {
        const scrollDelta = direction.horizontal === 'left' ? -scrollSpeed : scrollSpeed;
        const newScrollLeft = Math.max(
          0,
          Math.min(
            container.scrollWidth - container.clientWidth,
            container.scrollLeft + scrollDelta
          )
        );

        if (newScrollLeft !== container.scrollLeft) {
          container.scrollLeft = newScrollLeft;
          scrolled = true;
        }
      }
    }

    return scrolled;
  }, [containerRef, calculateScrollSpeed]);

  // Start auto-scroll with optimized interval management
  const startAutoScroll = useCallback((direction: ScrollDirection) => {
    // Only start if direction actually changed
    if (
      currentDirectionRef.current.vertical === direction.vertical &&
      currentDirectionRef.current.horizontal === direction.horizontal
    ) {
      return;
    }

    stopAutoScroll();
    currentDirectionRef.current = direction;

    if (direction.vertical || direction.horizontal) {
      debugLog('🔄 Starting auto-scroll:', direction);
      
      intervalRef.current = window.setInterval(() => {
        const scrolled = executeScroll(currentDirectionRef.current);
        
        if (!scrolled) {
          // Stop if we can't scroll anymore
          stopAutoScroll();
        }
      }, 16); // ~60fps for smooth scrolling
    }
  }, [executeScroll]);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    currentDirectionRef.current = { vertical: null, horizontal: null };
  }, []);

  // Throttled mouse position handler
  const handleMouseMove = useCallback((mouseX: number, mouseY: number) => {
    // Store mouse position for scroll calculations
    lastMousePositionRef.current = { x: mouseX, y: mouseY };

    // Detect scroll direction and start/stop auto-scroll
    const direction = detectScrollDirection(mouseX, mouseY);
    
    if (direction.vertical || direction.horizontal) {
      startAutoScroll(direction);
    } else {
      stopAutoScroll();
    }
  }, [detectScrollDirection, startAutoScroll, stopAutoScroll]);

  // Debug zones visualization (development only)
  useEffect(() => {
    if (!finalConfig.showDebugZones || process.env.NODE_ENV !== 'development') {
      return;
    }

    // Create debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'auto-scroll-debug';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9998;
    `;

    // Top zone (larger)
    const topZone = document.createElement('div');
    topZone.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${finalConfig.topThreshold}px;
      background: rgba(255, 0, 0, 0.1);
      border-bottom: 2px dashed rgba(255, 0, 0, 0.5);
    `;
    overlay.appendChild(topZone);

    // Bottom zone
    const bottomZone = document.createElement('div');
    bottomZone.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: ${finalConfig.threshold}px;
      background: rgba(0, 255, 0, 0.1);
      border-top: 2px dashed rgba(0, 255, 0, 0.5);
    `;
    overlay.appendChild(bottomZone);

    // Left and right zones
    const leftZone = document.createElement('div');
    leftZone.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${finalConfig.threshold}px;
      height: 100%;
      background: rgba(0, 0, 255, 0.1);
      border-right: 2px dashed rgba(0, 0, 255, 0.5);
    `;
    overlay.appendChild(leftZone);

    const rightZone = document.createElement('div');
    rightZone.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: ${finalConfig.threshold}px;
      height: 100%;
      background: rgba(255, 255, 0, 0.1);
      border-left: 2px dashed rgba(255, 255, 0, 0.5);
    `;
    overlay.appendChild(rightZone);

    // Label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      text-align: center;
    `;
    label.innerHTML = `
      Auto-Scroll Debug Zones<br>
      🔴 Top: ${finalConfig.topThreshold}px<br>
      🟢 Bottom: ${finalConfig.threshold}px<br>
      🔵 Left: ${finalConfig.threshold}px<br>
      🟡 Right: ${finalConfig.threshold}px
    `;
    overlay.appendChild(label);

    document.body.appendChild(overlay);

    return () => {
      const existingOverlay = document.getElementById('auto-scroll-debug');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    };
  }, [finalConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  return {
    handleMouseMove,
    startAutoScroll,
    stopAutoScroll,
    isAutoScrolling: !!intervalRef.current,
  };
};
