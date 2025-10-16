/**
 * Custom API hooks for handling REST API requests using React Query and Axios
 * This module provides two main hooks:
 * - useApiQuery: For handling GET requests with caching and auto-revalidation
 * - useApiMutation: For handling POST/PUT/PATCH/DELETE requests with cache invalidation
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axiosClient";
import { AxiosError } from "axios";

/**
 * Options interface for configuring GET requests
 * @property enabled - Controls whether the query should automatically run
 * @property staleTime - Duration in ms before data is considered stale
 */
interface UseApiQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Hook for handling GET requests with React Query
 * @template T - Type of the expected response data
 * @param endpoint - The API endpoint to fetch from
 * @param queryKey - Unique key for React Query caching
 * @param options - Additional configuration options
 * @returns React Query result object with data, loading state, and error
 */
export function useApiQuery<T>(
  endpoint: string,
  queryKey: unknown[],
  options?: UseApiQueryOptions
) {
  return useQuery<T, AxiosError>({
    queryKey,
    queryFn: async () => {
      const { data } = await axiosClient.get<T>(endpoint);
      return data;
    },
    ...options,
  });
}

/**
 * Options interface for configuring mutation requests
 * @template T - Type of the expected response data
 * @property onSuccess - Callback function executed on successful mutation
 * @property onError - Callback function executed on mutation error
 * @property invalidateKeys - Array of query keys to invalidate after successful mutation
 */
interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  invalidateKeys?: unknown[][];
}

/**
 * Hook for handling mutation requests (POST/PUT/PATCH/DELETE)
 * @template T - Type of the expected response data
 * @template V - Type of the request payload data
 */
export function useApiMutation<T = unknown, V = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: UseApiMutationOptions<T>
) {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, V>({
    mutationFn: async (data: V) => {
      let response;
      switch (method) {
        case "POST":
          response = await axiosClient.post<T>(endpoint, data);
          break;
        case "PUT":
          response = await axiosClient.put<T>(endpoint, data);
          break;
        case "PATCH":
          response = await axiosClient.patch<T>(endpoint, data);
          break;
        case "DELETE":
          response = await axiosClient.delete<T>(endpoint);
          break;
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate queries if specified
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Example usage in components:
 *
 * 1. GET request example:
 * ```typescript
 * // Fetching user data with automatic caching
 * const { data, isLoading, error } = useApiQuery<User>(
 *   '/users/me',
 *   ['user', 'me'],
 *   { staleTime: 5 * 60 * 1000 } // Data considered fresh for 5 minutes
 * );
 * ```
 *
 * 2. POST request with cache invalidation:
 * ```typescript
 * // Creating a new post and invalidating posts list
 * const createPost = useApiMutation<Post, CreatePostDto>(
 *   '/posts',
 *   'POST',
 *   {
 *     invalidateKeys: [['posts']], // Invalidate posts list cache
 *     onSuccess: () => console.log('Post created!'),
 *     onError: (error) => console.error(error.response?.data),
 *   }
 * );
 *
 * // Usage
 * createPost.mutate({ title: 'Hello', content: 'World' });
 * ```
 *
 * 3. PATCH request example:
 * ```typescript
 * // Updating user profile
 * const updateUser = useApiMutation<User, UpdateUserDto>(
 *   '/users/me',
 *   'PATCH',
 *   {
 *     invalidateKeys: [['user', 'me']], // Invalidate user cache
 *   }
 * );
 *
 * // Usage
 * updateUser.mutate({ name: 'John Doe' });
 * ```
 *
 * 4. DELETE request example:
 * ```typescript
 * // Deleting a post
 * const deletePost = useApiMutation<void, void>(
 *   `/posts/${id}`,
 *   'DELETE',
 *   {
 *     invalidateKeys: [['posts']], // Invalidate posts list cache
 *   }
 * );
 *
 * // Usage
 * deletePost.mutate();
 * ```
 */
