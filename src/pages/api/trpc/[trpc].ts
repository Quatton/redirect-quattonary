import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { prisma } from "../../../db/client";

export const appRouter = trpc
  .router()
  .query("slugCheck", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input }) {
      const count = await prisma.shortLink.count({
        where: {
          slug: input.slug,
        },
      });
      return { used: count > 0 };
    },
  })
  .query("getAllSlugs", {
    input: z.object({
      ownerId: z.string(),
    }),
    async resolve({ input }) {
      const data = await prisma.shortLink.findMany({
        where: {
          ownerId: input.ownerId,
        },
      });
      return { shortlinks: data };
    },
  })
  .mutation("createSlug", {
    input: z.object({
      slug: z.string().min(1),
      url: z.string().min(1),
      ownerId: z.string().min(1),
    }),
    async resolve({ input }) {
      try {
        await prisma.shortLink.create({
          data: {
            ownerId: input.ownerId,
            slug: input.slug,
            url: input.url,
          },
        });
      } catch (e) {
        console.log(e);
      }
    },
  })

  .mutation("deleteSlug", {
    input: z.object({
      id: z.number().min(1),
    }),
    async resolve({ input }) {
      try {
        await prisma.shortLink.delete({
          where: {
            id: input.id,
          },
        });
      } catch (e) {
        console.log(e);
      }
    },
  })
  .mutation("updateSlug", {
    input: z.object({
      id: z.number().min(1),
      slug: z.string().min(1),
      url: z.string().min(1),
    }),
    async resolve({ input }) {
      try {
        await prisma.shortLink.update({
          where: {
            id: input.id,
          },
          data: {
            slug: input.slug,
            url: input.url,
          },
        });
      } catch (e) {
        console.log(e);
      }
    },
  });

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
