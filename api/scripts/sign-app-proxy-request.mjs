import { createHmac } from 'crypto';
import { config } from 'dotenv';

config({ quiet: true });

const secret = process.env.SHOPIFY_API_SECRET;
if (!secret) {
  console.error('Set SHOPIFY_API_SECRET in .env');
  process.exit(1);
}
// TODO: Update links here
const shop = process.env.DEV_SHOP ?? 'pixel-commerce-dev.myshopify.com';
const pathPrefix = process.env.APP_PROXY_PATH_PREFIX ?? '/apps/social-commerce';
const basePath =
  process.argv[2] ?? '/shopify-proxy/post/all?pageNumber=1&resultsPerPage=10';

const [pathname, existingQuery = ''] = basePath.split('?');
const params = Object.fromEntries(new URLSearchParams(existingQuery));

params.shop = shop;
params.path_prefix = pathPrefix;
params.timestamp = String(Math.floor(Date.now() / 1000));

const message = Object.keys(params)
  .sort()
  .map((key) => `${key}=${params[key]}`)
  .join('');

params.signature = createHmac('sha256', secret).update(message).digest('hex');

const url = `http://localhost:${process.env.PORT ?? 5120}${pathname}?${new URLSearchParams(params)}`;
console.log(url);
