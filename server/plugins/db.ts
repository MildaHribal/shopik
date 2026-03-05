import { queryClient } from '../utils/db';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    try {
      if (queryClient) {
        await queryClient.end();
      }
    } catch (err) {
      console.error('Error closing Postgres connection', err);
    }
  });
});
