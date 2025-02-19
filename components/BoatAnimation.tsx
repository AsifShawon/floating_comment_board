// components/BoatAnimation.tsx
"use client";
import React from "react";
import Lottie from "lottie-react";
import boatAnimation from "@/components/boat.json";

interface BoatAnimationProps {
  className?: string;
}

const BoatAnimation: React.FC<BoatAnimationProps> = ({ className }) => {
  return (
    <div className={className}>
      <Lottie
        animationData={boatAnimation}
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default BoatAnimation;