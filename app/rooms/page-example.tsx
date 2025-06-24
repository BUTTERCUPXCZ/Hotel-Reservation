// Example component showing how to use tRPC hooks
'use client';

import { useState } from 'react';
import { trpc } from '@/hooks/trpc';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Define types for Room data
interface RoomType {
    id: string;
    name: string;
}

interface Room {
    id: string;
    name: string;
    description?: string;
    pricePerNight: number;
    maxOccupancy: number;
    roomType: RoomType;
    isActive: boolean;
}

export default function RoomsPage() {
    // Use the tRPC query hook to fetch rooms
    const { data: rooms, isLoading, error } = trpc.rooms.getAvailableRooms.useQuery();

    if (isLoading) return <p>Loading rooms...</p>;
    if (error) return <p>Error loading rooms: {error.message}</p>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Available Rooms</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms?.map((room: Room) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>
        </div>
    );
}

interface RoomCardProps {
    room: Room;
}

function RoomCard({ room }: RoomCardProps) {
    // Room detail fetching example
    const { data: roomDetails } = trpc.rooms.getRoomById.useQuery(
        { id: room.id },
        { enabled: false } // Only load when needed
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.roomType?.name || 'Standard Room'}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-lg font-semibold">${room.pricePerNight} / night</p>
                <p className="mt-2">{room.description || 'No description available'}</p>
                <div className="mt-3">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Max Guests: {room.maxOccupancy}
                    </span>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="mr-2">View Details</Button>
                <Button>Book Now</Button>
            </CardFooter>
        </Card>
    );
}
