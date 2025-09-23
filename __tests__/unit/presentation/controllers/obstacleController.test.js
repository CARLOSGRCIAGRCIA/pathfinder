import ObstacleController from "../../../../src/presentation/controllers/obstacleController.js";
import { AppError } from "../../../../src/business/utils/errorUtils.js";
import { Either } from "../../../../src/business/utils/either/Either.js";

describe("ObstacleController", () => {
  let mockObstacleService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockObstacleService = {
      createObstacles: jest.fn(),
      getObstaclesByMapId: jest.fn(),
      updateObstacle: jest.fn(),
      deleteObstacle: jest.fn()
    };

    mockReq = {
      params: {
        mapId: "map123",
        obstacleId: "obstacle123"
      },
      body: {
        type: "wall",
        coordinates: { x: 10, y: 20 },
        dimensions: { width: 5, height: 10 }
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe("createObstacle", () => {
    it("should create a single obstacle successfully", async () => {
      const mockObstacle = {
        id: "obstacle123",
        ...mockReq.body
      };
      mockObstacleService.createObstacles.mockResolvedValue(
        Either.right([mockObstacle])
      );

      await ObstacleController.createObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockObstacleService.createObstacles).toHaveBeenCalledWith(
        "map123",
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith([mockObstacle]);
    });

    it("should create multiple obstacles successfully", async () => {
      const mockObstacles = [
        { id: "obstacle1", ...mockReq.body },
        { id: "obstacle2", ...mockReq.body }
      ];
      mockObstacleService.createObstacles.mockResolvedValue(
        Either.right(mockObstacles)
      );

      mockReq.body = mockObstacles;

      await ObstacleController.createObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockObstacleService.createObstacles).toHaveBeenCalledWith(
        "map123",
        mockObstacles
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockObstacles);
    });

    it("should handle validation errors during creation", async () => {
      const error = new AppError("Invalid obstacle data", 400);
      mockObstacleService.createObstacles.mockResolvedValue(Either.left(error));

      await ObstacleController.createObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  describe("getObstacles", () => {
    it("should get obstacles successfully", async () => {
      const mockObstacles = [
        { id: "obstacle123", type: "wall", coordinates: { x: 10, y: 20 } },
        { id: "obstacle456", type: "barrier", coordinates: { x: 30, y: 40 } }
      ];
      mockObstacleService.getObstaclesByMapId.mockResolvedValue(
        Either.right(mockObstacles)
      );

      await ObstacleController.getObstacles(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockObstacleService.getObstaclesByMapId).toHaveBeenCalledWith(
        "map123"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockObstacles);
    });

    it("should handle empty obstacles list", async () => {
      mockObstacleService.getObstaclesByMapId.mockResolvedValue(
        Either.right([])
      );

      await ObstacleController.getObstacles(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it("should handle map not found when getting obstacles", async () => {
      const error = new AppError("Map not found", 404);
      mockObstacleService.getObstaclesByMapId.mockResolvedValue(
        Either.left(error)
      );

      await ObstacleController.getObstacles(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateObstacle", () => {
    it("should update obstacle successfully", async () => {
      const updatedObstacle = {
        id: "obstacle123",
        type: "wall",
        coordinates: { x: 15, y: 25 },
        dimensions: { width: 6, height: 12 }
      };
      mockObstacleService.updateObstacle.mockResolvedValue(
        Either.right(updatedObstacle)
      );

      await ObstacleController.updateObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockObstacleService.updateObstacle).toHaveBeenCalledWith(
        "obstacle123",
        mockReq.body
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedObstacle);
    });

    it("should handle validation errors during update", async () => {
      const error = new AppError("Invalid update data", 400);
      mockObstacleService.updateObstacle.mockResolvedValue(Either.left(error));

      await ObstacleController.updateObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle obstacle not found during update", async () => {
      const error = new AppError("Obstacle not found", 404);
      mockObstacleService.updateObstacle.mockResolvedValue(Either.left(error));

      await ObstacleController.updateObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteObstacle", () => {
    it("should delete obstacle successfully", async () => {
      mockObstacleService.deleteObstacle.mockResolvedValue(Either.right());

      await ObstacleController.deleteObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockObstacleService.deleteObstacle).toHaveBeenCalledWith(
        "obstacle123"
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith(null);
    });

    it("should handle obstacle not found during deletion", async () => {
      const error = new AppError("Obstacle not found", 404);
      mockObstacleService.deleteObstacle.mockResolvedValue(Either.left(error));

      await ObstacleController.deleteObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle unauthorized deletion attempt", async () => {
      const error = new AppError("Unauthorized to delete obstacle", 403);
      mockObstacleService.deleteObstacle.mockResolvedValue(Either.left(error));

      await ObstacleController.deleteObstacle(mockObstacleService)(
        mockReq,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
