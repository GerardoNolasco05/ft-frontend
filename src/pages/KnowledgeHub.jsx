import React from "react";
import Navbar from "../components/Navbar";
import CoachDashboard from "../components/CoachDashboard";
import ExHub from "../components/ExHub";
import dumbbell from "/images/dumbbell.png"


function KnowledgeHub() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        {/* Grid with custom column widths */}
        <div className="grid grid-cols-[300px_1fr_1fr] gap-5">
          
          {/* Left column - CoachDashboard */}
          <div className="p-4">
            <CoachDashboard />
          </div>

          {/* Middle column*/}
          <div className="p-6 mt-40 ml-13">
            <ExHub />
          </div>

          {/* Right column */}
          <div className="pt-15">
            <h3 className="text-xl text-white font-semibold mb-4 ml-25">Dumbbell</h3>
            <img
              src={dumbbell}
              alt="Dumbbell"
              className="w-200 h-auto mt-20"
              />
            <div className="flex justify-center space-x-4 text-sm font-medium mt-20">
              <button className="hover:text-orange-500">How To</button>
              <span>|</span>
              <button className="hover:text-orange-500">Steps</button>
              <span>|</span>
              <button className="hover:text-orange-500">Form Cues</button>
              <span>|</span>
              <button className="hover:text-orange-500">Muscles</button>
              <span>|</span>
              <button className="hover:text-orange-500">Errors</button>
              <span>|</span>
              <button className="hover:text-orange-500">Equipment</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default KnowledgeHub;
