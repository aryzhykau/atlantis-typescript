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
  outerBuffer?: number; // Extra buffer outside container to trigger auto-scroll
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
  outerBuffer: 120,
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

    // Local coordinates relative to the container (important for non-fullscreen containers)
    const localX = mouseX - containerRect.left;
    const localY = mouseY - containerRect.top;

  // Allow detection within a buffer outside the container (outerBuffer)
  // so dragging just above/below the container still triggers auto-scroll.
  const outer = finalConfig.outerBuffer ?? finalConfig.threshold;
  const extendedTop = -outer;
  const extendedBottom = containerRect.height + outer;
  const extendedLeft = -outer;
  const extendedRight = containerRect.width + outer;

    const distanceFromTop = localY;
    const distanceFromBottom = containerRect.height - localY;
    const distanceFromLeft = localX;
    const distanceFromRight = containerRect.width - localX;

    // Consider pointer over container if it's inside the container OR within the threshold buffer around it
    const isOverContainer = (
      localY >= extendedTop && localY <= extendedBottom &&
      localX >= extendedLeft && localX <= extendedRight
    );

    if (!isOverContainer) {
      return { vertical: null, horizontal: null };
    }

    const direction: ScrollDirection = { vertical: null, horizontal: null };

  // Vertical scrolling - use larger threshold for top area (relative to container)
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
  const containerRect = container.getBoundingClientRect();
  const localY = mouseY - containerRect.top;
  const localX = mouseX - containerRect.left;

    let scrolled = false;

    if (direction.vertical) {
      const height = containerRect.height;
      let scrollSpeed = 0;

      // If pointer is inside container bounds, use normal distance-based speed
      if (localY >= 0 && localY <= height) {
        const distanceFromEdge = direction.vertical === 'up' ? localY : (height - localY);
        scrollSpeed = calculateScrollSpeed(distanceFromEdge, direction.vertical);
      } else {
        // Pointer is outside: compute how far outside and map that to a reduced speed
        const outer = finalConfig.outerBuffer ?? finalConfig.threshold;
        const outsideDistance = direction.vertical === 'up' ? Math.max(0, -localY) : Math.max(0, localY - height);
        const proximity = Math.max(0, 1 - (outsideDistance / outer));
        // Scale speed down when pointer is outside to avoid aggressive jumps
        const outsideScale = 0.6;
        scrollSpeed = Math.min(finalConfig.maxSpeed * outsideScale, finalConfig.speed * Math.pow(proximity * finalConfig.acceleration, 2));
      }

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
          // Use scrollTo for more consistent behavior on mobile
          container.scrollTo({ top: newScrollTop });
          scrolled = true;
        }
      }
    }

    if (direction.horizontal) {
      const distanceFromEdge = direction.horizontal === 'left' ? localX : (containerRect.width - localX);
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
          container.scrollTo({ left: newScrollLeft });
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
