"use client";

import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data, status } = useSession();

  console.log("SESSION:", data);
  console.log("STATUS:", status);

  return (
    <div>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
