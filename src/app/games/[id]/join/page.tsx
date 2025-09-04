import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JoinGameForm from '@/components/game/JoinGameForm';

interface JoinGamePageProps {
  params: Promise<{ id: string }>;
}

export default async function JoinGamePage({ params }: JoinGamePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    const resolvedParams = await params;
    redirect(`/auth/signin?callbackUrl=/games/${resolvedParams.id}/join`);
  }

  const resolvedParams = await params;
  const game = await prisma.game.findUnique({
    where: { id: resolvedParams.id },
    include: {
      organizer: true,
      signups: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          signups: true,
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  // Check if user already signed up for this game
  const existingSignup = await prisma.gameSignup.findUnique({
    where: {
      userId_gameId: {
        userId: (session.user as any).id,
        gameId: game.id,
      },
    },
  });

  // If user already signed up, redirect to game details
  if (existingSignup) {
    redirect(`/games/${game.id}?message=already-joined`);
  }

  // Check if game is full
  const spotsLeft = game.maxPlayers - game.currentPlayers;
  const isFull = spotsLeft <= 0;

  if (isFull) {
    redirect(`/games/${game.id}?message=game-full`);
  }

  // Get user's joined games for conflict checking
  const userSignups = await prisma.gameSignup.findMany({
    where: {
      userId: session.user.id,
      status: 'CONFIRMED',
    },
    include: {
      game: {
        include: {
          organizer: true,
          signups: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              signups: true,
            },
          },
        },
      },
    },
  });

  // Serialize all data for client component
  const gameForClient = {
    ...game,
    date: game.date.toISOString(),
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
    pricePerPlayer: Number(game.pricePerPlayer),
    organizer: {
      ...game.organizer,
      createdAt: game.organizer.createdAt.toISOString(),
      updatedAt: game.organizer.updatedAt.toISOString(),
      emailVerified: game.organizer.emailVerified?.toISOString() || null,
    },
    signups: game.signups.map(signup => ({
      ...signup,
      createdAt: signup.createdAt.toISOString(),
      updatedAt: signup.updatedAt.toISOString(),
      user: {
        ...signup.user,
        createdAt: signup.user.createdAt.toISOString(),
        updatedAt: signup.user.updatedAt.toISOString(),
        emailVerified: signup.user.emailVerified?.toISOString() || null,
      },
    })),
  };

  const userJoinedGamesForClient = userSignups.map(signup => ({
    ...signup.game,
    date: signup.game.date.toISOString(),
    createdAt: signup.game.createdAt.toISOString(),
    updatedAt: signup.game.updatedAt.toISOString(),
    pricePerPlayer: Number(signup.game.pricePerPlayer),
    organizer: {
      ...signup.game.organizer,
      createdAt: signup.game.organizer.createdAt.toISOString(),
      updatedAt: signup.game.organizer.updatedAt.toISOString(),
      emailVerified: signup.game.organizer.emailVerified?.toISOString() || null,
    },
    signups: signup.game.signups.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      user: {
        ...s.user,
        createdAt: s.user.createdAt.toISOString(),
        updatedAt: s.user.updatedAt.toISOString(),
        emailVerified: s.user.emailVerified?.toISOString() || null,
      },
    })),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <JoinGameForm
        game={gameForClient}
        userId={(session.user as any).id}
        spotsLeft={spotsLeft}
        userJoinedGames={userJoinedGamesForClient}
      />
    </div>
  );
}
