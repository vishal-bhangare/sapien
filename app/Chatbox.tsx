"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import openaiClient from "@/lib/openai/client";
import {
  createNewChat,
  getAllChats,
  insertMessage,
  updateChat,
} from "@/lib/supabase/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa";
import * as z from "zod";
import { Message } from "./entities";
import useChatStore from "./states";

const inputSchema = z.object({
  query: z.string().min(1),
});
type inputFormData = z.infer<typeof inputSchema>;

const Chatbox = ({ userId }: { userId: string }) => {
  const [message, setMessage] = useState<Message>();
  const endRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<inputFormData>({
    resolver: zodResolver(inputSchema),
  });
  const [isPending, startTransition] = useTransition();
  const {
    chatid,
    setIsNewChat,
    getIsNewChat,
    setChatId,
    setChats,
    getChatId,
    setChatData,
    updateChatData,
    getChatData,
  } = useChatStore();

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function reloadChats() {
    const { data, error } = await getAllChats(userId);
    setChats(data!);
  }

  function onSubmit({ query }: inputFormData) {
    scrollToBottom();
    setMessage(() => ({ query: query, reply: "" }));

    startTransition(async () => {
      if (chatid == 0) {
        setIsNewChat(true);
        const { data, error } = await createNewChat(userId);
        setChatId(data![0].id);
      } else {
        setIsNewChat(false);
      }

      const res = await openaiClient(query);
      const reply = JSON.parse(res);
      reset({ query: "" });

      if (reply) {
        await insertMessage(userId, getChatId(), query, reply);
        updateChatData({ query: query, reply: reply });

        if (getIsNewChat()) {
          await updateChat(getChatId(), query);
          reloadChats();
        }
        scrollToBottom();
        setMessage(() => ({ query: query, reply: reply }));
      } else
        setMessage(() => ({
          query: query,
          reply: "Oops!, could'nt found appropriate answer.",
        }));
    });
  }

  useEffect(() => {}, [message, getChatData()]);

  return (
    <main className="relative w-full h-full max-w-full flex flex-col overflow-auto bg-slate-800 text-white ">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="relative h-full hideScrollbar">
          {getChatData().map((message, i) => {
            if (message?.reply) {
              return (
                <div key={i}>
                  <div className="bg-slate-950 min-h-12 flex items-center justify-center px-4 py-3 text-md font-medium">
                    <span className="w-[500px]">{message?.query}</span>
                  </div>
                  <div className="bg-slate-900 min-h-12 flex justify-center items-center px-4 py-3 pb-5text-md font-regular">
                    <span className="w-[500px]">{message?.reply}</span>
                  </div>
                  {getChatData().length == i + 1 && <div ref={endRef}></div>}
                </div>
              );
            }
          })}
          {isPending && (
            <>
              <div className="bg-slate-950 min-h-12 flex items-center justify-center px-4 py-3 text-md font-medium">
                <span className="w-[500px]">{message?.query}</span>
              </div>
              <div className="w-full bg-slate-900 flex justify-center items-center p-4">
                Generating response{" "}
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      <div className="p-4">
        <div className="w-full md:pt-0 p-2 border border-gray-500 rounded-xl ">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-row items-start max-h-[200px]"
          >
            <textarea
              rows={1}
              placeholder="Ask something..."
              {...register("query")}
              disabled={!userId}
              className="flex-grow min-h-[50px] max-h-[200px]leading-5 bg-transparent resize-none outline-none text-sm"
            ></textarea>
            <Button
              type="submit"
              disabled={!userId}
              className="self-end bottom-0 p-2 h-fit"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FaArrowRight className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Chatbox;
