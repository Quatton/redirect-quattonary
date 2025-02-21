import { ShortLink } from "@prisma/client";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

type Form = {
  id?: number;
  slug: string;
  url: string;
};

const ViewLinks: React.FC = () => {
  const session = useSession();
  const formInitialState = { slug: "", url: "" };
  const [createForm, setCreateForm] = useState<Form>(formInitialState);
  const [updateForm, setUpdateForm] = useState<Form>(formInitialState);
  const origin = window.location.origin;

  const slugCheck = trpc.useQuery(["slugCheck", { slug: createForm.slug }], {
    refetchOnReconnect: false, // replacement for enable: false which isn't respected.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const getAllSlugs = trpc.useQuery(
    ["getAllSlugs", { ownerId: session.data?.user.id! }],
    {
      refetchOnReconnect: false, // replacement for enable: false which isn't respected.
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const createSlug = trpc.useMutation(["createSlug"], {
    onSuccess: () => {
      getAllSlugs.refetch();
    },
  });

  const updateSlug = trpc.useMutation(["updateSlug"], {
    onSuccess: () => {
      getAllSlugs.refetch();
    },
  });

  const deleteSlug = trpc.useMutation(["deleteSlug"], {
    onSuccess: () => {
      getAllSlugs.refetch();
    },
  });

  const slugInput = classNames({
    "border-red-500": slugCheck.isFetched && slugCheck.data!.used,
    "text-red-500": slugCheck.isFetched && slugCheck.data!.used,
  });

  const { shortlinks } = getAllSlugs.data || { shortlinks: [] as ShortLink[] };

  const updateFormInput = {
    onFocus(shortlink: ShortLink) {
      if (updateForm?.id !== shortlink.id) {
        setUpdateForm({ ...shortlink });
      }
    },
    onBlur(shortlink: ShortLink) {
      if (shortlink.id === updateForm.id) return; //waste of time
      updateSlug.mutate(
        { id: -1, ...updateForm },
        {
          onSuccess() {
            getAllSlugs.refetch;
          },
        }
      );
      updateSlug.reset;
      setUpdateForm(formInitialState);
    },
  };

  const createFormSubmit = () => {
    createSlug.mutate(
      {
        ...createForm,
        ownerId: session.data?.user.id!,
      },
      {
        onSuccess() {
          getAllSlugs.refetch;
          createSlug.reset;
          setCreateForm(formInitialState);
        },
      }
    );
  };

  return (
    <div className="container h-3/4 flex flex-col items-center p-8">
      <div className="mb-4 text-3xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-transparent font-bold">
        {origin}/...
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="max-w-full rounded-md border-spacing-0 border-separate shadow-md table-fixed">
          <thead>
            <tr className="header">
              <th className="rounded-tl-md">ID</th>
              <th>SLUG</th>
              <th>URL</th>
              <th className="rounded-tr-md">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <>
              <tr>
                <td></td>
                <td>
                  <input
                    type="text"
                    className={slugInput}
                    value={createForm.slug}
                    onChange={(e) => {
                      if (e.target.value) debounce(slugCheck.refetch, 100);
                      setCreateForm({ ...createForm, slug: e.target.value });
                    }}
                  />
                </td>
                <td>
                  <input
                    type="url"
                    value={createForm.url}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, url: e.target.value });
                    }}
                  />
                </td>
                <td>
                  <button
                    onClick={() => createFormSubmit()}
                    className="
                    bg-pink-500 px-4 py-2 rounded-md
                    shadow-md hover:bg-pink-400 [&:not(:disabled)]:hover:-translate-y-1 transition-all
                    disabled:bg-pink-800 disabled:text-gray-700"
                    disabled={slugCheck.isFetched && slugCheck.data!.used}
                  >
                    Create
                  </button>
                </td>
              </tr>
              {shortlinks.map((shortlink) => (
                <tr className="even:bg-neutral-800" key={shortlink.id}>
                  <td>{shortlink.id}</td>
                  <td>
                    <div className="relative flex items-center  [&:hover_button]:block [&_button]:hidden">
                      <input
                        onFocus={() => updateFormInput.onFocus(shortlink)}
                        onBlur={() => updateFormInput.onBlur(shortlink)}
                        type="text"
                        value={
                          updateForm.id === shortlink.id
                            ? updateForm.slug
                            : shortlink.slug
                        }
                        onChange={(e) =>
                          updateForm.id === shortlink.id &&
                          setUpdateForm({ ...updateForm, slug: e.target.value })
                        }
                      />
                      <button
                        className="absolute bg-neutral-600 rounded-md
                      hover:bg-neutral-500 right-1 px-2 py-1 transition-all"
                        onClick={() => copy(`${origin}/${shortlink.slug}`)}
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      onFocus={() => updateFormInput.onFocus(shortlink)}
                      onBlur={() => updateFormInput.onBlur(shortlink)}
                      type="url"
                      value={
                        updateForm.id === shortlink.id
                          ? updateForm.url
                          : shortlink.url
                      }
                      onChange={(e) =>
                        updateForm.id === shortlink.id &&
                        setUpdateForm({ ...updateForm, url: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="text-red-500 hover:underline underline-offset-2"
                      onClick={(e) => deleteSlug.mutate({ id: shortlink.id })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewLinks;
