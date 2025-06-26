// lib/trpc-helpers.ts
import { QueryClient } from '@tanstack/react-query';

/**
 * Checks if a logout is currently in progress
 */
export function isLoggingOut(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('isLoggingOut') === 'true';
}

/**
 * Sets the logging out flag
 */
export function setLoggingOutFlag(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('isLoggingOut', 'true');
    console.log('🚩 Logging out flag set');
}

/**
 * Clears the logging out flag
 */
export function clearLoggingOutFlag(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('isLoggingOut');
    console.log('🚩 Logging out flag cleared');
}

/**
 * Cancels all active queries in the React Query client
 */
export function cancelAllQueries(queryClient: QueryClient): void {
    console.log('⚠️ Cancelling all active queries');
    queryClient.cancelQueries();
}

/**
 * A hook to be used by TRPC to determine if a query should be executed
 */
export function shouldExecuteQuery(): boolean {
    return !isLoggingOut();
}

/**
 * Helper to clear all TRPC cache on logout
 */
export function clearTRPCCache(queryClient: QueryClient): void {
    console.log('🧹 Clearing all TRPC query cache');
    queryClient.clear();
}
