"use client";

import {
  invalidateOnContentUpdate,
  invalidateOnMarkdownUpdate,
} from "@/lib/cache/cache-invalidation-strategy";
import { trackCacheQuery } from "@/lib/cache/cache-performance-monitor";
import { enhancedDataCache } from "@/lib/cache/EnhancedCacheManager";
import { EnhancedCategoryType, EnhancedContentItem } from "@/types";
import { ContentItem } from "@/types/content";
import { useCallback, useEffect, useReducer, useRef } from "react";

// State types
interface DataManagerState {
  formData: EnhancedContentItem;
  originalData: EnhancedContentItem | null;
  validationErrors: Record<string, string>;
  hasUnsavedChanges: boolean;
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  changeHistory: ChangeHistoryEntry[];
  currentHistoryIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

interface ChangeHistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  formData: EnhancedContentItem;
}

// Action types
type DataManagerAction =
  | {
      type: "INITIALIZE";
      payload: {
        item?: ContentItem | EnhancedContentItem;
        mode: "create" | "edit";
      };
    }
  | {
      type: "UPDATE_FIELD";
      payload: { field: keyof EnhancedContentItem; value: unknown };
    }
  | { type: "SET_VALIDATION_ERRORS"; payload: Record<string, string> }
  | { type: "CLEAR_VALIDATION_ERROR"; payload: string }
  | { type: "SET_AUTO_SAVING"; payload: boolean }
  | { type: "MARK_SAVED"; payload: Date }
  | { type: "RESET_CHANGES" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | {
      type: "ADD_HISTORY_ENTRY";
      payload: Omit<ChangeHistoryEntry, "id" | "timestamp">;
    };

// Helper function to check if item is enhanced
function isEnhancedContentItem(item: unknown): item is EnhancedContentItem {
  return (
    Boolean(item) &&
    typeof item === "object" &&
    item !== null &&
    "categories" in item &&
    Array.isArray((item as EnhancedContentItem).categories)
  );
}

// Helper function to migrate legacy item
function migrateLegacyItem(legacyItem: ContentItem): EnhancedContentItem {
  return {
    ...legacyItem,
    categories: legacyItem.category
      ? [legacyItem.category as EnhancedCategoryType]
      : [],
    isOtherCategory: legacyItem.category === "other",
    useManualDate: false,
    originalImages: [],
    processedImages: legacyItem.images || [],
  };
}

// Helper function to create new item
function createNewItem(): EnhancedContentItem {
  return {
    id: "",
    title: "",
    description: "",
    content: "",
    type: "portfolio",
    categories: [],
    isOtherCategory: false,
    status: "draft",
    priority: 50,
    tags: [],
    images: [],
    processedImages: [],
    originalImages: [],
    videos: [],
    externalLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useManualDate: false,
    downloadUrl: "",
    fileSize: "",
    fileFormat: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  };
}

// Helper function to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Reducer function
function dataManagerReducer(
  state: DataManagerState,
  action: DataManagerAction,
): DataManagerState {
  switch (action.type) {
    case "INITIALIZE": {
      const { item, mode } = action.payload;
      let formData: EnhancedContentItem;

      if (item && isEnhancedContentItem(item)) {
        formData = { ...item };
      } else if (item) {
        formData = migrateLegacyItem(item as ContentItem);
      } else {
        formData = createNewItem();
      }

      return {
        ...state,
        formData,
        originalData: mode === "edit" ? { ...formData } : null,
        hasUnsavedChanges: false,
        isDirty: false,
        changeHistory: [
          {
            id: generateId(),
            timestamp: new Date(),
            action: "initialize",
            formData: { ...formData },
          },
        ],
        currentHistoryIndex: 0,
        canUndo: false,
        canRedo: false,
      };
    }

    case "UPDATE_FIELD": {
      const { field, value } = action.payload;
      const newFormData = {
        ...state.formData,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };

      const hasChanges = state.originalData
        ? JSON.stringify(newFormData) !== JSON.stringify(state.originalData)
        : newFormData.title.trim() !== "" ||
          newFormData.description.trim() !== "";

      // Add to history
      const newHistoryEntry: ChangeHistoryEntry = {
        id: generateId(),
        timestamp: new Date(),
        action: "update_field",
        field: field as string,
        oldValue: state.formData[field],
        newValue: value,
        formData: { ...newFormData },
      };

      // Truncate history if we're not at the end
      const newHistory = [
        ...state.changeHistory.slice(0, state.currentHistoryIndex + 1),
        newHistoryEntry,
      ];

      // Limit history size
      const maxHistorySize = 50;
      const trimmedHistory =
        newHistory.length > maxHistorySize
          ? newHistory.slice(-maxHistorySize)
          : newHistory;

      const newHistoryIndex = trimmedHistory.length - 1;

      return {
        ...state,
        formData: newFormData,
        hasUnsavedChanges: hasChanges,
        isDirty: true,
        changeHistory: trimmedHistory,
        currentHistoryIndex: newHistoryIndex,
        canUndo: newHistoryIndex > 0,
        canRedo: false,
      };
    }

    case "SET_VALIDATION_ERRORS": {
      return {
        ...state,
        validationErrors: action.payload,
      };
    }

    case "CLEAR_VALIDATION_ERROR": {
      const newErrors = { ...state.validationErrors };
      delete newErrors[action.payload];
      return {
        ...state,
        validationErrors: newErrors,
      };
    }

    case "SET_AUTO_SAVING": {
      return {
        ...state,
        isAutoSaving: action.payload,
      };
    }

    case "MARK_SAVED": {
      return {
        ...state,
        hasUnsavedChanges: false,
        isDirty: false,
        isAutoSaving: false,
        lastSaved: action.payload,
        originalData: { ...state.formData },
      };
    }

    case "RESET_CHANGES": {
      if (!state.originalData) return state;

      return {
        ...state,
        formData: { ...state.originalData },
        hasUnsavedChanges: false,
        isDirty: false,
        validationErrors: {},
      };
    }

    case "UNDO": {
      if (!state.canUndo || state.currentHistoryIndex <= 0) return state;

      const newIndex = state.currentHistoryIndex - 1;
      const targetEntry = state.changeHistory[newIndex];

      return {
        ...state,
        formData: { ...targetEntry.formData },
        currentHistoryIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        hasUnsavedChanges: state.originalData
          ? JSON.stringify(targetEntry.formData) !==
            JSON.stringify(state.originalData)
          : targetEntry.formData.title.trim() !== "" ||
            targetEntry.formData.description.trim() !== "",
        isDirty: true,
      };
    }

    case "REDO": {
      if (
        !state.canRedo ||
        state.currentHistoryIndex >= state.changeHistory.length - 1
      )
        return state;

      const newIndex = state.currentHistoryIndex + 1;
      const targetEntry = state.changeHistory[newIndex];

      return {
        ...state,
        formData: { ...targetEntry.formData },
        currentHistoryIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.changeHistory.length - 1,
        hasUnsavedChanges: state.originalData
          ? JSON.stringify(targetEntry.formData) !==
            JSON.stringify(state.originalData)
          : targetEntry.formData.title.trim() !== "" ||
            targetEntry.formData.description.trim() !== "",
        isDirty: true,
      };
    }

    case "ADD_HISTORY_ENTRY": {
      const newEntry: ChangeHistoryEntry = {
        ...action.payload,
        id: generateId(),
        timestamp: new Date(),
      };

      const newHistory = [
        ...state.changeHistory.slice(0, state.currentHistoryIndex + 1),
        newEntry,
      ];

      const maxHistorySize = 50;
      const trimmedHistory =
        newHistory.length > maxHistorySize
          ? newHistory.slice(-maxHistorySize)
          : newHistory;

      const newHistoryIndex = trimmedHistory.length - 1;

      return {
        ...state,
        changeHistory: trimmedHistory,
        currentHistoryIndex: newHistoryIndex,
        canUndo: newHistoryIndex > 0,
        canRedo: false,
      };
    }

    default:
      return state;
  }
}

// Initial state
const initialState: DataManagerState = {
  formData: createNewItem(),
  originalData: null,
  validationErrors: {},
  hasUnsavedChanges: false,
  isDirty: false,
  isAutoSaving: false,
  lastSaved: null,
  changeHistory: [],
  currentHistoryIndex: -1,
  canUndo: false,
  canRedo: false,
};

// Custom hook
export function useEnhancedDataManager(
  item?: ContentItem | EnhancedContentItem,
  mode: "create" | "edit" = "create",
  autoSaveInterval: number = 30000, // 30 seconds
  onAutoSave?: (data: EnhancedContentItem) => Promise<void>,
) {
  const [state, dispatch] = useReducer(dataManagerReducer, initialState);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<string>("");

  // Initialize
  useEffect(() => {
    dispatch({ type: "INITIALIZE", payload: { item, mode } });
  }, [item, mode]);

  // Auto-save functionality
  useEffect(() => {
    if (!onAutoSave || !state.isDirty || state.isAutoSaving) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const currentDataString = JSON.stringify(state.formData);

      // Skip if data hasn't changed since last auto-save
      if (currentDataString === lastAutoSaveRef.current) return;

      // Skip if there are validation errors
      if (Object.keys(state.validationErrors).length > 0) return;

      try {
        dispatch({ type: "SET_AUTO_SAVING", payload: true });
        await onAutoSave(state.formData);
        dispatch({ type: "MARK_SAVED", payload: new Date() });
        lastAutoSaveRef.current = currentDataString;
      } catch (error) {
        console.error("Auto-save failed:", error);
        dispatch({ type: "SET_AUTO_SAVING", payload: false });
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    state.formData,
    state.isDirty,
    state.isAutoSaving,
    state.validationErrors,
    onAutoSave,
    autoSaveInterval,
  ]);

  // URL validation helper
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Field update handler with enhanced caching
  const updateField = useCallback(
    <K extends keyof EnhancedContentItem>(
      field: K,
      value: EnhancedContentItem[K],
    ) => {
      dispatch({ type: "UPDATE_FIELD", payload: { field, value } });

      // Enhanced cache management
      if (state.formData.id) {
        // Cache markdown content if it's being updated
        if (field === "content" && typeof value === "string") {
          enhancedDataCache.setContentData(
            `content:${state.formData.id}`,
            value,
          );
        }

        // Cache markdown file path updates
        if (field === "markdownPath" && typeof value === "string") {
          enhancedDataCache.setContentData(
            `markdownPath:${state.formData.id}`,
            value,
          );
        }

        // Invalidate related caches when important fields change
        if (field === "categories" || field === "tags" || field === "title") {
          invalidateOnContentUpdate(
            state.formData.id,
            Array.isArray(value) &&
              field === "categories" &&
              typeof value[0] === "string"
              ? value[0]
              : undefined,
          );
        }
      }

      // Clear validation error for this field
      if (state.validationErrors[field as string]) {
        dispatch({ type: "CLEAR_VALIDATION_ERROR", payload: field as string });
      }
    },
    [state.validationErrors, state.formData.id],
  );

  // Validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!state.formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!state.formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (state.formData.categories.length === 0) {
      errors.categories = "At least one category is required";
    }

    if (
      state.formData.type === "download" &&
      !state.formData.downloadUrl?.trim()
    ) {
      errors.downloadUrl = "Download URL is required for download items";
    }

    // URL validation for external links
    state.formData.externalLinks?.forEach((link, index) => {
      if (link.url && !isValidUrl(link.url)) {
        errors[`externalLinks.${index}.url`] = "Invalid URL format";
      }
    });

    dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
    return Object.keys(errors).length === 0;
  }, [state.formData, isValidUrl]);

  // History management
  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const resetChanges = useCallback(() => {
    dispatch({ type: "RESET_CHANGES" });
  }, []);

  // Manual save
  const markSaved = useCallback(() => {
    dispatch({ type: "MARK_SAVED", payload: new Date() });
  }, []);

  // Add custom history entry
  const addHistoryEntry = useCallback(
    (action: string, details?: Record<string, unknown>) => {
      dispatch({
        type: "ADD_HISTORY_ENTRY",
        payload: {
          action,
          formData: { ...state.formData },
          ...details,
        },
      });
    },
    [state.formData],
  );

  // Cache-aware data loading
  const loadMarkdownContent = useCallback(
    async (filePath: string): Promise<string | null> => {
      return trackCacheQuery(`markdown:${filePath}`, async () => {
        return await enhancedDataCache.getMarkdownContent(filePath);
      });
    },
    [],
  );

  // Cache-aware data saving with invalidation
  const saveWithCacheInvalidation = useCallback(
    async (
      saveFunction: (data: EnhancedContentItem) => Promise<void>,
    ): Promise<void> => {
      try {
        await saveFunction(state.formData);

        // Invalidate relevant caches after successful save
        if (state.formData.id) {
          invalidateOnContentUpdate(
            state.formData.id,
            state.formData.categories[0],
          );

          // If markdown path changed, invalidate markdown cache
          if (state.formData.markdownPath) {
            invalidateOnMarkdownUpdate(state.formData.markdownPath);
          }
        }

        markSaved();
      } catch (error) {
        console.error("Save failed:", error);
        throw error;
      }
    },
    [state.formData, markSaved],
  );

  // Get cache statistics for debugging
  const getCacheStats = useCallback(() => {
    return enhancedDataCache.getCacheStats();
  }, []);

  // Preload related data into cache
  const preloadRelatedData = useCallback(async () => {
    if (!state.formData.id) return;

    try {
      // Preload markdown content if path exists
      if (state.formData.markdownPath) {
        await loadMarkdownContent(state.formData.markdownPath);
      }

      // Preload tag data
      await enhancedDataCache.getTagList();

      console.log("[DataManager] Preloaded related data into cache");
    } catch (error) {
      console.warn("[DataManager] Failed to preload related data:", error);
    }
  }, [state.formData.id, state.formData.markdownPath, loadMarkdownContent]);

  return {
    // State
    formData: state.formData,
    validationErrors: state.validationErrors,
    hasUnsavedChanges: state.hasUnsavedChanges,
    isDirty: state.isDirty,
    isAutoSaving: state.isAutoSaving,
    lastSaved: state.lastSaved,
    changeHistory: state.changeHistory,
    canUndo: state.canUndo,
    canRedo: state.canRedo,

    // Actions
    updateField,
    validateForm,
    undo,
    redo,
    resetChanges,
    markSaved,
    addHistoryEntry,

    // Cache-aware methods
    loadMarkdownContent,
    saveWithCacheInvalidation,
    getCacheStats,
    preloadRelatedData,
  };
}
