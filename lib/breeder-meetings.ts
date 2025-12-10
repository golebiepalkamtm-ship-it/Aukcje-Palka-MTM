import { prisma } from './prisma';

/**
 * Pobiera spotkanie z hodowcą po ID
 * @param id ID spotkania
 * @returns Spotkanie z hodowcą lub null jeśli nie znaleziono
 */
export async function getBreederMeetingById(id: string) {
  try {
    const meeting = await prisma.breederMeeting.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!meeting) {
      return null;
    }

    // Parsuj images jeśli jest stringiem JSON
    let images: string[] = [];
    if (meeting.images) {
      try {
        images = typeof meeting.images === 'string' 
          ? JSON.parse(meeting.images) 
          : meeting.images;
      } catch {
        images = [];
      }
    }

    return {
      ...meeting,
      images,
      photoUrl: images[0] || null,
    };
  } catch (error) {
    console.error('Error fetching breeder meeting:', error);
    return null;
  }
}

