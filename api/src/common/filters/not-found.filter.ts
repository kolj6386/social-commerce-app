import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common'
import type { Response } from 'express'
import { ApiResponse } from '../api-response'

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    response.status(404).json(
      new ApiResponse({
        success: false,
        message: exception.message || 'Route not found',
        // TODO: throw back some nice HTML to display here.
        // optional: data: { path: request.url, method: request.method },
      }),
    )
  }
}
