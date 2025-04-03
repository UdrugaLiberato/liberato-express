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

export const createCity = async (data: {
    name: string;
    latitude: number;
    longitude: number;
    radiusInKm?: number;
}) => {
    return prisma.city.create({
        data: {
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            radius_in_km: data.radiusInKm ?? 1,
        },
    });
};

export const updateCity = async (
    id: string,
    data: Partial<{
        name: string;
        latitude: number;
        longitude: number;
        radiusInKm: number;
    }>
) => {
    return prisma.city.update({
        where: { id },
        data: {
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            radius_in_km: data.radiusInKm,
            updated_at: new Date(),
        },
    });
};

export const deleteCity = async (id: string) => {
    const city = await prisma.city.findUnique({
        where: { id },
        include: { location: true },
    });

    if (!city) {
        throw new Error("City not found");
    }

    if (city.location.length > 0) {
        throw new Error("City has linked locations and cannot be deleted");
    }

    return prisma.city.update({
        where: { id },
        data: {
            deleted_at: new Date(),
        },
    });
};