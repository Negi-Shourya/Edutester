// Ambient declarations that let `tsc -p tsconfig.functions.json` check the edge
// functions from a plain Node checkout, with no Deno toolchain installed.
//
// This exists because supabase/functions/ was invisible to the build for a long
// time — tsconfig.app.json only includes src/ — and a scoping bug that would
// have 500'd every submission sat in the repo unnoticed as a result. These
// declarations are for the typechecker only; Deno itself supplies the real ones.

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

// Deno-only dependencies with no copy in node_modules. Typed as `any` on
// purpose: the point is to check our own logic — scope, control flow, the shapes
// we build — not to validate these libraries' surfaces.
declare module 'npm:razorpay@2.9.4' {
  const Razorpay: any;
  export default Razorpay;
}

declare module 'node:crypto' {
  const crypto: any;
  export default crypto;
  export const createHmac: any;
  export const timingSafeEqual: any;
  export const randomUUID: any;
}
