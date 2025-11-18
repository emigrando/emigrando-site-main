import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.emigrando.app',
  appName: 'Emigrando.de',
  webDir: 'out',
  server: {
    // Cambia esto cuando tengas tu URL final de producción
    // por ejemplo: 'https://emigrando-site-main.vercel.app' o tu dominio propio
    url: 'https://emigrando.de',
    cleartext: false
  }
};

export default config;
