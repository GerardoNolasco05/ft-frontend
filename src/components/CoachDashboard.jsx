import portrait from "/images/portrait.png"
import clienstIcon from "/images/clients.svg"
import addClientIcon from "/images/addClient.svg"
import React, { useState } from "react";
import { Link } from "react-router-dom"; 


function CoachDashboard() {
   const [open, setOpen] = useState(false);
  
  return (
    <div className="flex ml-8 text-white">
      {/* Left column */}
      <div className="basis-1/5 flex-shrink-0 flex flex-col items-center pt-10">
      <img 
        src={portrait} 
        alt="Portrait" 
        className="w-32 h-auto"
      />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mt-1">Coach Name</h2>
          <p className="text-base mt-1 -ml-17">Profile</p>
         
         {/* Knowledge Hub toggle */}
        <div className="relative mt-6">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center mt-10 ml-3 gap-2 px-2 hover:text-orange-500 whitespace-nowrap"
            aria-expanded={open}
            aria-controls="knowledge-menu"
          >
            <span>Knowledge Hub</span>
            <span
              className={`text-sm transition-transform ${
                open ? "rotate-0" : "rotate-180"
              }`}
              aria-hidden
            >
              ▼
            </span>
          </button>

          {/* Scroll menu (show/hide) */}
          {open && (
            <div
              id="knowledge-menu"
              className="absolute left-0 top-full mt-1 ml-3 w-48 bg-gray-800 rounded-md shadow-lg p-2 flex flex-col space-y-2 text-sm max-h-40 overflow-y-auto z-10"
            >
              <Link to="/exhub" className="hover:text-sky-300">
                Exercises
              </Link>
            </div>
          )}
        </div>


          <p className="text-base mt-3 -ml-13">Schedule</p>
          <p className="text-base mt-3 -ml-20">Tools</p>
          <p className="text-base mt-3 -ml-9">Community</p>
        <img 
        src={clienstIcon} 
        alt="Clienst Icon" 
        className="w-10 h-auto mt-35 -ml-20"
      />
        <p className="text-sm mt-1 ml-7">Manage your Clients</p>
        <img 
        src={addClientIcon} 
        alt="Add Client Icon" 
        className="w-10 h-auto mt-5 -ml-20"
      />
        <p className="text-sm mt-1 -ml-5">Add a Client</p>
        </div>
      </div>
    </div>
  );
}

export default CoachDashboard;
