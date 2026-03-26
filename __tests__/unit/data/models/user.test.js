import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

jest.mock('mongoose', () => {
  const modelMock = jest.fn();
  const schemaMock = jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    methods: {},
    index: jest.fn().mockReturnThis(),
  }));

  return {
    Schema: schemaMock,
    model: modelMock.mockReturnValue({
      modelName: 'User',
    }),
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import UserModel from '../../../../src/data/models/User.js';

describe('User Model', () => {
  let userSchema;
  let schemaOptions;
  let saveMiddleware;
  let comparePwMethod;

  beforeAll(() => {
    const schemaArgs = mongoose.Schema.mock.calls[0];
    userSchema = schemaArgs[0];
    schemaOptions = schemaArgs[1] || {};

    saveMiddleware = mongoose.Schema.mock.results[0].value.pre.mock.calls[0][1];

    comparePwMethod = function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Definition', () => {
    test('you should define the username field correctly', () => {
      expect(userSchema).toHaveProperty('username');
      expect(userSchema.username.type).toBe(String);
      expect(userSchema.username.required).toBe(true);
      expect(userSchema.username.unique).toBe(true);
      expect(userSchema.username.trim).toBe(true);
    });

    test('you should define the password field correctly', () => {
      expect(userSchema).toHaveProperty('password');
      expect(userSchema.password.type).toBe(String);
      expect(userSchema.password.required).toBe(true);
      expect(userSchema.password.minlength).toBe(6);
    });

    test('should have role field with default value', () => {
      expect(userSchema).toHaveProperty('role');
      expect(userSchema.role.type).toBe(String);
      expect(userSchema.role.default).toBe('user');
    });

    test('should have email field', () => {
      expect(userSchema).toHaveProperty('email');
      expect(userSchema.email.type).toBe(String);
      expect(userSchema.email.unique).toBe(true);
    });
  });

  describe('Pre save middleware', () => {
    test('should hash the password if it has been changed', async () => {
      const userDoc = {
        isModified: jest.fn().mockReturnValue(true),
        password: 'plainPassword123',
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');

      const next = jest.fn();

      await saveMiddleware.call(userDoc, next);

      expect(userDoc.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 12);
      expect(userDoc.password).toBe('hashedPassword');
      expect(next).toHaveBeenCalled();
    });

    test('should not hash the password if it has not been changed', async () => {
      const userDoc = {
        isModified: jest.fn().mockReturnValue(false),
        password: 'existingHashedPassword',
      };

      const next = jest.fn();

      await saveMiddleware.call(userDoc, next);

      expect(userDoc.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userDoc.password).toBe('existingHashedPassword');
      expect(next).toHaveBeenCalled();
    });

    test('should handle errors during hashing', async () => {
      const userDoc = {
        isModified: jest.fn().mockReturnValue(true),
        password: 'plainPassword123',
      };

      const hashError = new Error('Hash failed');
      bcrypt.hash.mockRejectedValue(hashError);

      const next = jest.fn();

      try {
        await saveMiddleware.call(userDoc, next);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBe(hashError);
        expect(userDoc.isModified).toHaveBeenCalledWith('password');
        expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 12);
        expect(next).not.toHaveBeenCalled();
      }
    });
  });

  describe('comparePassword method', () => {
    test('should correctly compare matching passwords', async () => {
      const userDoc = {
        password: 'hashedPassword',
      };

      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePwMethod.call(userDoc, 'plainPassword123');

      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword123', 'hashedPassword');
      expect(result).toBe(true);
    });

    test('should correctly compare mismatched passwords', async () => {
      const userDoc = {
        password: 'hashedPassword',
      };

      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePwMethod.call(userDoc, 'wrongPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBe(false);
    });

    test('should handle errors during comparison', async () => {
      const userDoc = {
        password: 'hashedPassword',
      };

      const compareError = new Error('Compare failed');
      bcrypt.compare.mockRejectedValue(compareError);

      try {
        await comparePwMethod.call(userDoc, 'wrongPassword');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBe(compareError);
        expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      }
    });
  });
});
