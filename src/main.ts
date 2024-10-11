import { loadApp } from './loaders/loadApp';

async function bootstrap() {
  const app = await loadApp();
  await app.listen(3000);
}

bootstrap();
