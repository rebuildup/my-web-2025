/**
 * Accessible navigation component for playground pages
 * Task 2.2: アクセシビリティ対応 - キーボードナビゲーション対応
 */

"use client";

import { useAccessibility, useFocusManagement } from "@/hooks/useAccessibility";
import { useResponsive } from "@/hooks/useResponsive";
import { ChevronRight, Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  description?: string;
  isActive?: boolean;
}

interface AccessiblePlaygroundNavProps {
  currentPage: "design" | "webgl";
  className?: string;
}

const navigationItems: NavItem[] = [
  {
    href: "/portfolio",
    label: "Portfolio Home",
    description: "ポートフォリオトップページに戻る",
  },
  {
    href: "/portfolio/playground/design",
    label: "Design Playground",
    description: "デザイン実験とアニメーション",
  },
  {
    href: "/portfolio/playground/WebGL",
    label: "WebGL Playground",
    description: "3DグラフィックスとWebGL実験",
  },
  {
    href: "/tools",
    label: "Tools",
    description: "開発ツールとユーティリティ",
  },
];

export const AccessiblePlaygroundNav: React.FC<
  AccessiblePlaygroundNavProps
> = ({ currentPage, className = "" }) => {
  const pathname = usePathname();
  const responsive = useResponsive();
  const { state: accessibilityState, announce } = useAccessibility();

  const navRef = useRef<HTMLElement | null>(null);
  const { enableFocusTrap, disableFocusTrap } = useFocusManagement(navRef);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Update navigation items with active state
  const navItems = navigationItems.map((item) => ({
    ...item,
    isActive: pathname === item.href,
  }));

  // Handle menu toggle
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const newState = !prev;
      if (newState) {
        announce("ナビゲーションメニューを開きました", "polite");
        if (accessibilityState.keyboardNavigation) {
          enableFocusTrap();
        }
      } else {
        announce("ナビゲーションメニューを閉じました", "polite");
        disableFocusTrap();
      }
      return newState;
    });
  }, [
    announce,
    accessibilityState.keyboardNavigation,
    enableFocusTrap,
    disableFocusTrap,
  ]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isMenuOpen && !accessibilityState.keyboardNavigation) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < navItems.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : navItems.length - 1,
          );
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(navItems.length - 1);
          break;
        case "Enter":
        case " ":
          if (focusedIndex >= 0) {
            e.preventDefault();
            const item = navItems[focusedIndex];
            announce(`${item.label}に移動します`, "polite");
            // Navigation will be handled by the Link component
          }
          break;
        case "Escape":
          if (isMenuOpen) {
            e.preventDefault();
            toggleMenu();
          }
          break;
      }
    },
    [
      isMenuOpen,
      accessibilityState.keyboardNavigation,
      navItems,
      focusedIndex,
      toggleMenu,
      announce,
    ],
  );

  // Set up keyboard event listeners
  useEffect(() => {
    if (isMenuOpen || accessibilityState.keyboardNavigation) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMenuOpen, accessibilityState.keyboardNavigation, handleKeyDown]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        disableFocusTrap();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen, disableFocusTrap]);

  // Get navigation link classes
  const getLinkClasses = (item: NavItem, index: number) => {
    const baseClasses = `
      block px-4 py-3 text-sm transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
      ${responsive.touch.isTouchDevice ? "active:bg-accent active:text-background" : "hover:bg-accent hover:text-background"}
    `;

    const stateClasses = item.isActive
      ? "bg-accent text-background font-medium"
      : "text-foreground";

    const focusClasses =
      focusedIndex === index
        ? "bg-accent bg-opacity-20 ring-2 ring-accent"
        : "";

    return `${baseClasses} ${stateClasses} ${focusClasses}`;
  };

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={toggleMenu}
      className={`
        md:hidden flex items-center px-3 py-2 border border-foreground text-foreground
        hover:border-accent hover:text-accent transition-colors
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
      `}
      aria-expanded={isMenuOpen}
      aria-controls="playground-navigation-menu"
      aria-label={
        isMenuOpen
          ? "ナビゲーションメニューを閉じる"
          : "ナビゲーションメニューを開く"
      }
    >
      {isMenuOpen ? (
        <X className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Menu className="w-5 h-5" aria-hidden="true" />
      )}
      <span className="ml-2 text-sm">{isMenuOpen ? "閉じる" : "メニュー"}</span>
    </button>
  );

  // Breadcrumb navigation
  const Breadcrumb = () => (
    <nav aria-label="パンくずナビゲーション" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            href="/"
            className="text-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <Home className="w-4 h-4" aria-label="ホーム" />
          </Link>
        </li>
        <li>
          <ChevronRight
            className="w-4 h-4 text-foreground opacity-50"
            aria-hidden="true"
          />
        </li>
        <li>
          <Link
            href="/portfolio"
            className="text-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Portfolio
          </Link>
        </li>
        <li>
          <ChevronRight
            className="w-4 h-4 text-foreground opacity-50"
            aria-hidden="true"
          />
        </li>
        <li>
          <span className="text-accent font-medium">
            {currentPage === "design"
              ? "Design Playground"
              : "WebGL Playground"}
          </span>
        </li>
      </ol>
    </nav>
  );

  return (
    <div className={className}>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-accent text-background px-4 py-2 text-sm font-medium"
      >
        メインコンテンツにスキップ
      </a>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Navigation */}
      <nav
        ref={navRef}
        className="relative"
        aria-label="プレイグラウンドナビゲーション"
      >
        {/* Mobile menu button */}
        <div className="flex justify-between items-center md:hidden mb-4">
          <h2 className="text-lg font-medium text-primary">
            {currentPage === "design"
              ? "Design Playground"
              : "WebGL Playground"}
          </h2>
          <MobileMenuButton />
        </div>

        {/* Navigation menu */}
        <div
          id="playground-navigation-menu"
          className={`
            ${
              responsive.isMobile
                ? `absolute top-full left-0 right-0 z-40 bg-background border border-foreground shadow-lg ${
                    isMenuOpen ? "block" : "hidden"
                  }`
                : "block"
            }
          `}
          role="menu"
          aria-orientation="vertical"
        >
          <div
            className={
              responsive.isMobile
                ? "py-2"
                : "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-0"
            }
          >
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClasses(item, index)}
                role="menuitem"
                aria-describedby={
                  item.description ? `nav-desc-${index}` : undefined
                }
                onFocus={() => setFocusedIndex(index)}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => {
                  if (responsive.isMobile) {
                    setIsMenuOpen(false);
                    disableFocusTrap();
                  }
                  announce(`${item.label}に移動しました`, "polite");
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  {item.isActive && (
                    <span className="sr-only">現在のページ</span>
                  )}
                </div>
                {item.description && (
                  <div
                    id={`nav-desc-${index}`}
                    className="text-xs opacity-75 mt-1"
                  >
                    {item.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu overlay */}
        {responsive.isMobile && isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-30"
            onClick={toggleMenu}
            aria-hidden="true"
          />
        )}
      </nav>

      {/* Keyboard shortcuts help */}
      {accessibilityState.keyboardNavigation && (
        <div className="mt-4 p-3 bg-base border border-foreground rounded text-xs">
          <h3 className="font-medium mb-2">キーボードナビゲーション</h3>
          <ul className="space-y-1 text-foreground">
            <li>
              <kbd className="px-1 py-0.5 bg-foreground text-background rounded text-xs">
                ↑↓
              </kbd>{" "}
              項目移動
            </li>
            <li>
              <kbd className="px-1 py-0.5 bg-foreground text-background rounded text-xs">
                Enter
              </kbd>{" "}
              選択
            </li>
            <li>
              <kbd className="px-1 py-0.5 bg-foreground text-background rounded text-xs">
                Esc
              </kbd>{" "}
              メニューを閉じる
            </li>
            <li>
              <kbd className="px-1 py-0.5 bg-foreground text-background rounded text-xs">
                Home/End
              </kbd>{" "}
              最初/最後の項目
            </li>
          </ul>
        </div>
      )}

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
};
