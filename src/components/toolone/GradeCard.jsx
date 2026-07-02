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
      <div className="flex flex-col items-center justify-center w-full py-2 sm:py-3">
        
        {/* ✅ Chhota Circle */}
        <div className="relative">
          <div
            className={`relative flex h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 items-center justify-center rounded-full ${styles.bgOuter} shadow-inner ring-4 sm:ring-4 ${styles.ring} animate-zoom`}
          >
            <div
              className={`flex h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] md:h-[84px] md:w-[84px] items-center justify-center rounded-full bg-gradient-to-br ${styles.bg} text-white shadow-lg`}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {grade}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Chhota Label */}
        <div className="mt-2 sm:mt-3 text-center">
          <h3 className={`text-base sm:text-lg md:text-xl font-semibold ${styles.text}`}>
            {styles.label}
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
            Performance Grade
          </p>
        </div>
      </div>
    </div>
  );
};

export default GradeCard;