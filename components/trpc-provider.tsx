'use client';


import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/hooks/trpc';
import superjson from 'superjson';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                    transformer: superjson,
                    // Add better error handling
                    fetch(url, options) {
                        return fetch(url, {
                            ...options,
                            credentials: 'include',
                        }).then(response => {
                            if (!response.ok) {
                                console.error('TRPC request failed:', url, response.status);
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
