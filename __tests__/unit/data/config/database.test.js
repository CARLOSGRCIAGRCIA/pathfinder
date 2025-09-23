import mongoose from 'mongoose';
import { connectToDatabase } from '../../../../src/data/config/database.js';
import environment from '../../../../src/data/config/environment';

jest.mock('mongoose');

describe('connectToDatabase', () => {
    let exitMock;

    beforeEach(() => {
        jest.clearAllMocks();
        exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
    });

    afterEach(() => {
        exitMock.mockRestore(); 
    });

    it('should connect to MongoDB successfully', async () => {
        mongoose.connect.mockResolvedValueOnce();

        await connectToDatabase();

        expect(mongoose.connect).toHaveBeenCalledWith(environment.MONGODB_URI);
        expect(exitMock).not.toHaveBeenCalled();
    });

    it('should handle connection error', async () => {
        const mockError = new Error('Connection failed');
        
        mongoose.connect.mockRejectedValueOnce(mockError);

        await expect(connectToDatabase()).rejects.toThrow('Connection failed');

        expect(exitMock).toHaveBeenCalledWith(1);
    });
});
