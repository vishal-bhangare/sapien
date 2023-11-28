"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useAutosizeTextArea from "@/hooks/useAutosizeTextarea";
import { FaArrowRight } from "react-icons/fa";
import React, { useEffect, useRef, useState, useTransition } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import openaiClient from "@/lib/openai/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  query: string;
  reply: string;
}

const inputSchema = z.object({
  query: z.string().min(1),
});
type inputFormData = z.infer<typeof inputSchema>;

const Chatbox = () => {
  const [value, setValue] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [message, setMessage] = useState<Message>();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<inputFormData>({ resolver: zodResolver(inputSchema) });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  function onSubmit({ query }: inputFormData) {
    setMessage((message) => ({ query: query, reply: "" }));
    startTransition(async () => {
      const res = await openaiClient(query);
      const reply = JSON.parse(res);
      reset({ query: "" });
      setMessage(() => ({ query: query, reply: reply }));
    });
  }

  useAutosizeTextArea(textAreaRef.current, value);
  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setValue(val);
  };

  useEffect(() => {
    setChat((chat) => [...chat, message!]);
  }, [message]);

  return (
    <main className="relative w-full h-full max-w-full flex flex-col overflow-auto bg-slate-800 text-white ">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="relative h-full hideScrollbar">
          {chat.map((message, i) => {
            if (message?.reply) {
              return (
                <div key={i}>
                  <div className="bg-slate-950 min-h-12 flex items-center justify-center px-4 py-3 text-md font-medium">
                    <span className="w-[500px]">{message?.query}</span>
                  </div>
                  <div className="bg-slate-900 min-h-12 flex justify-center items-center px-4 py-3 pb-5text-md font-regular">
                    <span className="w-[500px]">{message?.reply}</span>
                  </div>
                </div>
              );
            }
          })}
          {isPending && message?.query && (
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
              {...register("query", { onChange: handleChange })}
              className="flex-grow min-h-[50px] max-h-[200px]leading-5 bg-transparent resize-none outline-none text-sm"
            ></textarea>
            <Button type="submit" className="self-end bottom-0 p-2 h-fit">
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
