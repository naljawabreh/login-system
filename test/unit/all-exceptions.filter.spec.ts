import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from 'src/exceptions/all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('should catch HttpException and return a proper response', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({ url: '/test' });

    const host: ArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockGetResponse).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      timestamp: expect.any(String),
      path: '/test',
      message: ['Forbidden'],
    });
  });

  it('should handle non-HTTP exceptions and return a generic error response', () => {
    const exception = new Error('Unexpected error');
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({ url: '/test' });

    const host: ArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockGetResponse).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: '/test',
      message: ['Internal server error'],
    });
  });
});
