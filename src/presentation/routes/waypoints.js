import express from 'express';
import { validate, validateWaypoints, waypointValidation, validateIdFormat, validateIdExistence } from '../../business/utils/validationUtils.js';
import WaypointController from '../controllers/waypointController.js';
import WaypointService from '../../business/services/waypointService.js';
import WaypointRepository from '../../data/repositories/waypointRepository.js';
import { auth } from '../middleware/auth.js';
import Map from '../../data/models/Map.js';
import Waypoint from '../../data/models/Waypoint.js';

const router = express.Router();
const waypointRepository = WaypointRepository;
const waypointService = WaypointService;

const mapIdValidator = validateIdFormat('mapId', 'Invalid map ID format');
const waypointIdValidator = validateIdFormat('waypointId', 'Invalid waypoint ID format');

const mapExistenceValidation = validateIdExistence('mapId', Map, 'Map ID does not exist');
const waypointExistenceValidation = validateIdExistence('waypointId', Waypoint, 'Waypoint ID does not exist');

router.post(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation, ...waypointValidation]),
  WaypointController.createWaypoint(waypointService)
);

router.get(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation]),
  WaypointController.getWaypoints(waypointService)
);

router.put(
  '/:mapId/:waypointId',
  auth,
  validate([mapIdValidator, waypointIdValidator, mapExistenceValidation, waypointExistenceValidation, ...validateWaypoints]),
  WaypointController.updateWaypoint(waypointService)
);

router.delete(
  '/:mapId/:waypointId',
  auth,
  validate([mapIdValidator, waypointIdValidator, mapExistenceValidation, waypointExistenceValidation]),
  WaypointController.deleteWaypoint(waypointService)
);

export default router;