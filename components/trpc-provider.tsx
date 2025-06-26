'use client';


import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/hooks/trpc';
import superjson from 'superjson';
import { isLoggingOut } from '@/lib/trpc-helpers';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error: any) => {
                    // Don't retry if we're logging out
                    if (isLoggingOut()) {
                        return false;
                    }

                    // Don't retry on 401/403 errors
                    if (error?.data?.httpStatus === 401 ||
                        error?.data?.httpStatus === 403 ||
                        error?.message?.includes('UNAUTHORIZED')) {
                        return false;
                    }

                    // Default retry logic for other errors (retry 3 times)
                    return failureCount < 3;
                }
            }
        }
    }));
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                    transformer: superjson,
                    // Add better error handling
                    fetch(url, options) {
                        console.log('TRPC request:', url, options?.method || 'GET');

                        // Check if logout is in progress - if so, abort the request
                        if (isLoggingOut()) {
                            console.log('⛔ Aborting TRPC request during logout:', url);
                            const abortError = new Error('Logout in progress, request aborted');
                            abortError.name = 'AbortError';
                            return Promise.reject(abortError);
                        }

                        // Log request headers for debugging
                        if (options?.headers) {
                            console.log('TRPC request headers:', options.headers);
                        }

                        return fetch(url, {
                            ...options,
                            credentials: 'include',
                        }).then(async response => {
                            console.log('TRPC response status:', response.status);

                            if (!response.ok) {
                                console.error('TRPC request failed:', url, response.status);
                                const errorText = await response.text();
                                console.error('TRPC response error:', errorText);

                                // Try to parse as JSON for better error details
                                try {
                                    const errorJson = JSON.parse(errorText);
                                    console.error('TRPC parsed error:', errorJson);
                                } catch (parseError) {
                                    console.error('Could not parse error response as JSON');
                                }
                            } else {
                                console.log('TRPC request successful:', url);
                            }

                            return response;
                        }).catch(err => {
                            console.error('TRPC network error:', err);
                            throw err;
                        });
                    }
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    );
}
