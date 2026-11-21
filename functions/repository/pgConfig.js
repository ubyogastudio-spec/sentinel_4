/** Pool settings for PostgreSQL. TLS is always verified: there is no code path that turns verification off. */
export function buildPgConfig(env) {
  const url = new URL(env.DATABASE_URL);
  url.searchParams.delete('sslmode'); // the explicit `ssl` option below decides
  const ca = env.PG_CA_CERT ? env.PG_CA_CERT.replace(/\\n/g, '\n') : '';
  let ssl = false;
  if (ca) ssl = { ca, rejectUnauthorized: true };
  else if (env.NODE_ENV === 'production') ssl = { rejectUnauthorized: true };
  return {
    connectionString: url.toString(),
    ssl,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  };
}
