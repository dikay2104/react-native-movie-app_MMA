import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.BASE_URL || "http://172.16.0.2:5000/api";

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

// export const fetchMovieDetails = async (
//   movieId: string
// ): Promise<MovieDetails> => {
//   try {
//     const response = await fetch(
//       `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
//       {
//         method: "GET",
//         headers: TMDB_CONFIG.headers,
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Failed to fetch movie details: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching movie details:", error);
//     throw error;
//   }
// };

export interface MovieDetails {
  id?: number; // TMDB ID
  _id?: string; // MongoDB ID
  title: string;
  poster_path: string;
  release_date: string;
  overview?: string;
  vote_average: number;
  vote_count?: number;
  runtime?: number;
  genres: { id?: number; name: string }[];
  budget?: number;
  revenue?: number;
  production_companies: { id?: number; name: string }[];
}

// Ánh xạ MongoDB -> TMDB format
const mapMongoDBToTMDB = (mongoMovie: any): MovieDetails => {
  return {
    _id: mongoMovie._id,
    id: mongoMovie.tmdbId || null,
    title: mongoMovie.title || "N/A",
    poster_path: mongoMovie.posterUrl || "N/A",
    release_date: mongoMovie.releaseDate || "N/A",
    overview: mongoMovie.overview || "N/A",
    vote_average: mongoMovie.rating || 0,
    vote_count: mongoMovie.voteCount || 0,
    runtime: mongoMovie.runtime || 0,
    genres: mongoMovie.genres
      ? mongoMovie.genres.map((genre: string, index: number) => ({
          id: index + 1,
          name: genre,
        }))
      : [],
    budget: mongoMovie.budgetUSD || 0,
    revenue: mongoMovie.revenueUSD || 0,
    production_companies: mongoMovie.productionCompany
      ? [{ id: 1, name: mongoMovie.productionCompany }]
      : [],
  };
};

// Fetch movie details (MongoDB -> fallback TMDB)
export const fetchMovieDetails = async (movieId: string) => {
  const token = await AsyncStorage.getItem("token");
  const headers: HeadersInit = { accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(movieId);

  if (isMongoId) {
    // Fetch từ MongoDB
    const mongoResponse = await fetch(`${BASE_URL}/movies/${movieId}`, {
      method: "GET",
      headers,
    });

    if (mongoResponse.ok) {
      const mongoData = await mongoResponse.json();
      return mapMongoDBToTMDB(mongoData);
    } else {
      const errorText = await mongoResponse.text();
      throw new Error(`MongoDB fetch failed: ${mongoResponse.status} - ${errorText}`);
    }
  } else {
    // Fetch từ TMDB
    const tmdbResponse = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      { method: "GET", headers: TMDB_CONFIG.headers }
    );

    if (tmdbResponse.ok) {
      const tmdbData = await tmdbResponse.json();
      return {
        id: tmdbData.id,
        title: tmdbData.title || "N/A",
        poster_path: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` || "N/A",
        release_date: tmdbData.release_date || "N/A",
        overview: tmdbData.overview || "N/A",
        vote_average: tmdbData.vote_average || 0,
        vote_count: tmdbData.vote_count || 0,
        runtime: tmdbData.runtime || 0,
        genres: tmdbData.genres || [],
        budget: tmdbData.budget || 0,
        revenue: tmdbData.revenue || 0,
        production_companies: tmdbData.production_companies || [],
      };
    } else {
      const errorText = await tmdbResponse.text();
      throw new Error(`TMDB fetch failed: ${tmdbResponse.status} - ${errorText}`);
    }
  }
};

export const fetchTmdbIdByTitle = async (title: string): Promise<number | null> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(title)}&api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`TMDB search failed: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const movie = data.results[0]; // lấy phim khớp đầu tiên
    return movie ? movie.id : null;
  } catch (err) {
    console.warn("Failed to fetch TMDB id by title:", err);
    return null;
  }
};
