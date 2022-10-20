import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import ViewLinks from "../components/view-links";

const CreateLinkForm = dynamic(() => import("../components/create-link"), {
  ssr: false,
});

const Admin: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-950 text-white">
      {(session || process.env.NODE_ENV) === "development" ? (
        session?.user.role === "admin" ||
        process.env.NODE_ENV === "development" ? (
          <>
            <Suspense>
              <ViewLinks />
            </Suspense>
          </>
        ) : (
          <div>Not authorized</div>
        )
      ) : (
        <div className="bg-gray-800 container grid place-content-center h-36 rounded-md shadow-md">
          <div>Not signed in</div>
          <button
            className="mt-6 bg-pink-500 px-4 py-2 font-semibold rounded-md shadow-md hover:bg-pink-400 transition-colors"
            onClick={() => signIn()}
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;
