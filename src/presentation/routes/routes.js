import express from "express";
import {
  validate,
  validateIdFormat,
  validateStoppingPoints,
  checkReachability,
  validateComplexGeometry,
  validateAllRoutes,
  validateOptimalRoute,
  validateInput,
  validateLargeMap,
} from "../../business/utils/validationUtils.js";
import RouteController from "../controllers/routeController.js";
import createRouteService from "../../business/services/routeService.js";
import RouteRepository from "../../data/repositories/routeRepository.js";
import MapRepository from "../../data/repositories/mapRepository.js";
import ObstacleRepository from "../../data/repositories/obstacleRepository.js";
import WaypointRepository from "../../data/repositories/waypointRepository.js";
import { auth } from "../middleware/auth.js";
import { injectUserId } from "../middleware/injectUserId.js";

const router = express.Router();

const routeRepository = RouteRepository;
const mapRepository = MapRepository;
const obstacleRepository = ObstacleRepository;
const waypointRepository = WaypointRepository;

const routeService = createRouteService(
  routeRepository,
  mapRepository,
  obstacleRepository,
  waypointRepository
);

router.post(
  "/validateMap/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await validateStoppingPoints(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/checkReachability/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await checkReachability(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/validateComplexGeometry/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await validateComplexGeometry(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/validateAllRoutes/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await validateAllRoutes(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/validateOptimalRoute/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await validateOptimalRoute(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/validateInput/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await validateInput(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/validateLargeMap/:mapId",
  validate([validateIdFormat("mapId")]),
  async (req, res) => {
    const result = await validateLargeMap(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

router.post(
  "/:mapId",
  auth,
  injectUserId(),
  validate([validateIdFormat("mapId")]),
  RouteController.findOptimalRoute(routeService)
);

// Nuevo endpoint para obtener rutas por mapId
router.get(
  "/map/:mapId", 
  auth, 
  validate([validateIdFormat("mapId")]),
  RouteController.getRoutesByMapId(routeService)
);

// Mantener endpoints existentes
router.get("/", auth, RouteController.getAllRoutes(routeService));
router.get("/:routeId", auth, RouteController.getRoute(routeService));
router.delete("/:routeId", auth, RouteController.deleteRoute(routeService));

export default router;