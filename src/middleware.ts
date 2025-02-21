import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const slug = req.nextUrl.pathname.split("/").pop();

  const slugFetch = await fetch(`${req.nextUrl.origin}/api/get-url/${slug}`);
  if (slugFetch.status != 200) {
    return NextResponse.next();
  }
  const data = await slugFetch.json();

  if (data?.url) {
    return NextResponse.redirect(new URL("", data.url));
  }
}

export const config = {
  matcher: "/((?!api|static|_next|admin).*)",
};
