const { ImapFlow } = require('imapflow');
const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://mail-redis:6379';
const refreshIntervalMs = Number.parseInt(process.env.REFRESH_INTERVAL_MS || '60000', 10);

const fs = require('fs');

const readAccounts = () => {
  const filePath = process.env.MAIL_ACCOUNTS_FILE;
  if (filePath) {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      console.error('MAIL_ACCOUNTS_FILE is not valid JSON');
      process.exit(1);
    }
  }

  try {
    return JSON.parse(process.env.MAIL_ACCOUNTS || '[]');
  } catch (error) {
    console.error('MAIL_ACCOUNTS is not valid JSON');
    process.exit(1);
  }
};

const accounts = readAccounts();

if (!Array.isArray(accounts) || accounts.length === 0) {
  console.error('MAIL_ACCOUNTS is empty');
  process.exit(1);
}

const redis = createClient({ url: redisUrl });
redis.on('error', (error) => {
  console.error('Redis error:', error.message);
});

const counts = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeAccount = (account) => {
  const user = account.user || account.username;
  const pass = account.pass || account.password;
  const host = account.host;
  const port = account.port || 993;
  const tls = account.tls !== false;
  const allowSelfSigned = account.allowSelfSigned === true;

  if (!user || !pass || !host) {
    throw new Error('Account must include user, pass, host');
  }

  return { user, pass, host, port, tls, allowSelfSigned };
};

const updateTotal = async () => {
  let total = 0;
  for (const count of counts.values()) {
    total += count;
  }
  await redis.set('mail:unread:total', String(total));
};

const refreshCount = async (client, key) => {
  const lock = await client.getMailboxLock('INBOX');
  try {
    const unseen = await client.search({ seen: false });
    const count = unseen.length;
    counts.set(key, count);
    await redis.hSet('mail:unread:per', key, String(count));
    await updateTotal();
  } finally {
    lock.release();
  }
};

const runAccount = async (account) => {
  const config = normalizeAccount(account);
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.tls,
    tls: config.tls ? { rejectUnauthorized: !config.allowSelfSigned } : undefined,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await client.connect();
  await client.mailboxOpen('INBOX');

  const key = config.user;
  const refresh = () => refreshCount(client, key).catch((error) => {
    console.error(`Refresh error (${key}):`, error.message);
  });

  await refresh();
  client.on('exists', refresh);
  client.on('expunge', refresh);
  client.on('flags', refresh);

  setInterval(refresh, refreshIntervalMs).unref();

  while (!client.closed) {
    try {
      await client.idle();
    } catch (error) {
      console.error(`IDLE error (${key}):`, error.message);
      await delay(5000);
    }
  }
};

const start = async () => {
  await redis.connect();
  await Promise.all(accounts.map((account) => runAccount(account)));
};

start().catch((error) => {
  console.error('Startup error:', error.message);
  process.exit(1);
});
