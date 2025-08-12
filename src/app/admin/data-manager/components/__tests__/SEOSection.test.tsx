import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SEOSection } from "../SEOSection";

describe("SEOSection", () => {
  it("edits basic fields and toggles flags", () => {
    const onSEOChange = jest.fn();
    render(<SEOSection onSEOChange={onSEOChange} />);

    fireEvent.change(
      screen.getByPlaceholderText(/custom title for search engines/i),
      {
        target: { value: "Title" },
      },
    );
    fireEvent.change(
      screen.getByPlaceholderText(/Description for search engines/i),
      {
        target: { value: "Desc" },
      },
    );
    fireEvent.change(
      screen.getByPlaceholderText(/keyword1, keyword2, keyword3/i),
      {
        target: { value: "a, b" },
      },
    );
    fireEvent.change(screen.getByPlaceholderText(/og-image\.png/i), {
      target: { value: "https://example.com/og.png" },
    });
    fireEvent.change(screen.getByPlaceholderText(/twitter-image\.jpg/i), {
      target: { value: "https://example.com/tw.png" },
    });
    fireEvent.change(screen.getByPlaceholderText(/canonical-url/i), {
      target: { value: "https://example.com" },
    });

    fireEvent.click(screen.getByLabelText(/No Index/i));
    fireEvent.click(screen.getByLabelText(/No Follow/i));

    expect(onSEOChange).toHaveBeenCalled();
  });
});
