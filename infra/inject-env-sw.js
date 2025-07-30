import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

console.log('💉 Injecting env into service worker file...');

const __dirname = path.resolve();
const swTemplatePath = path.join(__dirname, './service-workers/push_notifications-service-worker_template.js');
const swOutputPath = path.join(__dirname, './public/cargo-navis_push-service-worker.js');

const swTemplate = fs.readFileSync(swTemplatePath, 'utf-8');

const injected = swTemplate.replace('__APP_URL__', process.env.NEXT_PUBLIC_APP_URL);

fs.writeFileSync(swOutputPath, injected);
console.log('✅ Injected env into service-worker.js');
