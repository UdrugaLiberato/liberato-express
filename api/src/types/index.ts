// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    nextCursor?: string;
    hasNext: boolean;
    total?: number;
  };
}

// Error Types
export interface ApiErrorResponse {
  error: {
    message: string;
    status: number;
    code?: string;
    timestamp: string;
    path: string;
    stack?: string;
    details?: any;
  };
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

export interface UserFilters {
  email?: string;
  username?: string;
  role?: string;
  cursor?: string;
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
  cursor?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  descriptionEN?: string;
  descriptionHR?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  questions?: QuestionResponse[];
  images?: ImageResponse[];
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
  radiusInKm?: number | null;
}

export interface CityFilters {
  name?: string;
  slug?: string;
  cursor?: string;
}

export interface CityResponse {
  id: string;
  name: string;
  slug?: string;
  descriptionEN?: string;
  descriptionHR?: string;
  latitude: number;
  longitude: number;
  radiusInKm: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  images?: ImageResponse[];
  locations?: LocationResponse[];
}

// Location Types
export interface LocationData {
  name: string;
  category_id: string;
  city_id: string;
  street: string;
  phone?: string;
  email?: string;
  about?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  qa?: string;
}

// Legacy type for backward compatibility
export interface LocationCreateData extends LocationData {}

export interface LocationUpdateData {
  name?: string;
  category_id?: string;
  city_id?: string;
  street?: string;
  phone?: string;
  email?: string;
  about?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  qa?: string;
}

export interface LocationFilters {
  city?: string;
  category?: string;
  name?: string;
  featured?: boolean;
  cursor?: string;
  limit?: number;
  includeVotes?: boolean;
}

export interface LocationResponse {
  id: string;
  name: string;
  slug: string;
  street: string;
  phone?: string;
  email?: string;
  about?: string;
  latitude: number;
  longitude: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  city: CityResponse;
  category: CategoryResponse;
  images?: ImageResponse[];
  answers?: SimplifiedAnswer[];
  user?: {
    id: string;
    username: string;
  };
}

export interface SimplifiedAnswer {
  answerId: string;
  answer: number;
  questionId: string;
  question: string;
}

export interface LocationWithSimplifiedAnswers extends Omit<LocationResponse, 'answers'> {
  answers: SimplifiedAnswer[];
}

// Question Types
export interface QuestionData {
  question: string;
  category_id?: string;
}

export interface QuestionUpdateData {
  question?: string;
  category_id?: string;
}

export interface QuestionFilters {
  category_id?: string;
  cursor?: string;
}

export interface QuestionResponse {
  id: string;
  question: string;
  category_id?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  category?: CategoryResponse;
  answers?: AnswerResponse[];
}

// Answer Types
export interface AnswerData {
  question_id: string;
  location_id: string;
  answer: number;
}

export interface AnswerUpdateData {
  answer?: number;
}

export interface AnswerFilters {
  question_id?: string;
  location_id?: string;
  cursor?: string;
}

export interface AnswerResponse {
  id: string;
  answer: number;
  question_id?: string;
  location_id?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  question?: QuestionResponse;
  location?: LocationResponse;
}

// Image Types
export interface ImageData {
  src: string;
  name: string;
  mime?: string;
  category_id?: string;
  location_id?: string;
  city_id?: string;
}

export interface ImageUpdateData {
  src?: string;
  name?: string;
  mime?: string;
}

export interface ImageFilters {
  category_id?: string;
  location_id?: string;
  city_id?: string;
  cursor?: string;
}

export interface ImageResponse {
  id: number;
  src: string;
  name: string;
  mime?: string;
  category_id?: string;
  location_id?: string;
  city_id?: string;
  deletedAt?: Date;
  category?: CategoryResponse;
  location?: LocationResponse;
  city?: CityResponse;
}

// Upload Types
export interface UploadResponseData {
  files: Array<{
    path: string;
    name?: string;
    size?: number;
    fileType?: string;
  }>;
}

// Vote Types
export interface VoteData {
  location_id: string;
  vote_type: 'up' | 'down';
}

export interface VoteResponse {
  id: string;
  location_id: string;
  vote_type: 'up' | 'down';
  user_id: string;
  createdAt: Date;
  location?: LocationResponse;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  userVote?: 'up' | 'down' | null;
}

// Search Types
export interface SearchFilters {
  query: string;
  type?: 'location' | 'city' | 'category' | 'all';
  limit?: number;
  cursor?: string;
}

export interface SearchResponse {
  results: Array<LocationResponse | CityResponse | CategoryResponse>;
  total: number;
  type: string;
  query: string;
}

// Performance Types
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: string;
  endpoint: string;
  method: string;
}

// API Usage Types
export interface ApiUsageData {
  endpoint: string;
  method: string;
  url: string;
  timestamp: string;
  userAgent?: string;
  ip: string;
  apiKey?: string;
  responseTime?: number;
  statusCode?: number;
}

// Request Types (for middleware)
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  apiKey?: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      apiKey?: string;
      userAgent?: string;
    }
  }
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services?: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    external: 'ok' | 'error';
  };
  metrics?: {
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
}

// Coordinate Types
export interface Coordinates {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address: string;
}

// Pagination Types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    hasNext: boolean;
    total?: number;
  };
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Cache Types
export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
}

export interface CacheData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Export all types
export type {
  Request,
  Response,
  NextFunction,
} from 'express';
