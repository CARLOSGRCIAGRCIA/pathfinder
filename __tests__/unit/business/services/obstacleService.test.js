import { createObstacleService } from "../../../../src/business/services/obstacleService.js";
import { Either } from "../../../../src/business/utils/either/Either.js";
import { AppError } from "../../../../src/business/utils/errorUtils.js";
import DefaultObstacleStrategy from "../../../../src/business/strategies/DefaultObstacleStrategy.js";

jest.mock("../../../../src/business/strategies/DefaultObstacleStrategy.js");

describe("ObstacleService", () => {
  let obstacleService;
  const mockMapId = "map123";
  const mockObstacleId = "obstacle123";
  const mockObstacleData = {
    name: "Test Obstacle",
    position: { x: 10, y: 20 }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    DefaultObstacleStrategy.create = jest.fn();
    DefaultObstacleStrategy.createMultiple = jest.fn();
    DefaultObstacleStrategy.findByMapId = jest.fn();
    DefaultObstacleStrategy.update = jest.fn();
    DefaultObstacleStrategy.delete = jest.fn();

    obstacleService = createObstacleService(DefaultObstacleStrategy);
  });

  describe("createObstacles", () => {
    it("should successfully create a single obstacle", async () => {
      const createdObstacle = { ...mockObstacleData, id: mockObstacleId };
      DefaultObstacleStrategy.createMultiple.mockResolvedValue(
        Either.right([createdObstacle])
      );

      const result = await obstacleService.createObstacles(
        mockMapId,
        mockObstacleData
      );

      expect(result.isRight()).toBe(true);
      expect(
        DefaultObstacleStrategy.createMultiple
      ).toHaveBeenCalledWith(mockMapId, [mockObstacleData]);
      result.fold(
        () => fail("Should not return left"),
        data => {
          expect(data).toEqual([createdObstacle]);
        }
      );
    });

    it("should successfully create multiple obstacles", async () => {
      const obstaclesData = [
        { ...mockObstacleData, id: "obstacle1" },
        { ...mockObstacleData, id: "obstacle2" }
      ];
      DefaultObstacleStrategy.createMultiple.mockResolvedValue(
        Either.right(obstaclesData)
      );

      const result = await obstacleService.createObstacles(
        mockMapId,
        obstaclesData
      );

      expect(result.isRight()).toBe(true);
      expect(DefaultObstacleStrategy.createMultiple).toHaveBeenCalledWith(
        mockMapId,
        obstaclesData
      );
      result.fold(
        () => fail("Should not return left"),
        data => {
          expect(data).toEqual(obstaclesData);
        }
      );
    });

    it("should handle creation errors", async () => {
      const errorMessage = "Database error";
      DefaultObstacleStrategy.createMultiple.mockResolvedValue(
        Either.left(new Error(errorMessage))
      );

      const result = await obstacleService.createObstacles(
        mockMapId,
        mockObstacleData
      );

      expect(result.isLeft()).toBe(true);
      result.fold(
        error => {
          expect(error.message).toBe(errorMessage);
          expect(error.statusCode).toBe(500);
        },
        () => fail("Should not return right")
      );
    });
  });

  describe("getObstaclesByMapId", () => {
    it("should successfully retrieve obstacles", async () => {
      const mockObstacles = [
        { id: "obstacle1", ...mockObstacleData },
        { id: "obstacle2", ...mockObstacleData }
      ];
      DefaultObstacleStrategy.findByMapId.mockResolvedValue(
        Either.right(mockObstacles)
      );

      const result = await obstacleService.getObstaclesByMapId(mockMapId);

      expect(result.isRight()).toBe(true);
      expect(DefaultObstacleStrategy.findByMapId).toHaveBeenCalledWith(
        mockMapId
      );
      result.fold(
        () => fail("Should not return left"),
        data => {
          expect(data).toEqual(mockObstacles);
        }
      );
    });

    it("should handle retrieval errors", async () => {
      DefaultObstacleStrategy.findByMapId.mockResolvedValue(
        Either.left(new Error("Not found"))
      );

      const result = await obstacleService.getObstaclesByMapId(mockMapId);

      expect(result.isLeft()).toBe(true);
      result.fold(
        error => {
          expect(error.message).toBe("Not found");
          expect(error.statusCode).toBe(500);
        },
        () => fail("Should not return right")
      );
    });
  });

  describe("updateObstacle", () => {
    it("should successfully update an obstacle", async () => {
      const updatedObstacle = {
        ...mockObstacleData,
        id: mockObstacleId,
        name: "Updated"
      };
      DefaultObstacleStrategy.update.mockResolvedValue(
        Either.right(updatedObstacle)
      );

      const result = await obstacleService.updateObstacle(
        mockObstacleId,
        mockObstacleData
      );

      expect(result.isRight()).toBe(true);
      expect(DefaultObstacleStrategy.update).toHaveBeenCalledWith(
        mockObstacleId,
        mockObstacleData
      );
      result.fold(
        () => fail("Should not return left"),
        data => {
          expect(data).toEqual(updatedObstacle);
        }
      );
    });

    it("should handle update errors", async () => {
      DefaultObstacleStrategy.update.mockResolvedValue(
        Either.left(new Error("Update failed"))
      );

      const result = await obstacleService.updateObstacle(
        mockObstacleId,
        mockObstacleData
      );

      expect(result.isLeft()).toBe(true);
      result.fold(
        error => {
          expect(error.message).toBe("Update failed");
          expect(error.statusCode).toBe(500);
        },
        () => fail("Should not return right")
      );
    });
  });

  describe("deleteObstacle", () => {
    it("should successfully delete an obstacle", async () => {
      DefaultObstacleStrategy.delete.mockResolvedValue(
        Either.right({ success: true })
      );

      const result = await obstacleService.deleteObstacle(mockObstacleId);

      expect(result.isRight()).toBe(true);
      expect(DefaultObstacleStrategy.delete).toHaveBeenCalledWith(
        mockObstacleId
      );
      result.fold(
        () => fail("Should not return left"),
        data => {
          expect(data).toEqual({ success: true });
        }
      );
    });

    it("should handle deletion errors", async () => {
      DefaultObstacleStrategy.delete.mockResolvedValue(
        Either.left(new Error("Delete failed"))
      );

      const result = await obstacleService.deleteObstacle(mockObstacleId);

      expect(result.isLeft()).toBe(true);
      result.fold(
        error => {
          expect(error.message).toBe("Delete failed");
          expect(error.statusCode).toBe(500);
        },
        () => fail("Should not return right")
      );
    });
  });
});
