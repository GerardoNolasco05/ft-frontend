import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />
      <div className="h-screen bg-[url('/images/ft_home.jpg')] bg-cover bg-center pt-20 flex items-center justify-center">
        <div className="text-center max-w-xl px-6">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-6">
            Welcome
          </h2>
          <p className="text-lg text-justify md:text-2xl font-normal text-white leading-relaxed">
            <span className="text-orange-500 font-bold">
              Pro Fitness Training
            </span>{" "}
            helps you create, customize, and track workouts for your clients.
            Easily plan sessions, monitor progress, and keep them motivated —
            all in one powerful app designed for trainers like you.
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;
