'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";

function NotionCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (code) {
      const redirectUri = `${window.location.origin}/auth/notion/callback`;
      fetch(`${BACKEND_URL}/auth/notion?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`)
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem("notion_token", data.access_token);
            // Clear any old database selection on new token connect
            localStorage.removeItem("notion_database_id");
            router.push("/start");
          } else {
            setError(true);
          }
        })
        .catch(() => setError(true));
    }
  }, [code, router]);

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        Notion authentication failed.{" "}
        <button onClick={() => router.push("/start")} className="underline hover:text-red-400">
          Go back
        </button>
      </div>
    );
  }
  return <div className="p-10 text-center animate-pulse text-text-muted">Connecting to Notion...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center animate-pulse text-text-muted">Loading...</div>}>
      <NotionCallbackHandler />
    </Suspense>
  );
}
