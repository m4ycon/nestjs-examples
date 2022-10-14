## Description

This is a template to use for creating a new project.

**OBS: If you see something wrong, missunderstood or something that could be improved, please open an issue or a pull request.**

## Usage

You can use it as it is, you need to do:
- Copy this folder and put it wherever you want;
- Change the name of the folder to the name of your project;
- Change the name of the project in the `package.json` file;
- Run `git init` to start a new git repository inside of this folder;
- lint-staged and husky have been configured to use a `.git` outside the folder project, but you won't use it that way, so:
  - You need to modify the command in `.husky/pre-commit` from `"yarn --cwd ./nestjs-template lint-staged"` to `"npx lint-staged"`;
  - And modify `prepare` script in `package.json` from `"cd .. && husky install nestjs-template/.husky"` to `"husky install"`.
- It has a `.env.example` file, you need to copy it to `.env` and fill the values;
- It uses pnpm as package manager, but if you don't want to use it, you can delete the `pnpm-lock.yaml` file and run `npm install` or `yarn` instead to create a lock file and install the dependencies;
- You can commit the changes and start working on your project.


BUT, if you want to **setup this by yourself**, you can follow the steps below (it's using pnpm but you can adapt to your case).

If you navigate in `src` folder, you will see some non cited files, it doesn't have so many files so you check them out and decide if you want to use them or not (I recommend you to use them).

## eslint + prettier

NestJS default template already has eslint and prettier installed. And you can add some extra rules to make it more strict.

### Remove unused imports

Add this dependency:

```bash
$ pnpm add eslint-plugin-unused-imports -D
```

And add this to `.eslintrc.js`:

```json
"plugins": ["unused-imports"],
"rules": {
  "unused-imports/no-unused-imports": "error",
},
```

### Sort imports

If you want more details, you can check it [here](https://dev.to/julioxavierr/sorting-your-imports-with-eslint-3ped).

Add this dependency:

```bash
$ pnpm add eslint-plugin-simple-import-sort -D
```

And add this to `.eslintrc.js`:
```json
"plugins": ["simple-import-sort"],
"rules": {
  "simple-import-sort/imports": "error",
  "simple-import-sort/exports": "error"
}
```

That will do the job. But if you want to define your own order, you can add this to `.eslintrc.js` or adapt it to your needs:

```js
overrides: [
  {
    files: ["*.ts"],
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            [
              "^@.*$", // @ modules
              "^[^.].*$" // libs
            ],
            [
              "^.*\.\.\/.*$", // `../` parents folder
              "^\.\/.*\/.*$", // `./xyz/abc` imports
              "^\.\/[^/]*$", // `./main` same-folder imports
            ],
          ]
        }
      ]
    }
  }
],
```

Result example:
```ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Response } from 'express'

import { CookieUtils } from '../common/utils'
import { UsersService } from '../users/users.service'
import { SignInDto, SignUpDto } from './dto'
import { AuthServiceInterface } from './interfaces'
import { TokenPayload, Tokens } from './types'
```

Some additional rules, personal preferences, but I recommend to use at least the LF ones:

```json
// .eslintrc.js
"semi": ["error", "never"], // I don't like semicolons =)
"arrow-parens": ["error", "as-needed"], // prefer a => b over (a) => b
"no-else-return": "error", // prefer return early over else
"curly": ["error", "multi", "consistent"], // one-liners over curly braces
"linebreak-style": ["error", "unix"], // enforce LF linebreaks

// .prettierrc
"singleQuote": true, // default
"trailingComma": "all", // default
"semi": false, // to not conflict with eslint
"arrowParens": "avoid", // to not conflict with eslint
"endOfLine": "lf", // enforce consistent line endings
```

## lint-staged + husky

To make sure that your code is always clean and consistent, you can add lint-staged and husky to your project.

Follow these instructions:

```bash
$ pnpm add lint-staged husky -D
# add prepare script in package.json (it's deprecated but works)
$ npm set-script prepare "husky install"
$ pnpm prepare
$ pnpm husky add .husky/pre-commit "npx lint-staged"
```

Now, every time you commit, it will run lint-staged, but it doesn't do nothing yet. So, let's add some instructions to it, open `package.json` and add this:

```json
  "lint-staged": {
    "prisma/schema.prisma": [
      "prisma format"
    ],
    "src/**/*.ts": [
      "pnpm format",
      "pnpm lint --max-warnings=0 --cache"
    ]
  },
```

This will run `pnpm format` and `pnpm lint` on every `.ts` staged file inside `src` folder. And it will run `prisma format` on `prisma/schema.prisma` if it's staged. And if it fails, it will not let you commit.

## Prisma

Since we are using Prisma, we need to install it and add do some initial configs.

Follow these instructions:

```bash
$ pnpm add prisma -D
$ pnpm add @prisma/client

# creates prisma.schema and .env
$ pnpm prisma init
```

Go to `.env` and fill the values with your database url.
Add some simple model to `prisma/schema.prisma`:

```prisma
model User {
  id Int @id @default(autoincrement())
}
```

Then run `pnpm prisma migrate dev` to create the database and the table.

Now you can use Prisma in your project. In this template we create a global module called `prisma`, you can check it out for more details.


## Validation

NestJS has a really good recommended validation package called class-validator and class-transformer. You can check it out [here](https://docs.nestjs.com/techniques/validation).

To use it, you need to install:

```bash
$ pnpm add class-validator class-transformer
```

And add this to `main.ts`:

```ts
...
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  ...
  app.useGlobalPipes(
    new ValidationPipe({
      /* validator will strip validated (returned) object of any 
      properties that do not use any validation decorators */
      whitelist: true,
      /* instead of stripping non-whitelisted properties 
      validator will throw an exception */
      forbidNonWhitelisted: true,
    }),
  );
  ...
}
```

## Tests

Nest already has a good bootstrap for tests, the only thing I changed is in `package.json` on where it collects coverage from (inside `jest` configs), to adapt it to my needs.

```json
"collectCoverageFrom": [
  "**/*.ts", // collect coverage from all ts files
  "!**/index.ts", // ignore barrel exports
  "!./main.ts" // ignore main.ts
],
```

To know how to write tests, you can check out the `auth module` on `nestjs-auth` example here on this repo ([controller](../nestjs-auth/src/auth/auth.controller.spec.ts), [service](../nestjs-auth/src/auth/auth.service.spec.ts)). There are some tests there that you can use as a reference. The controllers tests were inspired by [this](https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/), don't forget to install `supertest` to use it.
