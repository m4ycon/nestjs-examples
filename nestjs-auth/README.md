```bash
$ pnpm add prisma -D
$ pnpm prisma init

# configura .env com as credenciais do banco
# cria model de user
$ pnpm prisma migrate dev --name addUser
$ pnpm prisma generate
$ pnpm add @prisma/client

# cria e coloca oque precisa no service do prisma
$ nest g module prisma
$ nest g service prisma

# cria módulo de users
$ nest g resource users
# modifica entity e dto's
# importa módulo do prisma e cria CRUD com prisma no service

```