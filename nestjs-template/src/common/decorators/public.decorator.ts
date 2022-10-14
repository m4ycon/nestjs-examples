import { SetMetadata } from '@nestjs/common'

/**
 * Set the route as public, it must be checked in the guard
 */
export const Public = () => SetMetadata('isPublic', true)
