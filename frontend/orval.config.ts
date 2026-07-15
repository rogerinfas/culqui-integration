import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../backend/swagger-spec.json',
    output: {
      mode: 'split',
      target: 'src/api/endpoints/api.ts',
      schemas: 'src/api/model',
      client: 'react-query',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: 'src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
  zod: {
    input: '../backend/swagger-spec.json',
    output: {
      mode: 'split',
      client: 'zod',
      target: 'src/api/zod/api.zod.ts',
      prettier: true,
    },
  },
});
