import { Router, Request, Response } from 'express';
import * as CityController from '../controllers/cityController';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
    await CityController.getCity(req, res);
});

router.get('/', async (req: Request, res: Response) => {
    await CityController.getCities(req, res);
});


export default router;