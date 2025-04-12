import Image from "next/image";
import AuthPage from "./(pages)/auth/page";



export default function Home() {
  return (   
    <div className="flex justify-center items-center h-screen w-screen">
      <AuthPage />

    </div>
    

  );
}
