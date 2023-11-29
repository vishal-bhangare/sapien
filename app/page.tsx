"use client";
import { redirect, useRouter } from "next/navigation";
import Chatbox from "./Chatbox";
import Sidebar from "./Sidebar";
import readUserSession from "@/lib/readUserSession";
import { useEffect, useState } from "react";

export default function Home() {
  const [user_metadata, setUserMetadata] = useState({});
  const router = useRouter();
  useEffect(() => {
    async function checkSession() {
      const session = await readUserSession();
      if (!session) return router.push("/auth");
      setUserMetadata(session!.user.user_metadata);
    }
    checkSession();
  }, []);
  return (
    <main className="relative z-0 flex h-full w-full overflow-hidden">
      <Sidebar user={user_metadata!} /> <Chatbox />
    </main>
  );
}
