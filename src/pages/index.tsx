import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const CreateLinkForm = dynamic(() => import("../components/create-link"), {
  ssr: false,
});

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-950 text-white">
      <Suspense>
        <CreateLinkForm />
      </Suspense>
    </div>
  );
};

export default Home;
