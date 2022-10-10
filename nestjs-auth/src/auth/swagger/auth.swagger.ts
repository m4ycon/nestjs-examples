import { applyDecorators } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { StatusesSwagger } from '../../common/swagger'
import { MessageSwagger } from './types.swagger'

export const AuthSwagger = {
  controller: () => applyDecorators(ApiTags('Módulo de autenticação')),
  signup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Cadastra um novo usuário e adiciona os tokens nos cookies',
      }),
      ApiResponse({
        status: 201,
        description: 'Usuário cadastrado com sucesso',
        type: MessageSwagger,
      }),
      StatusesSwagger.BadRequest,
    ),
  signin: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Autentica um usuário e adiciona os tokens nos cookies',
      }),
      ApiResponse({
        status: 200,
        description: 'Usuário autenticado com sucesso',
        type: MessageSwagger,
      }),
      StatusesSwagger.Unauthorized,
    ),
  signout: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Desloga um usuário e remove os tokens dos cookies',
      }),
      ApiCookieAuth(),
      ApiResponse({
        status: 200,
        description: 'Usuário deslogado com sucesso',
        type: MessageSwagger,
      }),
      StatusesSwagger.Unauthorized,
    ),
  refresh: () =>
    applyDecorators(
      ApiCookieAuth(),
      ApiOperation({
        summary: 'Atualiza os tokens de um usuário',
      }),
      ApiResponse({
        status: 200,
        description: 'Tokens atualizados com sucesso',
        type: MessageSwagger,
      }),
      StatusesSwagger.Unauthorized,
    ),
}
