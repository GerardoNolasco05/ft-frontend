import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../context/AuthContextProvider";

function Navbar() {
  const [showNavMenu, setShowNavMenu] = useState(false);
  const { token, logout } = useAuthContext();
  const navigate = useNavigate();

  // Treat user as logged out unless we definitely have a token
  const isLoggedIn = Boolean(token);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-18 bg-orange-500 flex items-center pl-10 pr-16 shadow-md z-50">
        {/* Logo */}
        <img src="/images/logoFT.png" alt="Logo" className="h-6 w-auto" />

        {/* Title */}
        <h1 className="w-full text-center text-white text-xl font-bold">
          Pro Fitness Training
        </h1>

        {/* Hamburger menu */}
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
        <div className="hidden md:flex space-x-6 text-white items-center">
          {!isLoggedIn && <Link to="/">Home</Link>}

          {isLoggedIn ? (
            <span
              onClick={handleLogout}
              className="cursor-pointer whitespace-nowrap"
            >
              Log Out
            </span>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu bar (below navbar) */}
      {showNavMenu && (
        <div className="fixed top-18 left-0 right-0  z-50 md:hidden">
          <div className="flex justify-center space-x-8 py-1.5 text-white hover:text-orange-500">
            {!isLoggedIn && (
              <Link to="/" onClick={() => setShowNavMenu(false)}>
                Home
              </Link>
            )}

            {isLoggedIn ? (
              <span
                onClick={() => {
                  setShowNavMenu(false);
                  handleLogout();
                }}
                className="cursor-pointer whitespace-nowrap on"
              >
                Log Out
              </span>
            ) : (
              <>
                <Link to="/login" onClick={() => setShowNavMenu(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setShowNavMenu(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
