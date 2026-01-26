export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/",
        "/onchain/:path*",
        "/offchain/:path*",
    ],
};
