import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface InteractiveDemoProps {
  title: string;
  description: string;
  demoId: string;
  children?: React.ReactNode;
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({
  title,
  description,
  demoId,
  children,
}) => {
  const [isActive, setIsActive] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, height: 0 },
        {
          opacity: 1,
          height: "auto",
          duration: 0.5,
          ease: "power2.out",
        }
      );
    } else if (!isActive && contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        height: 0,
        duration: 0.5,
        ease: "power2.in",
      });
    }
  }, [isActive]);

  const toggleDemo = () => {
    setIsActive(!isActive);
  };

  return (
    <div ref={demoRef} id={demoId} className="mb-8">
      <Card animate={false} className="overflow-visible">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <Button
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onClick={toggleDemo}
            >
              {isActive ? "Hide Demo" : "Show Demo"}
            </Button>
          </div>
          <p className="text-gray-600">{description}</p>

          <div
            ref={contentRef}
            className="mt-6 overflow-hidden"
            style={{ height: 0, opacity: 0 }}
          >
            <div className="border-t border-gray-200 pt-4">{children}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InteractiveDemo;
