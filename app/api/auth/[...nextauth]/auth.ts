// app/api/auth/[...nextauth]/auth.ts
// Simple re-export so server code and API routes can do: import auth from ".../auth";
export { auth as default } from "./route";