import { ShortLink } from "@prisma/client";
import classNames from "classnames";
import { debounce } from "lodash";
import { nanoid } from "nanoid";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

type Form = {
  slug: string;
  url: string;
};

const ViewLinks: React.FC = () => {
  const [createForm, setCreateForm] = useState<Form>({ slug: "", url: "" });
  const url = window.location.origin;

  const slugCheck = trpc.useQuery(["slugCheck", { slug: createForm.slug }], {
    refetchOnReconnect: false, // replacement for enable: false which isn't respected.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const createSlug = trpc.useMutation(["createSlug"], {
    onSuccess: () => {
      getAllSlugs.refetch();
    },
  });

  const input =
    "text-black my-1 p-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-pink-500 block w-full rounded-md sm:text-sm focus:ring-1";

  const slugInput = classNames(input, {
    "border-red-500": slugCheck.isFetched && slugCheck.data!.used,
    "text-red-500": slugCheck.isFetched && slugCheck.data!.used,
  });

  const getAllSlugs = trpc.useQuery(["getAllSlugs"]);
  const { shortlinks } = getAllSlugs.data ?? { shortlinks: [] as ShortLink[] };

  return (
    <div className="container h-3/4 flex flex-col items-center p-8">
      <table className="w-full rounded-md border-spacing-0 border-separate shadow-md">
        <thead>
          <th className="rounded-tl-md">ID</th>
          <th>SLUG</th>
          <th>URL</th>
          <th className="rounded-tr-md">ACTIONS</th>
        </thead>
        <tbody>
          <>
            <tr>
              <td></td>
              <td>
                <input type="text" value={createForm.slug} />
              </td>
              <td>
                <input type="url" value={createForm.url} />
              </td>
              <td>
                <button className="bg-pink-500 px-4 py-2 rounded-md shadow-md hover:bg-pink-400 hover:-translate-y-1 transition-all">
                  Create
                </button>
              </td>
            </tr>
            {shortlinks.map((shortlink) => (
              <tr className="even:bg-neutral-800">
                <td>{shortlink.id}</td>
                <td>
                  <input type="text" value={shortlink.slug} />
                </td>
                <td>
                  <input type="url" value={shortlink.url} />
                </td>
                <td>
                  <button className="text-red-500 hover:underline underline-offset-2">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </>
        </tbody>
      </table>
    </div>
  );
};

export default ViewLinks;
