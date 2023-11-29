import { redirect } from "next/navigation";
import Chatbox from "./Chatbox";
import Sidebar from "./Sidebar";
import readUserSession from "@/lib/readUserSession";

export default async function Home() {
  const session = await readUserSession();
  if (!session) return redirect("/auth");
  return (
    <main className="relative z-0 flex h-full w-full overflow-hidden">
      <Sidebar user={session!.user.user_metadata} /> <Chatbox />
    </main>
  );
}
