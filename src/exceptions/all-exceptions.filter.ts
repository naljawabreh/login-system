import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    // Get exception response
    const exceptionResponse = exception.getResponse();
    let message: string[];

    if (typeof exceptionResponse === 'string') {
      // If it's a string, return it as an array
      message = [exceptionResponse];
    } else if (typeof exceptionResponse === 'object') {
      if ('message' in exceptionResponse) {
        const exceptionResponseMessage = (
          exceptionResponse as { message?: any }
        ).message;

        if (Array.isArray(exceptionResponseMessage)) {
          // If message is an array, return it as is
          message = exceptionResponseMessage;
        } else {
          // If it's not an array, wrap it in an array
          message = [exceptionResponseMessage];
        }
      } else {
        message = ['Unexpected error occurred'];
      }
    } else {
      message = ['Unexpected error occurred'];
    }

    response.status(status).json({ message });
  }
}
