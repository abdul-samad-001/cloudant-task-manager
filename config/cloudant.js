const rawUrl = process.env.CLOUDANT_URL || '';
const rawKey = process.env.CLOUDANT_APIKEY || '';
const looksLikePlaceholder = rawUrl.includes('<your-instance-id>') || rawKey.includes('<your-api-key>');
const useCloudant = Boolean(rawUrl && rawKey) && !looksLikePlaceholder;

if (Boolean(rawUrl && rawKey) && looksLikePlaceholder) {
  console.warn('CLOUDANT_URL/CLOUDANT_APIKEY still look like placeholder values — falling back to in-memory storage until real Cloudant credentials are set.');
}

const DB_NAME = 'tasks';

let client;
if (useCloudant) {
  const { CloudantV1 } = require('@ibm-cloud/cloudant');
  client = CloudantV1.newInstance({});
}

async function ensureDatabaseExists() {
  if (!useCloudant) return;
  try {
    await client.getDatabaseInformation({ db: DB_NAME });
  } catch (err) {
    if (err.status === 404) {
      await client.putDatabase({ db: DB_NAME });
      console.log(`Created Cloudant database "${DB_NAME}"`);
    } else {
      throw err;
    }
  }
}

module.exports = {
  client,
  useCloudant,
  DB_NAME,
  ensureDatabaseExists,
};
