interface DataManagerFooterProps {
	isLoading: boolean;
	isClient: boolean;
}

export function DataManagerFooter({
	isLoading,
	isClient,
}: DataManagerFooterProps) {
	if (!isLoading) return null;

	return (
		<div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
			<div className="  p-6 rounded">
				<p className="noto-sans-jp-regular text-sm">
					{isClient ? "処理中..." : "Processing..."}
				</p>
			</div>
		</div>
	);
}
