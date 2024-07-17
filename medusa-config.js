const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config();

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {
  console.error("Error loading env file:", e);
}

// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      develop: {
        open: process.env.OPEN_BROWSER !== "false",
      },
    },
  },
  {
    resolve: `@rsc-labs/medusa-store-analytics`,
    options: {
      enableUI: true,
    },
  },
  {
    resolve: `medusa-payment-stripe`,
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
  {
    resolve: `medusa-plugin-mailjet`,
    options: {
      public_key: process.env.MAILJET_PUBLIC_KEY,
      private_key: process.env.MAILJET_PRIVATE_KEY,
      from: 'Medusa hello@medusa.example',
      template_error_reporting: 'Medusa hello@medusa.example',
      customer_created_template: '[used on customer.created]',
      gift_card_created_template: '[used on gift_card.created]',
      order_placed_template: '[used on order.placed]',
      order_canceled_template: '[used on order.canceled]',
      order_shipped_template: '[used on order.shipment_created]',
      order_completed_template: '[used on order.completed]',
      user_password_reset_template: '[used on user.password_reset]',
      customer_password_reset_template: '[used on customer.password_reset]',
      localization: {
        'de-DE': {
          customer_created_template: '[used on customer.created]',
          gift_card_created_template: '[used on gift_card.created]',
          order_placed_template: '[used on order.placed]',
          order_canceled_template: '[used on order.canceled]',
          order_shipped_template: '[used on order.shipment_created]',
          order_completed_template: '[used on order.completed]',
          user_password_reset_template: '[used on user.password_reset]',
          customer_password_reset_template: '[used on customer.password_reset]',
        },
      },
    },
  },
  {
    resolve: `medusa-plugin-meilisearch`,
    options: {
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: [
              "title", 
              "description",
              "variant_sku",
            ],
            displayedAttributes: [
              "title", 
              "description", 
              "variant_sku", 
              "thumbnail", 
              "handle",
            ],
          },
          primaryKey: "id",
          transformer: (product) => ({
            id: product.id,
          }),
        },
      },
    },
  },
  {
    resolve: "medusa-file-r2",
    options: {
      account_id: process.env.ACCOUNT_ID,
      access_key: process.env.ACCESS_KEY,
      secret_key: process.env.SECRET_KEY,
      bucket: process.env.R2_BUCKET_NAME,
      public_url: process.env.R2_BUCKET_PUBLIC_URL,
    },
  },
];

const modules = {
  // Uncomment and configure the following lines to enable Redis
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwt_secret: process.env.JWT_SECRET || "supersecret",
  cookie_secret: process.env.COOKIE_SECRET || "supersecret",
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following line to enable Redis
  redis_url: REDIS_URL,
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
