import { Router, Request, Response } from 'express';
import * as CityController from '../controllers/cityController';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
    return await CityController.getCity(req, res);
});

router.get('/', async (req: Request, res: Response) => {
    return await CityController.getCities(req, res);
});

router.post('/', async (req: Request, res: Response) => {
    return await CityController.createCity(req, res);
});

router.put('/:id', async (req: Request, res: Response) => {
    return await CityController.updateCity(req, res);
});

router.delete('/:id', async (req: Request, res: Response) => {
    return await CityController.deleteCity(req, res);
});

export default router;