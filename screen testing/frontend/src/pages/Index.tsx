
import React, { useState, useEffect } from "react";
import { ScreenStatusCard } from "../components/ScreenStatusCard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F0FB] px-2">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] mb-2 text-center">
        Screen Detection Status
      </h1>
      <p className="text-md md:text-lg text-gray-600 mb-8 text-center max-w-md">
        This tool detects how many screens are currently connected. Please ensure only one screen is connected for the interview.
      </p>
      <ScreenStatusCard />
    </div>
  );
};

export default Index;
