import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Pagination } from "../../components/Pagination";

describe("Pagination", () => {
  it("renders page numbers and navigates prev/next", () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={7} onPageChange={onPageChange} />,
    );

    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    // click a number
    fireEvent.click(screen.getByRole("button", { name: /go to page 4/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);

    // previous
    fireEvent.click(
      screen.getByRole("button", { name: /go to previous page/i }),
    );
    expect(onPageChange).toHaveBeenCalledWith(2);

    // next
    fireEvent.click(screen.getByTestId("next-page"));
    expect(onPageChange).toHaveBeenCalledWith(4);

    // shows page info
    expect(screen.getByText(/Page 3 of 7/i)).toBeInTheDocument();
  });
});
