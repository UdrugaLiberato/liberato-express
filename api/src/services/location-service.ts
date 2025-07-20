import prisma from '../config/prisma';
import { GoogleMaps } from '../utils/google-maps';
import { Express } from 'express';

export const getAllLocations = async (filters: {
  city?: string;
  category?: string;
}) => {
  const { city, category } = filters;

  const locations = await prisma.location.findMany({
    where: {
      deletedAt: null,
      ...(city && {
        city: {
          name: city,
        },
      }),
      ...(category && {
        category: {
          name: category,
        },
      }),
    },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
      answer: {
        select: {
          id: true,
          answer: true,
          question: { select: { id: true, question: true } },
        },
      },
      image: true,
    },
  });

  return locations.map((loc) => {
    const simplifiedAnswers = (loc.answer || [])
      .filter((a) => a.question !== null)
      .map((a) => ({
        answerId: a.id,
        questionId: a.question!.id,
        question: a.question!.question,
        answer: a.answer,
      }));

    return {
      ...loc,
      answer: simplifiedAnswers,
    };
  });
};

export const getLocationById = async (id: string) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
      answer: {
        select: {
          id: true,
          answer: true,
          question: { select: { id: true, question: true } },
        },
      },
      image: true,
    },
  });

  if (!location) return null;

  const simplifiedAnswers = (location.answer || [])
    .filter((a) => a.question !== null)
    .map((a) => ({
      answerId: a.id,
      questionId: a.question!.id,
      question: a.question!.question,
      answer: a.answer,
    }));

  return {
    ...location,
    answer: simplifiedAnswers,
  };
};

export const getLocationByName = async (name: string) => {
  console.log(name);
  const location = await prisma.location.findFirst({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
      deletedAt: null,
    },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
      answer: {
        select: {
          id: true,
          answer: true,
          question: { select: { id: true, question: true } },
        },
      },
    },
  });

  if (!location) return null;

  const simplifiedAnswers = (location.answer || [])
    .filter((a) => a.question !== null)
    .map((a) => ({
      answerId: a.id,
      questionId: a.question!.id,
      question: a.question!.question,
      answer: a.answer,
    }));

  return {
    ...location,
    answer: simplifiedAnswers,
  };
};

export const createLocation = async (
  body: any,
  files: Express.Multer.File[],
  userId: string,
) => {
  const googleMaps = new GoogleMaps();

  const city = await prisma.city.findUnique({
    where: { id: body.city_id },
  });

  if (!city) {
    return null;
  }

  const geo = await googleMaps.getCoordinateForStreet(body.street, city.name);
  const formattedStreet = geo.formatted_address || body.street;

  if (!geo?.lat || !geo?.lng) {
    throw new Error(`Google Maps failed to find coordinates`);
  }

  const location = await prisma.location.create({
    data: {
      category: { connect: { id: body.categoryId } },
      city: { connect: { id: body.city_id } },
      user: { connect: { id: userId } },
      name: body.name,
      street: formattedStreet,
      phone: body.phone,
      email: body.email,
      about: body.about,
      latitude: geo.lat,
      longitude: geo.lng,
      published: 1,
      featured: body.featured === 'true' ? 1 : 0,
      createdAt: new Date(),
    },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
    },
  });

  await Promise.all(
    files.map((file) =>
      prisma.image.create({
        data: {
          src: `https://dev.udruga-liberato.hr/images/locations/${file.filename}`,
          name: file.originalname.split('.')[0],
          mime: file.mimetype,
          locationId: location.id,
        },
      }),
    ),
  );

  if (body.qa) {
    const qaItems = body.qa.split(',');
    await Promise.all(
      qaItems.map(async (item: string) => {
        const [questionId, answer] = item.split(':');
        await prisma.answer.create({
          data: {
            question: { connect: { id: questionId } },
            answer: answer === 'true' ? 1 : 0,
            location: { connect: { id: location.id } },
            createdAt: new Date(),
          },
        });
      }),
    );
  }

  const baseLocation = await prisma.location.findUnique({
    where: { id: location.id },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
      image: true,
      answer: {
        select: {
          id: true,
          answer: true,
          question: {
            select: {
              id: true,
              question: true,
            },
          },
        },
      },
    },
  });

  const simplifiedAnswers = (baseLocation?.answer || [])
    .filter((a) => a.question !== null)
    .map((a) => ({
      answerId: a.id,
      questionId: a.question!.id,
      question: a.question!.question,
      answer: a.answer,
    }));

  return {
    ...baseLocation,
    answer: simplifiedAnswers,
  };
};

