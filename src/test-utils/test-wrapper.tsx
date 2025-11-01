// 共通のテストラッパーコンポーネント
import React from "react";

interface TestWrapperProps {
	children: React.ReactNode;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
	return <div data-testid="test-wrapper">{children}</div>;
};

export default TestWrapper;
