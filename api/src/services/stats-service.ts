import prisma from '../config/prisma';

const DEFAULT_PUBLISHED_STATUS = 1;

class StatsServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'StatsServiceError';
  }
}

export const getGlobalStats = async () => {
  try {
    const [citiesCount, locationsCount, categoriesCount] = await Promise.all([
      prisma.city.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.location.count({
        where: {
          published: DEFAULT_PUBLISHED_STATUS,
          deletedAt: null,
        },
      }),
      prisma.category.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      cities: citiesCount,
      locations: locationsCount,
      categories: categoriesCount,
    };
  } catch (error) {
    console.error('Error in getGlobalStats:', error);
    throw new StatsServiceError(
      'Failed to retrieve global statistics',
      'GET_GLOBAL_STATS_ERROR',
    );
  }
};

export const getLocationCountByFilters = async (filters: {
  city?: string;
  category?: string;
}) => {
  try {
    const where: any = {
      published: DEFAULT_PUBLISHED_STATUS,
      deletedAt: null,
    };

    if (filters.city) {
      where.city = {
        slug: {
          mode: 'insensitive',
          contains: filters.city,
        },
      };
    }

    if (filters.category) {
      where.category = {
        slug: {
          mode: 'insensitive',
          contains: filters.category,
        },
      };
    }

    const count = await prisma.location.count({ where });

    return count;
  } catch (error) {
    console.error('Error in getLocationCountByFilters:', error);
    throw new StatsServiceError(
      'Failed to retrieve location count',
      'GET_LOCATION_COUNT_ERROR',
    );
  }
};
