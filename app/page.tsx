"use client";
import { redirect, useRouter } from "next/navigation";
import Chatbox from "./Chatbox";
import Sidebar from "./Sidebar";
import readUserSession from "@/lib/readUserSession";
import { useEffect, useState } from "react";
import useChatStore from "./states";

export default function Home() {
  const [user_metadata, setUserMetadata] = useState({});
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const { setChats } = useChatStore();
  useEffect(() => {
    async function checkSession() {
      const session = await readUserSession();
      if (!session) return router.push("/auth");
      setChats([]);
      setUserMetadata(() => session!.user.user_metadata);
      setUserId(() => session!.user.id);
    }
    checkSession();
  }, [userId]);
  return (
    <main className="relative z-0 flex h-full w-full overflow-hidden">
      <Sidebar user={user_metadata!} userId={userId} />{" "}
      <Chatbox userId={userId} />
    </main>
  );
}
