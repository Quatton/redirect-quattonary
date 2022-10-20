import { ShortLink } from "@prisma/client";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { debounce } from "lodash";
import { nanoid } from "nanoid";
import { FocusEventHandler, useState } from "react";
import { trpc } from "../../utils/trpc";

type Form = {
  id?: number;
  slug: string;
  url: string;
};

const ViewLinks: React.FC = () => {
  const formInitialState = { slug: "", url: "" };
  const [createForm, setCreateForm] = useState<Form>(formInitialState);
  const [updateForm, setUpdateForm] = useState<Form>(formInitialState);
  const origin = window.location.origin;

  const slugCheck = trpc.useQuery(["slugCheck", { slug: createForm.slug }], {
    refetchOnReconnect: false, // replacement for enable: false which isn't respected.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const getAllSlugs = trpc.useQuery(["getAllSlugs"], {
    refetchOnReconnect: false, // replacement for enable: false which isn't respected.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

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
    onBlur() {
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
      { ...createForm },
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
      <table className="w-full rounded-md border-spacing-0 border-separate shadow-md">
        <thead>
          <tr className="header">
            <th>ID</th>
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
                    debounce(slugCheck.refetch, 100);
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
                  <div className="flex items-center [&:hover_button]:block [&_button]:hidden">
                    <input
                      onFocus={() => updateFormInput.onFocus(shortlink)}
                      onBlur={() => updateFormInput.onBlur()}
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
                    hover:bg-neutral-500 right-9 px-2 py-1 transition-all"
                      onClick={() => copy(`${origin}/${shortlink.slug}`)}
                    >
                      Copy
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    onFocus={() => updateFormInput.onFocus(shortlink)}
                    onBlur={() => updateFormInput.onBlur()}
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
  );
};

export default ViewLinks;
