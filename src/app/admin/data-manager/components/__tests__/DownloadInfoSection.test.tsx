import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { DownloadInfoSection } from "../DownloadInfoSection";

describe("DownloadInfoSection", () => {
  it("renders upload area when no info and supports manual entry", () => {
    const onChange = jest.fn();
    render(<DownloadInfoSection onDownloadInfoChange={onChange} />);

    expect(screen.getByText(/Download Information/i)).toBeInTheDocument();
    // Manual entry
    const fileNameInput = screen.getByPlaceholderText(/File name/i);
    fireEvent.blur(fileNameInput, { target: { value: "my-asset.zip" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "my-asset.zip" }),
    );
  });

  it("shows form with details when info provided and can remove it", () => {
    const onChange = jest.fn();
    const info = {
      fileName: "data.json",
      fileSize: 1024,
      fileType: "application/json",
      downloadCount: 2,
      version: "1.0.0",
    };
    render(
      <DownloadInfoSection
        downloadInfo={info}
        onDownloadInfoChange={onChange}
      />,
    );

    expect(screen.getByText(/File Information/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Remove File/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
