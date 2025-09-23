import WaypointRepository from '../../../../src/data/repositories/waypointRepository';
import Waypoint from '../../../../src/data/models/Waypoint';
import { Either } from '../../../../src/business/utils/either/Either';

jest.mock('../../../../src/data/models/Waypoint', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            save: jest.fn(),
            validateSync: jest.fn().mockReturnValue(null)
        })),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    };
});

describe('WaypointRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a waypoint successfully', async () => {
            const waypointData = { name: 'Test Point', position: { x: 1, y: 1 } };
            const savedWaypoint = { ...waypointData, _id: 'waypoint123' };
            
            const mockSave = jest.fn().mockResolvedValue(savedWaypoint);
            Waypoint.mockImplementation(() => ({
                save: mockSave,
                validateSync: jest.fn().mockReturnValue(null)
            }));
            
            const result = await WaypointRepository.create(waypointData);
            
            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(savedWaypoint);
            expect(mockSave).toHaveBeenCalled();
        });

        it('should return left on creation error', async () => {
            const waypointData = { name: 'Test Point', position: { x: 1, y: 1 } };
            const error = new Error('Creation error');
            
            const mockSave = jest.fn().mockRejectedValue(error);
            Waypoint.mockImplementation(() => ({
                save: mockSave,
                validateSync: jest.fn().mockReturnValue(null)
            }));
            
            const result = await WaypointRepository.create(waypointData);
            
            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(error);
        });
    });

    describe('findByMapId', () => {
        it('should find waypoints by map id successfully', async () => {
            const mockWaypoints = [
                { _id: '1', name: 'Waypoint 1', position: { x: 1, y: 1 }, map: 'mapId' },
                { _id: '2', name: 'Waypoint 2', position: { x: 2, y: 2 }, map: 'mapId' }
            ];
            
            Waypoint.find = jest.fn().mockResolvedValue(mockWaypoints);
            
            const result = await WaypointRepository.findByMapId('mapId');
            
            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(mockWaypoints);
        });

        it('should return left on find error', async () => {
            const error = new Error('Find error');
            
            Waypoint.find = jest.fn().mockRejectedValue(error);
            
            const result = await WaypointRepository.findByMapId('mapId');
            
            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(error);
        });
    });

    describe('update', () => {
        it('should update waypoint successfully', async () => {
            const mockUpdatedWaypoint = { 
                _id: 'mockId', 
                name: 'Updated Waypoint',
                position: { x: 2, y: 2 }
            };
            
            Waypoint.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedWaypoint);
            
            const result = await WaypointRepository.update('mockId', { 
                name: 'Updated Waypoint',
                position: { x: 2, y: 2 }
            });
            
            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(mockUpdatedWaypoint);
        });

        it('should return left when waypoint not found for update', async () => {
            Waypoint.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            
            const result = await WaypointRepository.update('nonexistentId', {
                name: 'Updated Waypoint'
            });
            
            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error.message,
                value => value
            )).toBe('Waypoint not found');
        });

        it('should return left on update error', async () => {
            const error = new Error('Update error');
            
            Waypoint.findByIdAndUpdate = jest.fn().mockRejectedValue(error);
            
            const result = await WaypointRepository.update('mockId', {});
            
            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(error);
        });
    });

    describe('delete', () => {
        it('should delete waypoint successfully', async () => {
            const mockDeletedWaypoint = { _id: 'mockId', name: 'Test Waypoint' };
            
            Waypoint.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedWaypoint);
            
            const result = await WaypointRepository.delete('mockId');
            
            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(mockDeletedWaypoint);
        });

        it('should return left when waypoint not found for deletion', async () => {
            Waypoint.findByIdAndDelete = jest.fn().mockResolvedValue(null);
            
            const result = await WaypointRepository.delete('nonexistentId');
            
            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error.message,
                value => value
            )).toBe('Waypoint not found');
        });

        it('should return left on delete error', async () => {
            const error = new Error('Delete error');
            
            Waypoint.findByIdAndDelete = jest.fn().mockRejectedValue(error);
            
            const result = await WaypointRepository.delete('mockId');
            
            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(error);
        });
    });
});