// this is based on  farcaster mini app docs 

import { Errors, createClient } from "@farcaster/quick-auth";
const client = createClient();
async function resolveUser(fid) {
  const primaryAddress = await (async () => {
    const res = await fetch(
      `https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`
    );
    if (res.ok) {
      const { result } = await res.json();
      return result.address.address;
    }
  })();

  return {
    fid,
    primaryAddress,
  };
}

export async function GET(request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ message: "Missing token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = await client.verifyJwt({
      token,
      domain: process.env.HOSTNAME || "",
    });

    const user = await resolveUser(payload.sub);
    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.info("Invalid token:", e.message);
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Authentication error:", e);
    return new Response(JSON.stringify({ message: "Authentication failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}
