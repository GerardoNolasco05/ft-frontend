import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [showNavMenu, setShowNavMenu] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-orange-500 flex items-center pl-10 pr-16 shadow-md z-50">
        {/* Logo */}
        <img src="/images/logoFT.png" alt="Logo" className="h-6 w-auto" />

        {/* Title */}
        <h1 className="w-full text-center text-white text-xl font-bold">
          Pro Fitness Training
        </h1>

        {/* Hamburger menu*/}
        <button
          onClick={() => setShowNavMenu((s) => !s)}
          className="flex flex-col space-y-1 md:hidden cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={showNavMenu}
        >
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex space-x-6 text-white">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      {/* Mobile menu bar (below navbar) */}
      {showNavMenu && (
        <div className="fixed top-20 left-0 right-0 bg-black/50 z-50 md:hidden">
          <div className="flex justify-center space-x-8 py-1.5 text-white">
            <Link to="/" onClick={() => setShowNavMenu(true)}>
              Home
            </Link>
            <Link to="/login" onClick={() => setShowNavMenu(false)}>
              Login
            </Link>
            <Link to="/register" onClick={() => setShowNavMenu(false)}>
              Register
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
