import { ShortLink } from "@prisma/client";
import { trpc } from "../../utils/trpc";

const ViewLinks: React.FC = () => {
  const getAllSlugs = trpc.useQuery(["getAllSlugs"]);
  const { shortlinks } = getAllSlugs.data ?? { shortlinks: [] as ShortLink[] };

  return (
    <div className="overflow-x-auto relative shadow-md container">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="rounded-t-lg bg-pink-500">
            <th scope="col" className="py-3 px-6">
              ID
            </th>
            <th scope="col" className="py-3 px-6">
              Slug
            </th>
            <th scope="col" className="py-3 px-6">
              URL
            </th>
          </tr>
        </thead>
        <tbody>
          {shortlinks.map((shortlink) => (
            <tr className="even:bg-gray-800 border-b border-gray-700">
              <td className="py-4 px-6 ">{shortlink.id}</td>
              <td className="">
                <input
                  className="py-4 px-6 w-full bg-transparent focus:outline-0"
                  type="text"
                  value={shortlink.slug}
                />
              </td>
              <td className="">
                <input
                  className="py-4 px-6 w-full bg-transparent focus:outline-0"
                  type="text"
                  value={shortlink.url}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewLinks;
