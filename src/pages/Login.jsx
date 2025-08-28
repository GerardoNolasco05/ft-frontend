import LoginForm from "../components/LoginForm";

export default function Login() {
  return (
    <>
      {/* Full-viewport background */}
      <div
        className="fixed inset-0 z-0 bg-[url(/images/ft_login.jpg)] bg-cover bg-center"
        aria-hidden="true"
      />

      {/* Foreground content */}
      <div className="relative z-10 mt-20">
        <LoginForm />
      </div>
    </>
  );
}
