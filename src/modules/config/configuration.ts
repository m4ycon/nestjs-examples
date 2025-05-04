export interface EnvironmentVariables {
  DATABASE_URL: string;
  PORT: number;
}

// partial to not require a default value, the TypedConfigModule must validate
export default (): Partial<EnvironmentVariables> => ({
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
});
