// src/app/api/content/search/route.ts
import { handleGetSearch, handlePostSearch } from './logic';
import { searchContent, advancedSearch, updateSearchStats } from '@/lib/search';

const searchDeps = {
  searchContent,
  advancedSearch,
  updateSearchStats,
};

export async function GET(request: Request): Promise<Response> {
  return handleGetSearch(request, searchDeps);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostSearch(request, searchDeps);
}
