"use client";

import { X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAccessibilityContext } from "./AccessibilityProvider";

interface AccessibleModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
	initialFocus?: React.RefObject<HTMLElement>;
	className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	closeOnOverlayClick = true,
	closeOnEscape = true,
	initialFocus,
	className = "",
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const [previousActiveElement, setPreviousActiveElement] =
		useState<Element | null>(null);
	const { announceToScreenReader } = useAccessibilityContext();

	// Size classes
	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
	};

	// Focus management
	useEffect(() => {
		if (isOpen) {
			// Store the currently focused element
			setPreviousActiveElement(document.activeElement);

			// Announce modal opening
			announceToScreenReader(`${title}ダイアログが開きました`, "assertive");

			// Focus the initial element or close button
			setTimeout(() => {
				if (initialFocus?.current) {
					initialFocus.current.focus();
				} else if (closeButtonRef.current) {
					closeButtonRef.current.focus();
				}
			}, 100);
		} else if (previousActiveElement) {
			// Return focus to the previously focused element
			(previousActiveElement as HTMLElement).focus();
			setPreviousActiveElement(null);
		}
	}, [
		isOpen,
		title,
		initialFocus,
		announceToScreenReader,
		previousActiveElement,
	]);

	// Trap focus within modal
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && closeOnEscape) {
				e.preventDefault();
				onClose();
				return;
			}

			if (e.key === "Tab") {
				const modal = modalRef.current;
				if (!modal) return;

				const focusableElements = modal.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				);
				const firstElement = focusableElements[0] as HTMLElement;
				const lastElement = focusableElements[
					focusableElements.length - 1
				] as HTMLElement;

				if (e.shiftKey) {
					// Shift + Tab
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeOnEscape, onClose]);

	// Handle overlay click
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (closeOnOverlayClick && e.target === overlayRef.current) {
			onClose();
		}
	};

	// Handle close button click
	const handleClose = () => {
		announceToScreenReader(`${title}ダイアログが閉じられました`);
		onClose();
	};

	if (!isOpen) return null;

	const modalContent = (
		<div
			ref={overlayRef}
			className="modal-overlay"
			onClick={handleOverlayClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div
				ref={modalRef}
				className={`modal-content ${sizeClasses[size]} ${className}`}
			>
				<div className="flex items-center justify-between mb-4">
					<h2 id="modal-title" className="text-xl font-semibold text-main">
						{title}
					</h2>
					<button
						ref={closeButtonRef}
						onClick={handleClose}
						className="modal-close"
						aria-label="ダイアログを閉じる"
						type="button"
					>
						<X size={24} aria-hidden="true" />
					</button>
				</div>

				<div className="modal-body">{children}</div>
			</div>
		</div>
	);

	// Render modal in portal
	return createPortal(modalContent, document.body);
};

interface AccessibleConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "warning" | "info";
	loading?: boolean;
}

export const AccessibleConfirmModal: React.FC<AccessibleConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "確認",
	cancelText = "キャンセル",
	variant = "info",
	confirmLabel,
	cancelLabel,
	loading,
}) => {
	const confirmButtonRef = useRef<HTMLButtonElement>(null);

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	const variantStyles = {
		danger: "text-red-600",
		warning: "text-yellow-600",
		info: "text-blue-600",
	};

	const buttonVariant = variant === "danger" ? "danger" : "primary";

	return (
		<AccessibleModal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			initialFocus={confirmButtonRef as React.RefObject<HTMLElement>}
			size="sm"
		>
			<div className="space-y-4">
				<p className={`text-base ${variantStyles[variant]}`}>{message}</p>

				<div className="flex space-x-3 justify-end">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-main bg-base border border-main rounded-md hover:bg-base focus:outline-none focus:ring-2 focus:ring-main"
					>
						{cancelLabel || cancelText}
					</button>
					<button
						type="button"
						ref={confirmButtonRef}
						onClick={handleConfirm}
						disabled={loading}
						className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 ${
							buttonVariant === "danger"
								? "text-white bg-red-600 border border-red-600 hover:bg-red-700 focus:ring-red-500"
								: "text-base bg-accent border border-accent hover:bg-base hover:text-accent focus:ring-accent"
						} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						{confirmLabel || confirmText}
					</button>
				</div>
			</div>
		</AccessibleModal>
	);
};
