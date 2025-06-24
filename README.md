# HostelHub - Hostel Reservation System

A modern, responsive hostel reservation system built with Next.js 15, React 19, and TypeScript.

## Features

- 🏨 **Room Management** - Browse and book different room types
- 💳 **Payment Integration** - GCash and credit card support
- 👤 **User Authentication** - Secure login and registration
- 📱 **Responsive Design** - Works on all devices
- ⭐ **Reviews & Ratings** - Guest feedback system
- 🎯 **Advanced Filtering** - Find the perfect room
- 📊 **Admin Dashboard** - Manage bookings and rooms

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs
- **Payment**: GCash integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- PostgreSQL database

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd hostel-reservation-system
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── rooms/             # Room pages
│   ├── booking/           # Booking flow
│   └── dashboard/         # User dashboard
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
└── public/               # Static assets
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
