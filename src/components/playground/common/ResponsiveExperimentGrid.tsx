/**
 * Responsive experiment grid component
 * Task 2.1: プレイグラウンドのレスポンシブ対応
 */

"use client";

import { useResponsive } from "@/hooks/useResponsive";
import { useTouchGestures } from "@/hooks/useTouchGestures";
import { ExperimentItem } from "@/types/playground";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

interface ResponsiveExperimentGridProps {
  experiments: ExperimentItem[];
  activeExperiment: string | null;
  onExperimentSelect: (experimentId: string | null) => void;
  className?: string;
}

export const ResponsiveExperimentGrid: React.FC<
  ResponsiveExperimentGridProps
> = ({ experiments, activeExperiment, onExperimentSelect, className = "" }) => {
  const responsive = useResponsive();
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate grid layout based on screen size
  const getGridConfig = () => {
    if (responsive.isMobile) {
      return { columns: 1, itemsPerPage: 3 };
    } else if (responsive.isTablet) {
      return { columns: 2, itemsPerPage: 4 };
    } else {
      return { columns: 3, itemsPerPage: 6 };
    }
  };

  const { itemsPerPage } = getGridConfig();
  const totalPages = Math.ceil(experiments.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleExperiments = experiments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handle page navigation
  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  }, [totalPages]);

  // Touch gesture handling for mobile swipe navigation
  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: goToNextPage,
    onSwipeRight: goToPrevPage,
  });

  // Grid CSS classes based on responsive state
  const getGridClasses = () => {
    const baseClasses = "grid gap-4 transition-all duration-300";

    if (responsive.isMobile) {
      return `${baseClasses} grid-cols-1`;
    } else if (responsive.isTablet) {
      return `${baseClasses} grid-cols-2`;
    } else {
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }
  };

  // Experiment card classes based on responsive state
  const getCardClasses = (isActive: boolean) => {
    const baseClasses = `
      text-left p-4 border transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-foreground 
      focus:ring-offset-2 focus:ring-offset-background
      ${responsive.touch.isTouchDevice ? "active:scale-95" : "hover:scale-105"}
    `;

    const stateClasses = isActive
      ? "border-accent bg-accent bg-opacity-10 shadow-lg"
      : "border-foreground hover:border-accent";

    const sizeClasses = responsive.isMobile
      ? "min-h-[120px]"
      : responsive.isTablet
        ? "min-h-[140px]"
        : "min-h-[160px]";

    return `${baseClasses} ${stateClasses} ${sizeClasses}`;
  };

  // Text size classes based on responsive state
  const getTextClasses = () => ({
    title: responsive.isMobile
      ? "zen-kaku-gothic-new text-sm text-primary"
      : "zen-kaku-gothic-new text-base text-primary",
    description: responsive.isMobile
      ? "noto-sans-jp-light text-xs text-foreground line-clamp-2"
      : "noto-sans-jp-light text-sm text-foreground line-clamp-3",
    tag: responsive.isMobile
      ? "noto-sans-jp-light text-xs border border-foreground px-1 py-0.5"
      : "noto-sans-jp-light text-xs border border-foreground px-2 py-1",
    tech: responsive.isMobile
      ? "noto-sans-jp-light text-xs text-accent"
      : "noto-sans-jp-light text-xs text-accent",
  });

  const textClasses = getTextClasses();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with pagination info */}
      <div className="flex items-center justify-between">
        <h3 className="zen-kaku-gothic-new text-lg text-primary">
          Available Experiments ({experiments.length})
        </h3>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <span className="noto-sans-jp-light text-sm text-foreground">
              {currentPage + 1} / {totalPages}
            </span>

            {/* Desktop pagination buttons */}
            {!responsive.isMobile && (
              <div className="flex space-x-1">
                <button
                  onClick={goToPrevPage}
                  className="p-1 border border-foreground hover:border-accent focus:outline-none focus:ring-2 focus:ring-foreground"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextPage}
                  className="p-1 border border-foreground hover:border-accent focus:outline-none focus:ring-2 focus:ring-foreground"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile swipe instruction */}
      {responsive.isMobile && totalPages > 1 && (
        <p className="noto-sans-jp-light text-xs text-foreground opacity-70">
          スワイプで実験を切り替えできます
        </p>
      )}

      {/* Experiment grid */}
      <div
        data-testid={
          responsive.isMobile ? "mobile-experiment-grid" : "experiment-grid"
        }
        className={getGridClasses()}
        onTouchStart={
          responsive.touch.isTouchDevice
            ? touchHandlers.onTouchStart
            : undefined
        }
        onTouchMove={
          responsive.touch.isTouchDevice ? touchHandlers.onTouchMove : undefined
        }
        onTouchEnd={
          responsive.touch.isTouchDevice ? touchHandlers.onTouchEnd : undefined
        }
      >
        {visibleExperiments.map((experiment) => {
          const isActive = activeExperiment === experiment.id;

          return (
            <button
              key={experiment.id}
              onClick={() =>
                onExperimentSelect(isActive ? null : experiment.id)
              }
              className={getCardClasses(isActive)}
              aria-pressed={isActive}
              aria-describedby={`experiment-${experiment.id}-description`}
            >
              <div className="space-y-2">
                <h4 className={textClasses.title}>{experiment.title}</h4>

                <p
                  id={`experiment-${experiment.id}-description`}
                  className={textClasses.description}
                >
                  {experiment.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <span className={textClasses.tag}>{experiment.category}</span>
                  <span className={textClasses.tag}>
                    {experiment.difficulty}
                  </span>
                  {"performanceLevel" in experiment && (
                    <span className={textClasses.tag}>
                      {experiment.performanceLevel as string}
                    </span>
                  )}
                  {experiment.interactive && (
                    <span
                      className={`${textClasses.tag} border-accent text-accent`}
                    >
                      Interactive
                    </span>
                  )}
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1">
                  {experiment.technology
                    .slice(0, responsive.isMobile ? 2 : 3)
                    .map((tech, index) => (
                      <span key={index} className={textClasses.tech}>
                        {tech}
                      </span>
                    ))}
                  {experiment.technology.length >
                    (responsive.isMobile ? 2 : 3) && (
                    <span className={textClasses.tech}>
                      +
                      {experiment.technology.length -
                        (responsive.isMobile ? 2 : 3)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Page indicators for mobile */}
      {responsive.isMobile && totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentPage ? "bg-accent" : "bg-foreground opacity-30"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
