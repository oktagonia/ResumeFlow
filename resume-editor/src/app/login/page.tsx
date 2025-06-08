"use server";

import { auth } from "@/auth";
import { login } from "@/lib/actions/auth";

export default async function Login() {
  const session = await auth();

  if (session?.user) {
    return (
      <div>
        <p>User signed in with name: {session.user.name}</p>
      </div>
    );
  }

  return <div>please sign in.</div>;
}
