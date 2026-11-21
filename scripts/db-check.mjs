// Connects, runs SELECT 1, prints each table's row count (never row contents) and exits.
import { createRepository } from '../functions/repository/index.js';
import { errorCode } from '../functions/lib/errorCode.js';

const repo = createRepository(process.env);
try {
  await repo.init();
  await repo.ping();
  console.log(await repo.counts());
  await repo.close();
} catch (error) {
  console.error(`db:check failed: ${errorCode(error)}`);
  process.exitCode = 1;
}
