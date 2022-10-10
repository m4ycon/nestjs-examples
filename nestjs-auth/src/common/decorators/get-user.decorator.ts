import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Get the user from the request
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    return data ? request.user[data] : request.user
  },
)
