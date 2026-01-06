import React, { useRef, useEffect, useState, useCallback } from 'react';

interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  columns?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * Virtual Grid Component
 * Efficiently renders large lists by only rendering visible items
 *
 * Features:
 * - Windowing/virtualization for performance
 * - Infinite scroll support
 * - Responsive columns
 * - Configurable overscan
 * - End reached callback
 *
 * Perfect for:
 * - Outfit galleries with 100+ items
 * - Product catalogs
 * - Image grids
 *
 * @example
 * <VirtualGrid
 *   items={outfits}
 *   renderItem={(outfit) => <OutfitCard outfit={outfit} />}
 *   itemHeight={280}
 *   columns={2}
 *   gap={16}
 *   onEndReached={loadMore}
 * />
 */
export function VirtualGrid<T>({
  items,
  renderItem,
  itemHeight,
  columns = 2,
  gap = 16,
  overscan = 3,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight - gap;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleItems: Array<{ item: T; index: number; row: number; col: number }> = [];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col
        });
      }
    }
  }

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // End reached detection
    if (onEndReached) {
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold]);

  // Measure container height
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => {
          const top = row * rowHeight;
          const left = `calc(${(col / columns) * 100}% + ${col * gap}px)`;
          const width = `calc(${100 / columns}% - ${((columns - 1) * gap) / columns}px)`;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top,
                left,
                width,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Virtual List Component (single column)
 * Simpler version for vertical lists
 */
interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  gap?: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  gap = 8,
  overscan = 3,
  className = '',
  onEndReached
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const itemHeightWithGap = itemHeight + gap;
  const totalHeight = items.length * itemHeightWithGap - gap;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeightWithGap) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeightWithGap) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    if (onEndReached) {
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
      if (scrollPercentage >= 0.9) {
        onEndReached();
      }
    }
  }, [onEndReached]);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const top = actualIndex * itemHeightWithGap;

          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Auto-sizing Virtual Grid
 * Automatically determines item height based on first item
 */
export function AutoVirtualGrid<T>({
  items,
  renderItem,
  columns = 2,
  gap = 16,
  className = ''
}: Omit<VirtualGridProps<T>, 'itemHeight'>) {
  const [itemHeight, setItemHeight] = useState<number | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current && items.length > 0) {
      const height = measureRef.current.offsetHeight;
      setItemHeight(height);
    }
  }, [items]);

  if (!itemHeight) {
    // Render first item to measure
    return (
      <div ref={measureRef} style={{ opacity: 0, position: 'absolute' }}>
        {items.length > 0 && renderItem(items[0], 0)}
      </div>
    );
  }

  return (
    <VirtualGrid
      items={items}
      renderItem={renderItem}
      itemHeight={itemHeight}
      columns={columns}
      gap={gap}
      className={className}
    />
  );
}

/**
 * Infinite Scroll Hook
 * For use with Virtual Grid/List
 */
interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore
}: UseInfiniteScrollOptions) {
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return { handleEndReached };
}
