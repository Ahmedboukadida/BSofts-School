import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockPrisma: any;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    mockPrisma = {
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'sys-log-1' }),
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/test-route',
      method: 'POST',
      ip: '10.0.0.1',
      headers: {},
      user: { id: 'test-user-1' },
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter = new AllExceptionsFilter(mockPrisma);
  });

  it('should capture 4xx client errors and persist them to SystemLog with level WARN', async () => {
    const exception = new BadRequestException('Invalid credentials or input data');

    await filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.systemLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        level: 'WARN',
        message: 'Invalid credentials or input data',
        statusCode: 400,
        path: '/api/test-route',
        method: 'POST',
        userId: 'test-user-1',
        ipAddress: '10.0.0.1',
      }),
    });
  });

  it('should capture 5xx server errors and persist them to SystemLog with level ERROR', async () => {
    const exception = new InternalServerErrorException('Database connection failed');

    await filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockPrisma.systemLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        level: 'ERROR',
        message: 'Database connection failed',
        statusCode: 500,
        path: '/api/test-route',
        method: 'POST',
      }),
    });
  });
});
