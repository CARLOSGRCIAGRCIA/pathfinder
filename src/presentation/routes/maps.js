import express from 'express';
import MapController from '../controllers/mapController.js';
import MapService from '../../business/services/mapService.js';
import MapRepository from '../../data/repositories/mapRepository.js';
import NameSearchStrategy from '../../business/strategies/NameSearchStrategy.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const mapRepository = MapRepository;
const searchStrategy = NameSearchStrategy;
const mapService = MapService(mapRepository, searchStrategy);

router.get('/', auth, MapController.getAllMaps(mapService));
router.post('/', auth, MapController.createMap(mapService));
router.get('/:mapId', auth, MapController.getMap(mapService));
router.put('/:mapId', auth, MapController.updateMap(mapService));
router.delete('/:mapId', auth, MapController.deleteMap(mapService));

export default router;