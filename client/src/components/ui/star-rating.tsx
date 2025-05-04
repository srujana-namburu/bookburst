import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "md",
  onRate,
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-2xl",
  };

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readOnly || !onRate) return;
    onRate(index);
  };

  return (
    <div className={cn("flex", className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={cn(
              "cursor-pointer transition-colors",
              sizeClasses[size],
              (hoverRating || rating) >= starValue
                ? "text-[#D4AF37]"
                : "text-gray-300",
              !readOnly && "hover:text-[#D4AF37]"
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
