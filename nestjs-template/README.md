## Description

This is a template to use for creating a new project.

**OBS: If you see something wrong, missunderstood or something that could be improved, please open an issue or a pull request.**

## Usage

You can use it as it is, you need to do:
- Copy this folder and put it wherever you want;
- Change the name of the folder to the name of your project;
- Change the name of the project in the `package.json` file;
- Run `git init` to start a new git repository inside this folder;
- lint-staged and husky have been configured to use a `.git` outside the folder project, but you won't use it that way, so:
  - You need to modify the command in `.husky/pre-commit` from `"yarn --cwd ./nestjs-template lint-staged"` to `"npx lint-staged"`;
  - And modify `prepare` script in `package.json` from `"cd .. && husky install nestjs-template/.husky"` to `"husky install"`.
- It has a `.env.example` file, you need to copy it to `.env` and fill the values;
- It uses pnpm as package manager, but if you don't want to use it, you can delete the `pnpm-lock.yaml` file and run `npm install` or `yarn` instead to create a lock file and install the dependencies;
- You can commit the changes and start working on your project.


BUT, if you want to **setup this by yourself**, you can follow the steps below (it's using pnpm but you can adapt to your case).

If you navigate in `src` folder, you will see some non cited files, it doesn't have so many files so you check them out and decide if you want to use them or not (I recommend you to use them).

## eslint + prettier

NestJS default template already has [eslint](https://eslint.org/) and [prettier](https://prettier.io/) installed. And you can add some extra rules to make it more strict.

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

I used this [reference](https://valchan.com.br/lint-staged-husky/) and added some customizations.

To make sure that your code is always clean and consistent, you can add lint-staged and husky to your project.

Follow these instructions:

```bash
$ pnpm add lint-staged husky -D
# add prepare script in package.json by cmd (it's deprecated but works)
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

Since we are using [Prisma](https://www.prisma.io/), we need to install it and add do some initial configs.

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


## CORS

To enable CORS, you need to set this inside `bootstrap` on `main.ts`:

```ts
  app.enableCors({
    origin: true, // TODO: change to your domain, this is for development
    credentials: true, // enable CORS response for requests with credentials (cookies, http authentication)
  })
```

With this you can make requests from your frontend to your backend. Remember to set the `withCredentials` option to `true` on your frontend requests, to work with cookies, if you are using `axios`.

## Tests

Nest already has a good bootstrap for tests, the only thing I customize is in `package.json`, where it collects coverage from (inside `jest` configs), to adapt it to my needs.

```json
"collectCoverageFrom": [
  "**/*.ts", // collect coverage from all ts files
  "!**/index.ts", // ignore barrel exports
  "!./main.ts" // ignore main.ts
],
```

To know how to write tests, you can check out the `auth module` on `nestjs-auth` example here on this repo ([controller](../nestjs-auth/src/auth/auth.controller.spec.ts), [service](../nestjs-auth/src/auth/auth.service.spec.ts)). There are some tests that you can use as a reference. The controllers tests were inspired by [this](https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/), don't forget to install `supertest` to use it.

### Faker

An interesting tool for generating fake data is [faker](https://fakerjs.dev/guide/), it's very useful when dealing with mocks, instead of using static/fixed inputs you can randomize it. To install it:

```bash
pnpm add @faker-js/faker -D
```

### jest-mock-extended

[jest-mock-extended](https://github.com/marchaos/jest-mock-extended) is useful to help on mocking classes, it's very useful when you have a lot of dependencies and you don't want to mock all of them one by one. To install it:

```bash
$ pnpm add jest-mock-extended -D
```

An example of how to use it:

```ts

// common way
const usersServiceMock = {
  create: jest.fn(),
  findOne: jest.fn(),
  ...
}

// jest-mock-extended way
const usersServiceMock = mock<UsersService>();
```

And it comes with very useful methods like `mockReset` to reset the mock.

**OBS**: I don't recommend to use it with PrismaService, as it's a deep dependency with many ramifications, it's better to mock it manually.


## Github Actions

I use Github Actions to run tests on every push and pull request in `master`/`develop`. You can check out the [workflow](../.github/workflows/run-tests-template.yml) here.

To adapt it to use in your project, you need to:

- Create a new workflow file in yours `.github/workflows` folder
- Change the `name` (1st line) and `branches` to your needs, in this case, I'm using `master` and `develop` to be watched
- Change the `env` variables with all variables that you need to use in your project, like `DATABASE_URL`, `JWT_SECRET`, etc.
- Remove:
  ```yml
  defaults:
    run:
      working-directory: ./nestjs-template
  ```
  - This was needed to run tests on `nestjs-template`, as it's a monorepo and the workflow is in the root folder, but you don't need it if you are using this template as a standalone project
- The commands are using `pnpm`, but if you project is using `npm` or `yarn`, you can change it to your needs
  - Some flags are specific to `pnpm`, like `--frozen-lockfile` (this one exists in `yarn` too), so you need to check if it exists in your package manager

## Pull Request Template

I use a pull request template to help me on writing good pull requests. You can check it out [here](../.github/pull_request_template.md).

When you create a new pull request, you will see a template like this:

```md
# Porque esse merge é necessário

Descreva com algumas palavras o motivo desse merge request.

# O que esse merge faz

- Implementa essa feature
- Melhora a implementação daquela consulta ao BD
- Refatora a rota de criação de usuários

# Issue Relacionado

closes #<issue>
```

You can change it to your needs.


## Swagger (routes documentation)

To document your routes, you can use [Swagger](https://docs.nestjs.com/openapi/introduction). To install it, follow these instructions:

```bash	
$ pnpm add @nestjs/swagger
```

Then, add this to `main.ts`, you can change the options to your needs:

```ts
...
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  ...
  const config = new DocumentBuilder()
    .setTitle('NestJS Template')
    .setDescription('The NestJS Template API description')
    .setVersion('1.0')
    .addTag('nestjs-template')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  ...
}
...
```

---

Made with 🔥 by [M4ycon](https://github.com/m4ycon)
