import { Request, Response } from 'express';
import * as StatsService from '../services/stats-service';
import { handleError, sendSuccess } from '../utils/controller-utils';

const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await StatsService.getGlobalStats();
    sendSuccess(res, stats);
  } catch (error) {
    handleError(res, error);
  }
};

export default getStats;
