import React from "react";

const GradeCard = ({ grade }) => {
  // Define styles based on grade
  const getGradeStyles = (grade) => {
    switch (grade) {
      case "A":
        return {
          bg: "from-green-400 to-green-600",
          ring: "ring-green-200",
          bgOuter: "bg-green-50",
          text: "text-green-600",
          label: "Excellent!",
        };
      case "B":
        return {
          bg: "from-blue-400 to-blue-600",
          ring: "ring-blue-200",
          bgOuter: "bg-blue-50",
          text: "text-blue-600",
          label: "Good!",
        };
      case "C":
        return {
          bg: "from-yellow-400 to-yellow-600",
          ring: "ring-yellow-200",
          bgOuter: "bg-yellow-50",
          text: "text-yellow-600",
          label: "Average",
        };
      case "D":
        return {
          bg: "from-orange-400 to-orange-600",
          ring: "ring-orange-200",
          bgOuter: "bg-orange-50",
          text: "text-orange-600",
          label: "Needs Improvement",
        };
      case "F":
        return {
          bg: "from-red-400 to-red-600",
          ring: "ring-red-200",
          bgOuter: "bg-red-50",
          text: "text-red-600",
          label: "Poor",
        };
      default:
        return {
          bg: "from-gray-400 to-gray-600",
          ring: "ring-gray-200",
          bgOuter: "bg-gray-50",
          text: "text-gray-600",
          label: "Unknown",
        };
    }
  };

  const styles = getGradeStyles(grade);

  return (
    <div className="w-full">
      {/* ✅ Horizontal Layout - Gap Kam */}
      <div className="flex items-center  gap-4 sm:gap-3 md:gap-4 py-1 sm:py-2">
        
        {/* Circle - Chhota */}
        <div className="relative flex-shrink-0">
          <div
            className={`relative flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full ${styles.bgOuter} shadow-inner ring-4 sm:ring-4 ${styles.ring} animate-zoom`}
          >
            <div
              className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-[52px] md:w-[52px] items-center justify-center rounded-full bg-gradient-to-br ${styles.bg} text-white shadow-lg`}
            >
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                {grade}
              </span>
            </div>
          </div>
        </div>

        {/* Label - Right Side */}
        <div className="flex flex-col">
          <h3 className={`text-sm sm:text-base md:text-lg font-semibold ${styles.text}`}>
            {styles.label}
          </h3>
          <p className="text-[8px] sm:text-[10px] text-gray-500">
            Performance Grade
          </p>
        </div>
      </div>
    </div>
  );
};

export default GradeCard;