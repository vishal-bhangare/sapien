import getUserSession from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import Chatbox from "./Chatbox";
import Sidebar from "./Sidebar";

export default async function Home() {
  const { data } = await getUserSession();
  if (!data.session) return redirect("/auth");
  return (
    <main className="relative z-0 flex h-full w-full overflow-hidden">
      <Sidebar user={data.session.user.user_metadata} /> <Chatbox />
    </main>
  );
}
