"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { signOut } from "./auth/actions";

import { deleteChat, getAllChats, getChat } from "@/lib/supabase/database";
import useChatStore from "./states";

interface Props {
  user: { first_name?: string; last_name?: string };
  userId: string;
}

const Sidebar = ({ user, userId }: Props) => {
  const router = useRouter();
  const { setChats, getChats, setChatId, getChatId, setChatData } =
    useChatStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  async function loadChatData(chatid: number) {
    const { data, error } = await getChat(chatid);
    setChatData(data!);
  }

  function newChat() {
    setChatId(0);
    setChatData([]);
  }

  async function loadChats() {
    const { data, error } = await getAllChats(userId);
    setChats(data!);
  }
  async function handleDeleteChat(chatId: number) {
    if (getChatId() == chatId) {
      newChat();
    }
    await deleteChat(chatId);
    await loadChats();
  }

  useEffect(() => {
    if (getChats()?.length == 0) loadChats();
  });

  return (
    <div className="dark h-full w-[260px] flex flex-col flex-shrink-0 gap-4 overflow-x-hidden bg-gray-900 text-white  p-4 sm:hiddenx md:flex">
      <div className="flex items-center justify-start gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" />
        </Avatar>
        <Button variant="ghost" onClick={newChat}>
          New Chat
          <HiOutlinePencilAlt className="ml-5 h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow flex flex-col">
        {getChats() &&
          getChats().map((chat, i) => {
            if (chat.title)
              return (
                <div
                  key={i}
                  onClick={() => {
                    setChatId(chat.id!);
                    loadChatData(getChatId());
                  }}
                  className={[
                    "group px-1 py-0.5 mb-1 text-base rounded-md border border-gray-800 bg-slate-900 hover:bg-slate-950 flex items-center",
                    chat.id == getChatId() ? "bg-slate-950" : "bg-slate-900",
                  ].join(" ")}
                >
                  <span className="flex-grow"> {chat.title}</span>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      className="opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id!);
                      }}
                    >
                      <MdDeleteForever />
                    </div>
                  </div>
                </div>
              );
          })}
      </ScrollArea>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full outline-none flex items-center gap-3 hover:bg-slate-800 px-2 py-1 rounded-md">
            {user.first_name && (
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    "https://ui-avatars.com/api/?name=" +
                    user.first_name +
                    " " +
                    user.last_name +
                    "&background=random&color=random"
                  }
                />
              </Avatar>
            )}
            {user.first_name ? (
              <span>{user.first_name + " " + user.last_name}</span>
            ) : (
              <div className="flex items-center gap-3 ">
                Loading <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] my-1">
            <DropdownMenuItem>Plans</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
