const hostname = (
  import.meta.env.VITE_BUNNY_PULL_ZONE_HOSTNAME || ""
).replace(/^https?:\/\//, "");

if (!hostname) {
  throw new Error("VITE_BUNNY_PULL_ZONE_HOSTNAME is required");
}

export const CDN_BASE = `https://${hostname}`;

export const cdnAsset = (path: string) =>
  `${CDN_BASE}/${path.replace(/^\//, "")}`;

/** Mirrors Moodify/backend/src/constants/cdn.js */
export const CDN_DEFAULT_USER_IMAGE = cdnAsset("user.png");
