import prisma from '../config/prisma';
import { GoogleMaps } from '../utils/google-maps';
import { Express } from 'express';

export const getAllLocations = async () => {
  const locations = await prisma.location.findMany({
    where: { deleted_at: null },
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

  // 1. Create the location first
  const location = await prisma.location.create({
    data: {
      category: { connect: { id: body.category_id } },
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
      created_at: new Date(),
    },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
    },
  });

  const imageCreates = await Promise.all(
    files.map((file) =>
      prisma.image.create({
        data: {
          src: `https://dev.udruga-liberato.hr/images/locations/${file.filename}`,
          name: file.originalname.split('.')[0],
          mime: file.mimetype,
          location_id: location.id
        },
      })
    )
  );

  // const imageLocationLinks = imageCreates.map((img) => ({
  //   image: { connect: { id: img.id } },
  // }));

  // await Promise.all(
  //   files.map((file) =>
  //     prisma.image.create({
  //       data: {
  //         src: `https://dev.udruga-liberato.hr/images/locations/${file.filename}`,
  //         name: file.originalname.split('.')[0],
  //         mime: file.mimetype,
  //         location_id: location.id, // <--- key line
  //       },
  //     })
  //   )
  // );

  if (body.qa) {
    const qaItems = body.qa.split(',');
    await Promise.all(qaItems.map(async (item: string) => {
      const [questionId, answer] = item.split(':');
      await prisma.answer.create({
        data: {
          question: { connect: { id: questionId } },
          answer: answer === 'true'? 1 : 0,
          location: { connect: { id: location.id } },
          created_at: new Date(),
        },
      });
    }));
  }


  const baseLocation = await prisma.location.findUnique({
    where: { id: location.id },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
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


// export const updateLocation = async (
//   id: string,
//   body: Partial<{
//     name?: string;
//     street?: string;
//     phone?: string;
//     email?: string;
//     about?: string;
//     category_id?: string;
//     city_id?: string;
//     published?: boolean | string;
//     featured?: boolean | string;
//     qa?: string;
//   }>,
//   files: Express.Multer.File[]
// ) => {
//   const dataToUpdate: any = {};
//
//   if (!body) {
//     throw new Error("Empty body");
//   }
//
//   if (body.name !== undefined) dataToUpdate.name = body.name;
//   if (body.street !== undefined) dataToUpdate.street = body.street;
//   if (body.phone !== undefined) dataToUpdate.phone = body.phone;
//   if (body.email !== undefined) dataToUpdate.email = body.email;
//   if (body.about !== undefined) dataToUpdate.about = body.about;
//
//   if (body.category_id !== undefined) {
//     dataToUpdate.category = { connect: { id: body.category_id } };
//   }
//
//   if (body.city_id !== undefined) {
//     dataToUpdate.city = { connect: { id: body.city_id } };
//   }
//
//   if (body.published !== undefined) {
//     dataToUpdate.published = body.published === true || body.published === 'true';
//   }
//
//   if (body.featured !== undefined) {
//     dataToUpdate.featured = body.featured === true || body.featured === 'true';
//   }
//
//   if (body.street !== undefined || body.city_id !== undefined) {
//     const city = body.city_id
//       ? await prisma.city.findUnique({ where: { id: body.city_id } })
//       : null;
//
//     const googleMaps = new GoogleMaps();
//     const geo = await googleMaps.getCoordinateForStreet(body.street ?? '', city?.name ?? '');
//
//     if (!geo?.lat || !geo?.lng) {
//       throw new Error(`Google Maps failed to find coordinates`);
//     }
//
//     dataToUpdate.latitude = geo.lat;
//     dataToUpdate.longitude = geo.lng;
//   }
//
//   dataToUpdate.updated_at = new Date();
//
//   const location = await prisma.location.update({
//     where: { id },
//     data: dataToUpdate,
//     include: {
//       city: true,
//       category: true,
//       user: { select: { id: true, username: true } },
//     },
//   });
//
//
//
//   if (files && files.length > 0) {
//     await prisma.image_location.deleteMany({
//       where: { location_id: id },
//     });
//
//     await prisma.image.deleteMany({
//       where: {
//         image_location: {
//           none: {},
//         },
//       },
//     });
//     const imageCreates = await Promise.all(
//       files.map((file) =>
//         prisma.image.create({
//           data: {
//             src: `https://dev.udruga-liberato.hr/images/locations/${file.filename}`,
//             name: file.originalname.split('.')[0],
//             mime: file.mimetype,
//           },
//         })
//       )
//     );
//
//     const imageLocationLinks = imageCreates.map((img) => ({
//       image_id: img.id,
//       location_id: id,
//     }));
//
//     await prisma.image_location.createMany({
//       data: imageLocationLinks,
//     });
//   }
//
//   if (body.qa) {
//     await prisma.answer.deleteMany({
//       where: { location_id: id },
//     });
//     const qaItems = body.qa.split(',');
//     await Promise.all(
//       qaItems.map(async (item: string) => {
//         const [questionId, answer] = item.split(':');
//         await prisma.answer.create({
//           data: {
//             question: { connect: { id: questionId } },
//             answer: answer === 'true',
//             location: { connect: { id } },
//             created_at: new Date(),
//           },
//         });
//       })
//     );
//   }
//
//   const fullLocation = await prisma.location.findUnique({
//     where: { id },
//     include: {
//       city: true,
//       category: true,
//       user: { select: { id: true, username: true } },
//       answer: {
//         select: {
//           id: true,
//           answer: true,
//           question: {
//             select: {
//               id: true,
//               question: true,
//             },
//           },
//         },
//       },
//     },
//   });
//
//   const simplifiedAnswers = (fullLocation?.answer || [])
//     .filter((a) => a.question !== null)
//     .map((a) => ({
//       answerId: a.id,
//       questionId: a.question!.id,
//       question: a.question!.question,
//       answer: a.answer,
//     }));
//
//   return {
//     ...fullLocation,
//     answer: simplifiedAnswers,
//   };
// };

export const deleteLocation = async (id: string) => {
  return prisma.location.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
};


// export const addLocationImage = async (
//   locationId: string,
//   files: Express.Multer.File[]
// ) => {
//   const imageCreates = await Promise.all(
//     files.map((file) =>
//       prisma.image.create({
//         data: {
//           src: file.filename,
//           name: file.originalname,
//           mime: file.mimetype || null,
//         },
//       })
//     )
//   );
//
//   const imageLocationLinks = imageCreates.map((img) => ({
//     image_id: img.id,
//     location_id: locationId,
//   }));
//
//   await prisma.image_location.createMany({
//     data: imageLocationLinks,
//   });
//
//   return prisma.location.findUnique({
//     where: { id: locationId },
//     include: {
//       image_location: {
//         include: { image: true },
//       },
//     },
//   });
// };


// export const removeLocationImage = async (
//   imageId: number,
//   locationId: string
// ) => {
//   await prisma.image_location.delete({
//     where: {
//       image_id_location_id: {
//         image_id: imageId,
//         location_id: locationId,
//       },
//     },
//   });
//
//   const stillUsed = await prisma.image_location.findFirst({
//     where: { image_id: imageId },
//   });
//
//   if (!stillUsed) {
//     await prisma.image.delete({ where: { id: imageId } });
//   }
//
//   return { success: true };
// };