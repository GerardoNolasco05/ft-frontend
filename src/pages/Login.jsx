import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginForm from "../components/LoginForm";

function Login () {
    return (
        <>
         <Navbar />
         <div className="h-screen bg-[url('/images/ft_login.jpg')] bg-cover bg-center pt-20 flex items-center justify-center">
            <LoginForm />
         </div>
         
        </>
    )
}

export default Login;