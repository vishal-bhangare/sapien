export interface Message {
  id?: number;
  userId?: string;
  chatId?: number;
  query: string;
  reply: string;
  created_at?: string;
}
export interface chat {
  created_at?: string;
  id?: number;
  title?: string;
  user_id: string;
}
