"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAutosizeTextArea from "@/hooks/useAutosizeTextarea";
import { FaArrowRight } from "react-icons/fa";
import React, { useRef, useState } from "react";

const Chatbox = () => {
  const [value, setValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textAreaRef.current, value);
  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;

    setValue(val);
  };
  return (
    <main className="relative w-full h-full max-w-full flex flex-col overflow-auto bg-slate-800 text-white p-4">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="relative h-full"></ScrollArea>
      </div>

      <div className="w-full md:pt-0 p-2 border border-gray-500 rounded-xl">
        <form className="flex flex-row items-start max-h-[200px]">
          <textarea
            name="text"
            id="text"
            rows={1}
            placeholder="Ask something..."
            ref={textAreaRef}
            onChange={handleChange}
            className="flex-grow min-h-[50px] max-h-[200px]leading-5 bg-transparent resize-none outline-none text-sm"
          ></textarea>
          <Button className="self-end bottom-0 p-2 h-fit">
            <FaArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Chatbox;
