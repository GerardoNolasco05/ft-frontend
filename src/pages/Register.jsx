import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import RegisterForm from "../components/RegisterForm";

function Register () {
    return (
       <>
         <Navbar />
         <div className="h-screen bg-[url('/images/ft_reg.jpg')] bg-cover bg-center pt-20 flex items-center justify-center">
         <RegisterForm />
         </div>
        </>
    )
}

export default Register;