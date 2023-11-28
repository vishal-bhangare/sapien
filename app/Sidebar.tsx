"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { signOut } from "@/lib/supabase/helpers";
import { useRouter } from "next/navigation";

interface Props {
  user: { first_name?: string; last_name?: string };
}

const Sidebar = ({ user }: Props) => {
  const router = useRouter();
  const handleLogOut = async () => {
    await signOut();
    router.push("/auth");
  };
  return (
    <div className="dark flex flex-col flex-shrink-0 gap-4 overflow-x-hidden bg-gray-900 text-white w-[260px] p-4">
      <div className="flex items-center justify-start gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" />
        </Avatar>
        <Button variant="ghost">
          New Chat
          <HiOutlinePencilAlt className="ml-5 h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className=" flex-grow">lorem200</ScrollArea>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full outline-none flex items-center gap-3 hover:bg-slate-800 px-2 py-1 rounded-md">
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
            {user.first_name + " " + user.last_name}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] my-1">
            <DropdownMenuItem>Plans</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
