import { ApiResponse } from '@nestjs/swagger'

export const StatusesSwagger = {
  BadRequest: ApiResponse({
    status: 400,
    description: 'Algo deu errado',
  }),

  Unauthorized: ApiResponse({
    status: 401,
    description: 'Não autorizado',
  }),

  Forbidden: ApiResponse({
    status: 403,
    description: 'Sem permissão',
  }),

  NotFound: ApiResponse({
    status: 404,
    description: 'Não encontrado',
  }),

  NotAcceptable: ApiResponse({
    status: 406,
    description: 'Não aceito',
  }),

  PayloadTooLarge: ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
  }),
}
