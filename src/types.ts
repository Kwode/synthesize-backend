export interface ResearchItem {
  id: string;
  user_id?: string;
  question: string;
  search_query: string;
  attempts: number;
  final_answer: string;
  created_at: string;
}

export interface HistoryResponse {
  history: ResearchItem[];
  page: number;
  size: number;
  total?: number; // Sandbox contains total count
}

export interface AnalyticsResponse {
  total_users: number;
  total_researches: number;
  average_attempts: number;
  latest_research: string;
}
