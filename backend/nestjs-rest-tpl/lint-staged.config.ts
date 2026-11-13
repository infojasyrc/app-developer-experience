// lint-staged.config.ts
import type { Configuration } from 'lint-staged';

const config: Configuration = {
  '*.ts': ['eslint --fix', 'prettier --write'],
};

export default config;