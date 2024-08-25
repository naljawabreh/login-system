import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = ['Internal server error'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = [exceptionResponse];
      } else if (typeof exceptionResponse === 'object' && exceptionResponse.hasOwnProperty('message')) {
        const exceptionResponseMessage = (exceptionResponse as { message?: any }).message;
        
        if (Array.isArray(exceptionResponseMessage)) {
          message = exceptionResponseMessage;
        } else {
          message = [exceptionResponseMessage];
        }
      } else {
        message = ['Unexpected error occurred'];
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
