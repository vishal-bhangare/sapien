import { create } from "zustand";
import { Message, chat } from "./entities";

interface chatStore {
  isNewChat: Boolean;
  chats: chat[];
  chatid: number;
  chatData: Message[];
  getIsNewChat: () => Boolean;
  setIsNewChat: (val: Boolean) => void;
  getChats: () => chat[];
  setChats: (chats: chat[]) => void;
  getChatData: () => Message[];
  setChatData: (data: Message[]) => void;
  updateChatData: (message: Message) => void;
  getChatId: () => number;
  setChatId: (chatid: number) => void;
  reset: () => void;
}
const initialState = {
  isNewChat: false,
  chatid: 0,
  chatData: [],
  chats: [],
};

const useChatStore = create<chatStore>((set, get) => ({
  ...initialState,
  getIsNewChat: () => {
    return get().isNewChat;
  },
  setIsNewChat: (val: Boolean) => {
    set(() => ({ isNewChat: val }));
  },
  getChats: () => {
    return get().chats;
  },
  setChats: (chats: chat[]) => {
    set(() => ({ chats: chats }));
  },
  getChatData: () => {
    return get().chatData;
  },
  setChatData: (data: Message[]) => {
    set(() => ({ chatData: data }));
  },
  updateChatData: (message: Message) => {
    set(() => ({ chatData: [...get().chatData, message] }));
  },
  getChatId: () => {
    return get().chatid;
  },
  setChatId: (chatid: number) => {
    set(() => ({ chatid: chatid }));
  },
  reset: () => set(() => initialState),
}));

export default useChatStore;
