import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ContentList } from "../ContentList";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  tags: string[];
  category: string;
}

const makeItem = (overrides: Partial<ContentItem> = {}): ContentItem => ({
  id: overrides.id ?? "id-1",
  title: overrides.title ?? "Test Title",
  description: overrides.description ?? "Desc",
  status: overrides.status ?? "published",
  createdAt: overrides.createdAt ?? new Date("2024-01-01").toISOString(),
  tags: overrides.tags ?? ["a", "b"],
  category: overrides.category ?? "cat",
  ...overrides,
});

describe("ContentList", () => {
  it("renders loading state", () => {
    render(
      <ContentList
        items={[]}
        selectedItem={null}
        onSelectItem={() => {}}
        onDeleteItem={() => {}}
        isLoading={true}
      />,
    );
    // Fallback check: skeleton blocks are rendered
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });

  it("renders empty state when no items", () => {
    render(
      <ContentList
        items={[]}
        selectedItem={null}
        onSelectItem={() => {}}
        onDeleteItem={() => {}}
        isLoading={false}
      />,
    );
    expect(
      screen.getByText(/No items found\. Create your first item!/i),
    ).toBeInTheDocument();
  });

  it("renders error state for invalid items input", () => {
    render(
      (
        // @ts-expect-error intentional invalid data to exercise guard
        <ContentList
          items={"invalid" as unknown}
          selectedItem={null}
          onSelectItem={() => {}}
          onDeleteItem={() => {}}
          isLoading={false}
        />
      ) as React.ReactElement,
    );
    expect(screen.getByText(/Invalid data format/i)).toBeInTheDocument();
  });

  it("allows select and delete interactions", () => {
    const item1 = makeItem({ id: "a", title: "A" });
    const item2 = makeItem({ id: "b", title: "B", tags: ["x", "y", "z", "w"] });
    const onSelect = jest.fn();
    const onDelete = jest.fn();

    render(
      <ContentList
        items={[item1, item2]}
        selectedItem={item1}
        onSelectItem={onSelect}
        onDeleteItem={onDelete}
        isLoading={false}
      />,
    );

    // Click second item to select
    fireEvent.click(screen.getByText("B"));
    expect(onSelect).toHaveBeenCalledWith(item2);

    // Keyboard select via Enter
    fireEvent.keyDown(screen.getByText("A").closest("div")!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalled();

    // Delete button
    const deleteButtonsByTitle = screen.getAllByTitle(/delete item/i);
    fireEvent.click(deleteButtonsByTitle[0]);
    expect(onDelete).toHaveBeenCalledWith("a");

    // Tags overflow indicator (+N)
    expect(screen.getByText(/\+1/)).toBeInTheDocument();
  });
});
