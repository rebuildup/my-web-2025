"use client";

import type { DatePickerProps } from "@/types/enhanced-content";
import { Calendar, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./button";

interface DatePickerState {
  inputValue: string;
  isCalendarOpen: boolean;
  validationError: string | null;
  selectedDate: Date | null;
}

export function DatePicker({
  value,
  onChange,
  useManualDate,
  onToggleManualDate,
  placeholder = "Select date...",
}: DatePickerProps) {
  const [state, setState] = useState<DatePickerState>({
    inputValue: "",
    isCalendarOpen: false,
    validationError: null,
    selectedDate: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize input value from props
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setState((prev) => ({
          ...prev,
          inputValue: formatDateForInput(date),
          selectedDate: date,
          validationError: null,
        }));
      }
    } else if (useManualDate) {
      setState((prev) => ({
        ...prev,
        inputValue: "",
        selectedDate: null,
      }));
    } else {
      // Auto mode - use current date
      const now = new Date();
      setState((prev) => ({
        ...prev,
        inputValue: formatDateForInput(now),
        selectedDate: now,
      }));
    }
  }, [value, useManualDate]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setState((prev) => ({ ...prev, isCalendarOpen: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateForInput = (date: Date): string => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const validateDate = useCallback((dateString: string): Date | null => {
    if (!dateString.trim()) return null;

    // Try parsing various formats
    const formats = [
      // YYYY/MM/DD
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        const [, part1, part2, part3] = match;
        let year: number, month: number, day: number;

        if (format === formats[2]) {
          // MM/DD/YYYY format
          month = parseInt(part1, 10) - 1;
          day = parseInt(part2, 10);
          year = parseInt(part3, 10);
        } else {
          // YYYY/MM/DD or YYYY-MM-DD format
          year = parseInt(part1, 10);
          month = parseInt(part2, 10) - 1;
          day = parseInt(part3, 10);
        }

        // Validate the parsed values
        if (year < 1900 || year > 2100) return null;
        if (month < 0 || month > 11) return null;
        if (day < 1 || day > 31) return null;

        const date = new Date(year, month, day);

        // Check if the date is valid and matches the input
        if (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        ) {
          // Set time to noon to avoid timezone issues
          date.setHours(12, 0, 0, 0);
          return date;
        }
      }
    }

    return null; // Don't use fallback parsing to avoid unexpected results
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setState((prev) => ({ ...prev, inputValue }));

    if (!useManualDate) return;

    if (!inputValue.trim()) {
      setState((prev) => ({
        ...prev,
        validationError: null,
        selectedDate: null,
      }));
      onChange("");
      return;
    }

    const parsedDate = validateDate(inputValue);
    if (parsedDate) {
      setState((prev) => ({
        ...prev,
        validationError: null,
        selectedDate: parsedDate,
      }));
      onChange(parsedDate.toISOString());
    } else {
      setState((prev) => ({
        ...prev,
        validationError: "Invalid date format. Use YYYY/MM/DD format.",
        selectedDate: null,
      }));
    }
  };

  const handleInputBlur = () => {
    if (!useManualDate || !state.inputValue.trim()) return;

    const parsedDate = validateDate(state.inputValue);
    if (parsedDate) {
      setState((prev) => ({
        ...prev,
        inputValue: formatDateForInput(parsedDate),
        validationError: null,
        selectedDate: parsedDate,
      }));
    }
  };

  const handleCalendarToggle = () => {
    if (!useManualDate) return;
    setState((prev) => ({ ...prev, isCalendarOpen: !prev.isCalendarOpen }));
  };

  const handleDateSelect = (date: Date) => {
    setState((prev) => ({
      ...prev,
      inputValue: formatDateForInput(date),
      selectedDate: date,
      isCalendarOpen: false,
      validationError: null,
    }));
    onChange(date.toISOString());
  };

  const handleToggleManualDate = () => {
    const newUseManualDate = !useManualDate;
    onToggleManualDate(newUseManualDate);

    if (!newUseManualDate) {
      // Switching to auto mode - use current date
      const now = new Date();
      setState((prev) => ({
        ...prev,
        inputValue: formatDateForInput(now),
        selectedDate: now,
        validationError: null,
        isCalendarOpen: false,
      }));
      onChange(now.toISOString());
    }
  };

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const currentDate = state.selectedDate || new Date();
  const calendarYear = currentDate.getFullYear();
  const calendarMonth = currentDate.getMonth();
  const calendarDays = generateCalendarDays(calendarYear, calendarMonth);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setState((prev) => ({ ...prev, selectedDate: newDate }));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      state.selectedDate &&
      date.getDate() === state.selectedDate.getDate() &&
      date.getMonth() === state.selectedDate.getMonth() &&
      date.getFullYear() === state.selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === calendarMonth;
  };

  return (
    <div className="space-y-3">
      {/* Manual/Auto Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Date Setting
        </label>
        <button
          type="button"
          onClick={handleToggleManualDate}
          className={`
            flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors
            ${
              useManualDate
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
          aria-label={`Switch to ${useManualDate ? "automatic" : "manual"} date mode`}
        >
          {useManualDate ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          {useManualDate ? "Manual" : "Auto"}
        </button>
      </div>

      {/* Date Input */}
      <div className="relative">
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={inputRef}
            type="text"
            value={state.inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={useManualDate ? placeholder : "Auto (current date)"}
            disabled={!useManualDate}
            className={`
              w-full pl-10 pr-12 py-2 border rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${
                state.validationError
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }
              ${!useManualDate ? "opacity-60" : ""}
            `}
          />
          {useManualDate && (
            <button
              type="button"
              onClick={handleCalendarToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Open calendar"
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Validation Error */}
        {state.validationError && (
          <p className="mt-1 text-sm text-red-600">{state.validationError}</p>
        )}

        {/* Date Display */}
        {state.selectedDate && !state.validationError && (
          <p className="mt-1 text-sm text-gray-600">
            {formatDateForDisplay(state.selectedDate)}
          </p>
        )}
      </div>

      {/* Calendar Dropdown */}
      {state.isCalendarOpen && useManualDate && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              ←
            </Button>
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
              })}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(date)}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${
                    isSelected(date)
                      ? "bg-blue-500 text-white"
                      : isToday(date)
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : isCurrentMonth(date)
                          ? "text-gray-900 hover:bg-gray-100"
                          : "text-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDateSelect(new Date())}
              className="flex-1"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setState((prev) => ({ ...prev, isCalendarOpen: false }))
              }
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
