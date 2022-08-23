```bash
$ pnpm add prisma -D
$ pnpm prisma init

# configura .env com as credenciais do banco
# cria model de user
$ pnpm prisma migrate dev --name addUser
$ pnpm prisma generate
$ pnpm add @prisma/client

```