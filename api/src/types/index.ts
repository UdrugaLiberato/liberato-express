// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
}

// Auth Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  avatar?: string;
}

export interface AuthResponse {
  role: string;
  name: string;
  email: string | null;
  token: string;
  id: string;
}

export interface RegisterResponse {
  username: string;
  email: string | null;
  avatar?: string | null;
  id: string;
}

// User Types
export interface UserData {
  emailAddress: string;
  username: string;
  password?: string;
  roles?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserUpdateData {
  emailAddress?: string;
  username?: string;
  password?: string;
  roles?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  phone?: string;
  roles: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  locations?: any[];
}

// Category Types
export interface CategoryData {
  name: string;
  descriptionEN?: string;
  descriptionHR?: string;
}

export interface CategoryUpdateData {
  name?: string;
  descriptionEN?: string;
  descriptionHR?: string;
}

export interface CategoryFilters {
  name?: string;
  includeQuestions?: boolean;
  includeImages?: boolean;
}

// City Types
export interface CityData {
  name: string;
  descriptionEN?: string;
  descriptionHR?: string;
  latitude: number;
  longitude: number;
  radiusInKm?: number | null;
}

export interface CityUpdateData {
  name?: string;
  descriptionEN?: string;
  descriptionHR?: string;
  latitude?: number;
  longitude?: number;
  radiusInKm?: number;
}

// Question Types
export interface QuestionData {
  question: string;
  categoryId?: string;
}

export interface QuestionUpdateData {
  question?: string;
  categoryId?: string;
}

// Image Types
export interface ImageData {
  src: string;
  name: string;
  mime: string;
  categoryId?: string;
  locationId?: string;
}

export interface ImageUpdateData {
  src?: string;
  name?: string;
  mime?: string;
}

// Location Types
export interface LocationFilters {
  city?: string;
  category?: string;
  cursor?: string | null;
  name?: string;
  includeAnswers?: boolean;
  includeImages?: boolean;
  includeQuestions?: boolean;
}

export interface LocationCreateData {
  category_id: string;
  city_id: string;
  name: string;
  street: string;
  phone?: string;
  email?: string;
  published?: string | boolean;
  featured?: string | boolean;
  about?: string;
  latitude?: number;
  longitude?: number;
  qa?: string;
}

export interface LocationUpdateData {
  name?: string;
  street?: string;
  phone?: string;
  email?: string;
  about?: string;
  categoryId?: string;
  city_id?: string;
  published?: boolean | string;
  featured?: boolean | string;
  qa?: string;
}

export interface SimplifiedAnswer {
  answerId: string;
  answer: string;
  questionId: string;
  question: string;
}

export interface LocationWithSimplifiedAnswers {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cityId: string;
  categoryId: string;
  answers: SimplifiedAnswer[];
}

// Express Request Extension
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
