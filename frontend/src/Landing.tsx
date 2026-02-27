import { Link, useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  const handleSignupButton = () => {
    navigate("/signup");
  };
  return (
    <>
      <div className="flex flex-col h-screen w-screen bg-black">
        <div className="flex text-3xl items-center text-center justify-center w-screen h-30 gap-20 md:gap-50 lg:gap-100">
          <Link to="/integrations" className="font-['Quicksand'] bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent hover:-mt-1 transition-all duration-300 ease-in-out">Integrations</Link>
          <Link to="/about" className="font-['Quicksand'] bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent hover:-mt-1 transition-all duration-300 ease-in-out">About</Link>
          <Link to="/login" className="font-['Quicksand'] bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent hover:-mt-1 transition-all duration-300 ease-in-out">Login</Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center w-screen">
          <h1 style={{ fontFamily: "'Racing Sans One', sans-serif" }} className="bg-linear-to-br from-black/30 to-red-500/80 bg-clip-text text-transparent text-9xl leading-25 lg:text-[15rem] md:text-[8rem] md:leading-35 tracking-tighter lg:leading-50 text-center p-4 m-25 md:m-0 lg:m-0">Visualize<br/>the hustle</h1>
          <h1 style={{ fontFamily: "'Racing Sans One', sans-serif" }} className="text-red-500/80 text-4xl lg:text-6xl tracking-tighter md:leading-50 lg:leading-50 -mt-30 text-center p-4 lg:ml-180 md:ml-100">with GREZ</h1>
          <button onClick={handleSignupButton} className="font-['Quicksand'] text-2xl bg-linear-to-br from-black/20 to-white w-60 h-15 rounded-4xl opacity-75 hover:opacity-100 hover:cursor-pointer">Get Started</button>
        </div>
      </div>
    </>
  )
}

export default Landing
