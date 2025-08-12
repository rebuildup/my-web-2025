import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { MediaEmbedSection } from "../MediaEmbedSection";

describe("MediaEmbedSection", () => {
  it("adds media via form and removes it", () => {
    const onVideosChange = jest.fn();
    render(<MediaEmbedSection videos={[]} onVideosChange={onVideosChange} />);

    fireEvent.click(screen.getByRole("button", { name: /add media/i }));

    fireEvent.change(
      screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch\?v=/i),
      {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /^add media$/i }));
    expect(onVideosChange).toHaveBeenCalled();

    const videos = [
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "t",
      },
    ];
    onVideosChange.mockClear();
    render(
      <MediaEmbedSection videos={videos} onVideosChange={onVideosChange} />,
    );
    // Use title attribute instead of accessible name
    fireEvent.click(screen.getByTitle(/remove media/i));
    expect(onVideosChange).toHaveBeenCalled();
  });
});
