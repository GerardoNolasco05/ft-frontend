import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full bg-orange-500 fixed top-0 left-0 h-20 flex items-center pl-10 pr-16 shadow-md">
      <img 
        src="/images/logoFT.png" 
        alt="Logo" 
        className="h-6 w-auto" 
      />
      <h1 className="w-full text-center text-white text-xl font-bold">
        Pro Fitness Training
      </h1>
      <div className="flex space-x-6 text-white">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
