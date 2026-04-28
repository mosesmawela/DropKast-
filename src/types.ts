export interface User {
  id: string;
  email: string;
  artistName: string;
  avatar?: string;
  role: 'admin' | 'artist' | 'manager';
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  status: 'Released' | 'Scheduled' | 'Draft' | 'Rejected';
  format: 'Single' | 'EP' | 'Album';
  releaseDate: string;
  upc?: string;
  isrc?: string;
  stores: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
