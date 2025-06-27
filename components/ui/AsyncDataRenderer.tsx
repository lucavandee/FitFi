import React, { ReactNode } from 'react';
import LoadingFallback from './LoadingFallback';
import ErrorFallback from './ErrorFallback';

interface AsyncDataRendererProps<T> {
  /** The data to render */
  data: T | null;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Any error that occurred while loading the data */
  error: Error | null;
  /** Function to render the data */
  children: (data: T) => ReactNode;
  /** Loading component to show while data is loading */
  loadingComponent?: ReactNode;
  /** Error component to show when an error occurs */
  errorComponent?: ReactNode;
  /** Function to retry loading the data */
  onRetry?: () => void;
  /** Whether to show a loading indicator when data is null but not loading */
  showLoadingWhenEmpty?: boolean;
  /** Custom empty state component */
  emptyComponent?: ReactNode;
}

/**
 * A component for handling async data rendering with loading and error states
 */
function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  onRetry,
  showLoadingWhenEmpty = false,
  emptyComponent
}: AsyncDataRendererProps<T>) {
  // Show loading state
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <LoadingFallback />
    );
  }

  // Show error state
  if (error) {
    return errorComponent ? (
      <>{errorComponent}</>
    ) : (
      <ErrorFallback 
        error={error} 
        resetErrorBoundary={onRetry || (() => {})} 
        title="Er is iets misgegaan"
        message="We konden de gevraagde gegevens niet laden. Probeer het later opnieuw."
      />
    );
  }

  // Show empty state
  if (!data) {
    if (showLoadingWhenEmpty) {
      return loadingComponent ? (
        <>{loadingComponent}</>
      ) : (
        <LoadingFallback message="Gegevens laden..." />
      );
    }
    
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div className="p-8 text-center">
        <p className="text-white/70">Geen gegevens beschikbaar</p>
      </div>
    );
  }

  // Render data
  return <>{children(data)}</>;
}

export default AsyncDataRenderer;