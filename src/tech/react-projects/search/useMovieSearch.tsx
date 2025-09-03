import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useDebounce } from "@uidotdev/usehooks";
import { fetcher } from '@/utils/fetcher'

export const useMovieSearch = () => {
  const [search, setSearch] = useState('');
  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, isLoading } = useSWR<ApiResponse>(
    debouncedSearchTerm ? `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${debouncedSearchTerm}` : null, 
    (url: string) => fetcher(url, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.PUBLIC_MOVIE_API_READ_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
  )

  const dataModified = useMemo(() => ({
      ...data,
      results: data?.results.slice(0,10) || [],
    }), [data])

  return {
    search,
    setSearch,
    data : dataModified,
    error,
    isLoading
  }
}

export type Movie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export type ApiResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
