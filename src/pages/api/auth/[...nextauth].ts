import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      // @ts-ignore
      scope: "read:user",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    session({ session, token, user }) {
      return session; // The return type will match the one returned in `useSession()`
    },
  },
});
