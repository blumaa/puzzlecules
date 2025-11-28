import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { generateGroupsV2 } from './src/services/group-generator/generateGroupsV2';

type ServerMiddlewareReq = {
  url?: string;
  method?: string;
  on: (event: string, callback: (chunk: Buffer) => void) => void;
};

type ServerMiddlewareRes = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (data: string) => void;
};

type ServerMiddlewareHandler = (
  req: ServerMiddlewareReq,
  res: ServerMiddlewareRes,
  next: () => void
) => void;

type Server = {
  middlewares: {
    use: (handler: ServerMiddlewareHandler) => void;
  };
};

/**
 * Helper to read request body as JSON
 */
function readBody(req: ServerMiddlewareReq): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

/**
 * Vite plugin to handle /api routes in development
 */
function apiRoutesPlugin() {
  return {
    name: 'api-routes',
    configureServer(server: Server) {
      // Handler for /api/generate-groups-v2
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/generate-groups-v2' && req.method === 'POST') {
          const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'VITE_ANTHROPIC_API_KEY not set in environment' }));
            return;
          }

          const body = await readBody(req);

          try {
            const { filters, connectionTypes, goodExamples, badExamples, count } = JSON.parse(body);

            if (!connectionTypes || connectionTypes.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'At least one connection type required' }));
              return;
            }

            if (!count || count < 1 || count > 30) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Count must be between 1 and 30' }));
              return;
            }

            const result = await generateGroupsV2(
              apiKey,
              filters,
              connectionTypes,
              count,
              goodExamples,
              badExamples
            );

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (error) {
            console.error('Error generating groups v2:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: error instanceof Error ? error.message : 'Failed to generate groups'
            }));
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiRoutesPlugin()],
  optimizeDeps: {
    include: ['@mond-design-system/theme'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    server: {
      deps: {
        inline: ['@mond-design-system/theme'],
      },
    },
  },
});
