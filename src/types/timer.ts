export interface Timer {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration: number;
  created_at?: string;
  updated_at?: string;
}