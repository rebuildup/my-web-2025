/**
 * Google Analytics Configuration
 * 直接記述による確実なデータ収集のための設定
 */

export const GA_CONFIG = {
  // Google Analytics Measurement ID
  // 実際のMeasurement IDに置き換えてください
  MEASUREMENT_ID: "G-RHP8NQ10X2", // ここに実際のMeasurement IDを入力

  // デバッグモード設定
  DEBUG_MODE: process.env.NODE_ENV === "development",

  // プライバシー設定
  PRIVACY_SETTINGS: {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: "SameSite=None;Secure",
  },

  // カスタムディメンション設定
  CUSTOM_DIMENSIONS: {
    portfolio_section: "dimension1",
    content_id: "dimension2",
    search_type: "dimension3",
  },

  // イベントカテゴリ
  EVENT_CATEGORIES: {
    PORTFOLIO: "Portfolio",
    PORTFOLIO_ENGAGEMENT: "Portfolio Engagement",
    PORTFOLIO_SEARCH: "Portfolio Search",
    PORTFOLIO_PERFORMANCE: "Portfolio Performance",
    TEST: "Test",
  },

  // イベントアクション
  EVENT_ACTIONS: {
    PAGE_VIEW: "page_view",
    PORTFOLIO_VIEW: "portfolio_view",
    PORTFOLIO_DOWNLOAD: "portfolio_download",
    PORTFOLIO_SHARE: "portfolio_share",
    PORTFOLIO_LIKE: "portfolio_like",
    PORTFOLIO_SEARCH: "portfolio_search",
    TEST_EVENT: "test_event",
  },
} as const;

/**
 * Google Analytics初期化関数
 */
export function initializeGoogleAnalytics(): void {
  if (typeof window === "undefined") return;

  // dataLayer初期化
  window.dataLayer = window.dataLayer || [];

  // gtag関数定義
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }

  window.gtag = gtag;

  // Google Analytics設定
  gtag("js", new Date());
  gtag("config", GA_CONFIG.MEASUREMENT_ID, {
    ...GA_CONFIG.PRIVACY_SETTINGS,
    debug_mode: GA_CONFIG.DEBUG_MODE,
  });

  if (GA_CONFIG.DEBUG_MODE) {
    console.log(
      "Google Analytics initialized with ID:",
      GA_CONFIG.MEASUREMENT_ID,
    );
  }
}

/**
 * イベント送信関数
 */
export function sendGAEvent(
  action: string,
  category: string = GA_CONFIG.EVENT_CATEGORIES.PORTFOLIO,
  label?: string,
  value?: number,
  customParameters?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.warn("Google Analytics gtag not available");
    return;
  }

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters,
  });

  if (GA_CONFIG.DEBUG_MODE) {
    console.log(`GA Event sent: ${action}`, {
      category,
      label,
      value,
      customParameters,
    });
  }
}

/**
 * ページビュー送信関数
 */
export function sendGAPageView(
  pagePath: string,
  pageTitle: string,
  contentId?: string,
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.warn("Google Analytics gtag not available");
    return;
  }

  window.gtag("config", GA_CONFIG.MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle,
    custom_map: {
      [GA_CONFIG.CUSTOM_DIMENSIONS.portfolio_section]: "portfolio_section",
      [GA_CONFIG.CUSTOM_DIMENSIONS.content_id]: contentId || "unknown",
    },
  });

  if (GA_CONFIG.DEBUG_MODE) {
    console.log(`GA Page View sent: ${pagePath}`, { pageTitle, contentId });
  }
}
