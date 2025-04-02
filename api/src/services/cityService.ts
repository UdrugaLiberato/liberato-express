import prisma from "../config/prisma";

export const getAllCities = () => {
    return prisma.city.findMany({
        where: { deleted_at: null },
    });
};

export const getCityById = (id: string) => {
    return prisma.city.findUnique({
        where: { id },
    });
};