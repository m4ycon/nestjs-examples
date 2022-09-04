import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super()
  }

  serializeUser(user: any, done: (err: Error, user: any) => void) {
    // user come from LocalStrategy's validate
    // this info can be used on payload of deserializeUser
    done(null, { id: user.id })
  }

  async deserializeUser(
    payload: { id: number },
    done: (err: Error, payload: any) => void,
  ) {
    // recommended to do this here because user can update its info
    // and it will be outdated if done in serializeUser (which could be cheaper)
    const user = await this.usersService.findOne(payload.id)

    // this info will be in request.user
    done(null, { id: user.id, email: user.email })
  }
}
