import { createClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getAllChats(userid?: string) {
  const res = await supabase.from("chats").select("*").eq("userid", userid);
  return res;
}

export async function getChat(chatid?: number) {
  const res = await supabase.from("messages").select("*").eq("chatid", chatid!);
  return res;
}
export async function updateChat(chatid: number, title?: string) {
  const res = await supabase
    .from("chats")
    .update({ title: title })
    .eq("id", chatid);
  return res;
}
export async function createNewChat(userid: string) {
  const res = await supabase
    .from("chats")
    .insert({ userid: userid })
    .select("*");
  return res;
}
export async function insertMessage(
  userid: string,
  chatid: number,
  query: string,
  reply: string
) {
  const res = await supabase
    .from("messages")
    .insert({ userid: userid, chatid: chatid, query: query, reply: reply })
    .select("*");
  return res;
}

async function deleteMessages(chatid: number) {
  return supabase.from("messages").delete().eq("chatid", chatid);
}
export async function deleteChat(chatid: number) {
  await deleteMessages(chatid);
  await supabase.from("chats").delete().eq("id", chatid);
}
