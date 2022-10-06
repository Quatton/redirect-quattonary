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
      {session ? (
        <Suspense>
          <CreateLinkForm />
        </Suspense>
      ) : (
        <>
          <div>Not Logged in</div>
          <button
            className="rounded bg-pink-500 px-4 py-2 font-medium mt-4"
            onClick={() => signIn()}
          >
            Sign In
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
