import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const CalculatorPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
        }
      );
    }
  }, []);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (
    firstOperand: number,
    secondOperand: number,
    operator: string
  ) => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget as HTMLButtonElement;

    // Button animation
    gsap.fromTo(button, { scale: 0.95 }, { scale: 1, duration: 0.2 });

    const value = button.dataset.value;

    if (!value) return;

    if (value === "clear") {
      clearDisplay();
      return;
    }

    if (value === ".") {
      inputDecimal();
      return;
    }

    if (["+", "-", "*", "/", "="].includes(value)) {
      if (value === "=") {
        if (firstOperand !== null && operator) {
          const secondOperand = parseFloat(display);
          const result = calculate(firstOperand, secondOperand, operator);
          setDisplay(String(result));
          setFirstOperand(null);
          setOperator(null);
          setWaitingForSecondOperand(false);
        }
      } else {
        performOperation(value);
      }
      return;
    }

    inputDigit(value);
  };

  return (
    <Layout
      title="Calculator Tool"
      description="A simple calculator tool for basic calculations"
    >
      <div ref={contentRef}>
        <div className="mb-4">
          <Link
            href="/tools"
            className="inline-flex items-center text-primary-500 hover:text-primary-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Tools
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Calculator</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md mx-auto">
          <div className="bg-gray-100 p-4 rounded-md mb-4 text-right">
            <div className="text-2xl font-mono">{display}</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              data-value="clear"
              onClick={handleButtonClick}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded col-span-2"
            >
              Clear
            </button>
            <button
              data-value="/"
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded"
            >
              ÷
            </button>
            <button
              data-value="*"
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded"
            >
              ×
            </button>

            {[7, 8, 9].map((num) => (
              <button
                key={num}
                data-value={num.toString()}
                onClick={handleButtonClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                {num}
              </button>
            ))}
            <button
              data-value="-"
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded"
            >
              -
            </button>

            {[4, 5, 6].map((num) => (
              <button
                key={num}
                data-value={num.toString()}
                onClick={handleButtonClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                {num}
              </button>
            ))}
            <button
              data-value="+"
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded"
            >
              +
            </button>

            {[1, 2, 3].map((num) => (
              <button
                key={num}
                data-value={num.toString()}
                onClick={handleButtonClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                {num}
              </button>
            ))}
            <button
              data-value="="
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded row-span-2"
            >
              =
            </button>

            <button
              data-value="0"
              onClick={handleButtonClick}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded col-span-2"
            >
              0
            </button>
            <button
              data-value="."
              onClick={handleButtonClick}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              .
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalculatorPage;
