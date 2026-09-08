// lint-staged.config.ts
import type { Config } from 'lint-staged';

const config: Config = {
  '*.ts': ['eslint --fix', 'prettier --write'],
};

export default config;