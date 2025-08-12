import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ExternalLinksSection } from "../ExternalLinksSection";

describe("ExternalLinksSection", () => {
  it("adds and removes links, toggling form visibility", () => {
    const onChange = jest.fn();
    render(<ExternalLinksSection links={[]} onLinksChange={onChange} />);

    // Open add form
    fireEvent.click(screen.getByRole("button", { name: /add link/i }));

    // Fill required fields
    const titleInput = screen.getByPlaceholderText(/link title/i);
    fireEvent.change(titleInput, {
      target: { value: "My Repo" },
    });
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i);
    fireEvent.change(urlInput, {
      target: { value: "https://example.com" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /^add link$/i }));
    expect(onChange).toHaveBeenCalled();

    // Render with one link and remove it
    const newLinks = [
      { type: "website", title: "My Repo", url: "https://example.com" },
    ];
    onChange.mockClear();
    render(<ExternalLinksSection links={newLinks} onLinksChange={onChange} />);
    // Use title attribute instead of accessible name
    fireEvent.click(screen.getByTitle(/remove link/i));
    expect(onChange).toHaveBeenCalled();
  });
});
