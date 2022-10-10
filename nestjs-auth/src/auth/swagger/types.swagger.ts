import { ApiProperty } from '@nestjs/swagger'

export class MessageSwagger {
  @ApiProperty({ description: 'Mensagem' })
  message: string
}
