import { ConvexError } from "convex/values";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

function normalizeUsername(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function validateUsername(username: string) {
  if (username.length < 3) {
    throw new ConvexError("Username must be at least 3 characters.");
  }
  if (username.length > 16) {
    throw new ConvexError("Username must be 32 characters or fewer.");
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new ConvexError(
      "Username can only contain lowercase letters, numbers, and underscores.",
    );
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const username = normalizeUsername(params.username);
        validateUsername(username);

        // Convex Auth uses `email` as the account identifier for password auth.
        return {
          email: username,
          name: username,
        };
      },
    }),
  ],
});