export const updateLocation = async (
  id: string,
  body: Partial<{
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
  }>,
  files: Express.Multer.File[],
) => {
  if (!body) throw new Error('Empty body');

  const dataToUpdate: any = {};

  if (body.name !== undefined) dataToUpdate.name = body.name;
  if (body.street !== undefined) dataToUpdate.street = body.street;
  if (body.phone !== undefined) dataToUpdate.phone = body.phone;
  if (body.email !== undefined) dataToUpdate.email = body.email;
  if (body.about !== undefined) dataToUpdate.about = body.about;

  if (body.categoryId !== undefined) {
    dataToUpdate.category = { connect: { id: body.categoryId } };
  }

  if (body.city_id !== undefined) {
    dataToUpdate.city = { connect: { id: body.city_id } };
  }

  if (body.published !== undefined) {
    dataToUpdate.published =
      body.published === true || body.published === 'true' ? 1 : 0;
  }

  if (body.featured !== undefined) {
    dataToUpdate.featured =
      body.featured === true || body.featured === 'true' ? 1 : 0;
  }

  if (body.street !== undefined || body.city_id !== undefined) {
    const city = body.city_id
      ? await prisma.city.findUnique({ where: { id: body.city_id } })
      : null;

    const googleMaps = new GoogleMaps();
    const geo = await googleMaps.getCoordinateForStreet(
      body.street ?? '',
      city?.name ?? '',
    );

    if (!geo?.lat || !geo?.lng) {
      throw new Error(`Google Maps failed to find coordinates`);
    }

    dataToUpdate.latitude = geo.lat;
    dataToUpdate.longitude = geo.lng;
  }

  dataToUpdate.updatedAt = new Date();

  await prisma.location.update({
    where: { id },
    data: dataToUpdate,
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
    },
  });

  if (files?.length) {
    await prisma.image.deleteMany({
      where: { locationId: id },
    });

    await Promise.all(
      files.map((file) =>
        prisma.image.create({
          data: {
            id: Math.floor(Math.random() * 1_000_000_000),
            src: `https://dev.udruga-liberato.hr/images/locations/${file.filename}`,
            name: file.originalname.split('.')[0],
            mime: file.mimetype,
            locationId: id,
          },
        }),
      ),
    );
  }

  if (body.qa) {
    await prisma.answer.deleteMany({
      where: { locationId: id },
    });

    const qaItems = body.qa.split(',');
    await Promise.all(
      qaItems.map(async (item: string) => {
        const [questionId, answer] = item.split(':');
        await prisma.answer.create({
          data: {
            question: { connect: { id: questionId } },
            answer: answer === 'true' ? 1 : 0,
            location: { connect: { id } },
            createdAt: new Date(),
          },
        });
      }),
    );
  }

  const fullLocation = await prisma.location.findUnique({
    where: { id },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
      image: true,
      answer: {
        select: {
          id: true,
          answer: true,
          question: {
            select: {
              id: true,
              question: true,
            },
          },
        },
      },
    },
  });

  const simplifiedAnswers = (fullLocation?.answer || [])
    .filter((a) => a.question !== null)
    .map((a) => ({
      answerId: a.id,
      questionId: a.question!.id,
      question: a.question!.question,
      answer: a.answer,
    }));

  return {
    ...fullLocation,
    answer: simplifiedAnswers,
  };
};

export const deleteLocation = async (id: string) => {
  return prisma.location.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const getLocationsByCityAndCategory = async (
  city: string,
  category: string,
  cursor?: string,
) => {
  const pageSize = 10;

  const locations = await prisma.location.findMany({
    where: {
      city: { name: city },
      category: { name: category },
      deletedAt: null,
    },
    ...(cursor ? { cursor: { id: cursor } } : undefined),
    take: pageSize + 1,
    include: {
      image: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const nextCursor =
    locations.length > pageSize ? locations[pageSize].id : null;

  return {
    locations: locations.slice(0, pageSize),
    nextCursor,
  };
};
