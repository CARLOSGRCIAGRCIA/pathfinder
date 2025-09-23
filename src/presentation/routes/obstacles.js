import express from 'express';
import { validate, validateObstacle, obstacleValidation, validateIdFormat, validateIdExistence } from '../../business/utils/validationUtils.js';
import ObstacleController from '../controllers/obstacleController.js';
import ObstacleService from '../../business/services/obstacleService.js';
import ObstacleRepository from '../../data/repositories/obstacleRepository.js';
import { auth } from '../middleware/auth.js';
import Map from '../../data/models/Map.js';
import Obstacle from '../../data/models/Obstacle.js';

const router = express.Router();
const obstacleRepository = ObstacleRepository;
const obstacleService = ObstacleService;

const mapIdValidator = validateIdFormat('mapId', 'Invalid map ID format');
const obstacleIdValidator = validateIdFormat('obstacleId', 'Invalid obstacle ID format');

const mapExistenceValidation = validateIdExistence('mapId', Map, 'Map ID does not exist');
const obstacleExistenceValidation = validateIdExistence('obstacleId', Obstacle, 'Obstacle ID does not exist');

router.post(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation, ...obstacleValidation]),
  ObstacleController.createObstacle(obstacleService)
);

router.get(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation]),
  ObstacleController.getObstacles(obstacleService)
);

router.put(
  '/:mapId/:obstacleId',
  auth,
  validate([mapIdValidator, obstacleIdValidator, mapExistenceValidation, obstacleExistenceValidation, ...validateObstacle]),
  ObstacleController.updateObstacle(obstacleService)
);

router.delete(
  '/:mapId/:obstacleId',
  auth,
  validate([mapIdValidator, obstacleIdValidator, mapExistenceValidation, obstacleExistenceValidation]),
  ObstacleController.deleteObstacle(obstacleService)
);

export default router;