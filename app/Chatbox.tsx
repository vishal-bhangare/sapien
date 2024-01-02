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
import useKeypress from "react-use-keypress";
import { MdOutlineImageSearch } from "react-icons/md";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createWorker } from "tesseract.js";
import { canvasPreview } from "./utils/canvasPreview";

const inputSchema = z.object({
  query: z.string().min(1),
});
type inputFormData = z.infer<typeof inputSchema>;

const Chatbox = ({ userId }: { userId: string }) => {
  const [message, setMessage] = useState<Message>();
  const endRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, setValue, reset } = useForm<inputFormData>({
    resolver: zodResolver(inputSchema),
  });
  const [isPending, startTransition] = useTransition();
  const [isScanning, startScanning] = useTransition();
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

  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  useKeypress("Escape", () => {
    setImgSrc("");
  });
  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      console.log("called2");
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(() => reader.result!.toString());
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = "";
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setCrop({ width: 100, height: 25, x: 10, y: 10, unit: "px" });
  }

  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;

    if (!image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);

    const worker = await createWorker("eng");
    startScanning(async () => {
      const {
        data: { text },
      } = await worker.recognize(previewCanvasRef.current!.toDataURL());
      setValue("query", text);
      setImgSrc("");
      await worker.terminate();
    });
  }

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
    <>
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
              className="flex flex-row items-center gap-2 max-h-[200px]"
            >
              <textarea
                rows={1}
                placeholder="Ask something..."
                {...register("query")}
                disabled={!userId}
                className="flex-grow min-h-[50px] max-h-[200px]leading-5 bg-transparent resize-none outline-none text-sm"
              ></textarea>
              <label htmlFor="file-input">
                <MdOutlineImageSearch className="h-6 w-6 m-auto" />
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
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
      {!!imgSrc && (
        <div
          className="absolute top-0 left-0 w-full max-h-screen"
          aria-labelledby="crop-image-dialog"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-all backdrop-blur-sm"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full justify-center px-2 py-12 text-center ">
              <div className="relative w-[95%] sm:w-[80%] min-h-[60vh] rounded-2xl bg-gray-800 text-slate-100 text-left shadow-xl transition-all">
                <div className="flex flex-col items-center justify-evenly px-5 py-4">
                  {!!imgSrc && (
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      minWidth={50}
                      minHeight={25}
                      // circularCrop
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        className="h-4/5"
                        src={imgSrc}
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  )}

                  {!!completedCrop && (
                    <>
                      <canvas
                        ref={previewCanvasRef}
                        className="hidden"
                      ></canvas>

                      <Button onClick={onDownloadCropClick}>
                        {isScanning ? (
                          <>
                            {"Scanning"}
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          "Scan"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;
