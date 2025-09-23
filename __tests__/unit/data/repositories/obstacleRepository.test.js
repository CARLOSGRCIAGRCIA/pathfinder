import { Either } from "../../../../src/business/utils/either/Either.js";
import { AppError } from "../../../../src/business/utils/errorUtils.js";

jest.mock("../../../../src/data/models/Obstacle.js", () => {
  const mockObstacle = {
    validateSync: jest.fn(),
    save: jest.fn()
  };

  mockObstacle.save.mockImplementation(() => Promise.resolve(mockObstacle));

  const ObstacleMock = jest.fn(() => mockObstacle);
  ObstacleMock.find = jest.fn();
  ObstacleMock.insertMany = jest.fn();
  ObstacleMock.findByIdAndUpdate = jest.fn();
  ObstacleMock.findByIdAndDelete = jest.fn();

  return ObstacleMock;
});

import ObstacleRepository from "../../../../src/data/repositories/obstacleRepository.js";
import Obstacle from "../../../../src/data/models/Obstacle.js";

describe("ObstacleRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create method", () => {
    it("should create a new obstacle successfully", async () => {
      const obstacleData = { name: "Rock", map: "map123" };
      const savedObstacle = { ...obstacleData, _id: "obstacle123" };

      const mockInstance = Obstacle();
      mockInstance.validateSync.mockReturnValue(null);
      mockInstance.save.mockResolvedValue(savedObstacle);

      const result = await ObstacleRepository.create(obstacleData);

      expect(Obstacle).toHaveBeenCalledWith(obstacleData);
      expect(mockInstance.validateSync).toHaveBeenCalled();
      expect(mockInstance.save).toHaveBeenCalled();
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        success => expect(success).toEqual(savedObstacle)
      );
    });

    it("should return validation error when obstacle data is invalid", async () => {
      const obstacleData = {};
      const validationError = { message: "Validation failed" };

      const mockInstance = Obstacle();
      mockInstance.validateSync.mockReturnValue(validationError);

      const result = await ObstacleRepository.create(obstacleData);

      expect(Obstacle).toHaveBeenCalledWith(obstacleData);
      expect(mockInstance.validateSync).toHaveBeenCalled();
      expect(mockInstance.save).not.toHaveBeenCalled();
      result.fold(
        error => expect(error).toEqual(validationError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });

    it("should handle database errors during save", async () => {
      const obstacleData = { name: "Rock", map: "map123" };
      const dbError = new Error("Database connection failed");

      const mockInstance = Obstacle();
      mockInstance.validateSync.mockReturnValue(null);
      mockInstance.save.mockRejectedValue(dbError);

      const result = await ObstacleRepository.create(obstacleData);

      expect(mockInstance.validateSync).toHaveBeenCalled();
      expect(mockInstance.save).toHaveBeenCalled();
      result.fold(
        error => expect(error).toEqual(dbError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });
  });

  describe("createMultiple method", () => {
    it("should create multiple obstacles successfully", async () => {
      const obstaclesData = [
        { name: "Rock", map: "map123" },
        { name: "Tree", map: "map123" }
      ];
      const savedObstacles = [
        { ...obstaclesData[0], _id: "obstacle1" },
        { ...obstaclesData[1], _id: "obstacle2" }
      ];

      Obstacle.insertMany.mockResolvedValue(savedObstacles);

      const result = await ObstacleRepository.createMultiple(obstaclesData);

      expect(Obstacle.insertMany).toHaveBeenCalledWith(obstaclesData, {
        rawResult: false
      });
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        success => expect(success).toEqual(savedObstacles)
      );
    });

    it("should handle database errors during insertMany", async () => {
      const obstaclesData = [
        { name: "Rock", map: "map123" },
        { name: "Tree", map: "map123" }
      ];
      const dbError = new Error("Database connection failed");

      Obstacle.insertMany.mockRejectedValue(dbError);

      const result = await ObstacleRepository.createMultiple(obstaclesData);

      expect(Obstacle.insertMany).toHaveBeenCalledWith(obstaclesData, {
        rawResult: false
      });
      result.fold(
        error => expect(error).toEqual(dbError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });
  });

  describe("findByMapId method", () => {
    it("should find obstacles by map ID successfully", async () => {
      const mapId = "map123";
      const obstacles = [
        { _id: "obstacle1", name: "Rock", map: mapId },
        { _id: "obstacle2", name: "Tree", map: mapId }
      ];

      Obstacle.find.mockResolvedValue(obstacles);

      const result = await ObstacleRepository.findByMapId(mapId);

      expect(Obstacle.find).toHaveBeenCalledWith({ map: mapId });
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        success => expect(success).toEqual(obstacles)
      );
    });

    it("should handle database errors during find", async () => {
      const mapId = "map123";
      const dbError = new Error("Database query failed");

      Obstacle.find.mockRejectedValue(dbError);

      const result = await ObstacleRepository.findByMapId(mapId);

      expect(Obstacle.find).toHaveBeenCalledWith({ map: mapId });
      result.fold(
        error => expect(error).toEqual(dbError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });
  });

  describe("update method", () => {
    it("should update an obstacle successfully", async () => {
      const obstacleId = "obstacle123";
      const updateData = { name: "Boulder" };
      const updatedObstacle = {
        _id: obstacleId,
        name: "Boulder",
        map: "map123"
      };
  
      Obstacle.findByIdAndUpdate.mockResolvedValue(updatedObstacle);
  
      const result = await ObstacleRepository.update(obstacleId, updateData);
  
      expect(Obstacle.findByIdAndUpdate).toHaveBeenCalledWith(
        obstacleId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        success => expect(success).toEqual(updatedObstacle)
      );
    });
  
    it("should return not found error when obstacle does not exist", async () => {
      const obstacleId = "nonexistentId";
      const updateData = { name: "Boulder" };
      const notFoundError = AppError("Obstacle not found", 404);
  
      Obstacle.findByIdAndUpdate.mockResolvedValue(null);
  
      const result = await ObstacleRepository.update(obstacleId, updateData);
  
      expect(Obstacle.findByIdAndUpdate).toHaveBeenCalledWith(
        obstacleId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      result.fold(
        error => expect(error).toEqual(notFoundError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });
  
    it("should handle database errors during update", async () => {
      const obstacleId = "obstacle123";
      const updateData = { name: "Boulder" };
      const dbError = new Error("Database update failed");
  
      Obstacle.findByIdAndUpdate.mockRejectedValue(dbError);
  
      const result = await ObstacleRepository.update(obstacleId, updateData);
  
      expect(Obstacle.findByIdAndUpdate).toHaveBeenCalledWith(
        obstacleId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      result.fold(
        error => expect(error).toEqual(dbError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });
  });

  describe("delete method", () => {
    it("should delete an obstacle successfully", async () => {
      const obstacleId = "obstacle123";
      const deletedObstacle = { _id: obstacleId, name: "Rock", map: "map123" };

      Obstacle.findByIdAndDelete.mockResolvedValue(deletedObstacle);

      const result = await ObstacleRepository.delete(obstacleId);

      expect(Obstacle.findByIdAndDelete).toHaveBeenCalledWith(obstacleId);
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        success => expect(success).toEqual(deletedObstacle)
      );
    });

    it("should return not found error when obstacle does not exist", async () => {
      const obstacleId = "nonexistentId";
      const notFoundError = AppError("Obstacle not found", 404);

      Obstacle.findByIdAndDelete.mockResolvedValue(null);

      const result = await ObstacleRepository.delete(obstacleId);

      expect(Obstacle.findByIdAndDelete).toHaveBeenCalledWith(obstacleId);
      result.fold(
        error => expect(error).toEqual(notFoundError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });

    it("should handle database errors during delete", async () => {
      const obstacleId = "obstacle123";
      const dbError = new Error("Database delete failed");

      Obstacle.findByIdAndDelete.mockRejectedValue(dbError);

      const result = await ObstacleRepository.delete(obstacleId);

      expect(Obstacle.findByIdAndDelete).toHaveBeenCalledWith(obstacleId);
      result.fold(
        error => expect(error).toEqual(dbError),
        success => fail(`Expected error but got success: ${success}`)
      );
    });
  });
});
