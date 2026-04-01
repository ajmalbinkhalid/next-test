import { NextResponse, type NextRequest } from "next/server";

const API_BASE_URL =
  process.env.UPSTREAM_API_BASE_URL ?? "https://nexlearn.noviindusdemosites.in";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handler(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const normalizedPath = path.join("/");
  const isSubmitAnswersRoute = normalizedPath === "answers/submit";
  const upstreamUrl = new URL(`${API_BASE_URL.replace(/\/$/, "")}/${path.join("/")}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  const contentType = request.headers.get("content-type") ?? "";
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  let requestBody: BodyInit | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();
      requestBody = formData;
      headers.delete("content-type");
    } else {
      requestBody = await request.arrayBuffer();
    }
  }

  const response = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: requestBody,
    redirect: "manual",
    cache: "no-store",
  });

  if (isSubmitAnswersRoute && !response.ok) {
    const errorText = await response.text();

    console.error("answers/submit upstream error", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
      hasAuthorizationHeader: headers.has("authorization"),
      responseBody: errorText,
    });

    return new NextResponse(
      errorText || JSON.stringify({
        success: false,
        message: `Exam submission failed with status ${response.status}.`,
      }),
      {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "content-type": response.headers.get("content-type") ?? "application/json",
        },
      },
    );
  }

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
