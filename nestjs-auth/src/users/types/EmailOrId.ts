export type EmailOrId =
  | {
      email?: never
      id: number
    }
  | {
      email: string
      id?: never
    }
