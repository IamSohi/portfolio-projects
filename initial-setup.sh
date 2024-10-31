#!/bin/bash

# Base directories
mkdir -p packages/shared packages/ui packages/utils apps/backend apps/frontend

# Shared folder structure and initial files
mkdir -p packages/shared/{constants,types,helpers}
touch packages/shared/constants/index.ts
touch packages/shared/types/index.ts
touch packages/shared/helpers/index.ts

# UI package structure (for shared components)
mkdir -p packages/ui/{components,styles,utils}
touch packages/ui/components/index.ts
touch packages/ui/styles/global.css
touch packages/ui/utils/index.ts

# Utils package structure (for shared utility functions)
mkdir -p packages/utils
touch packages/utils/index.ts

# Create tsconfig.json for shared settings
cat <<EOL > tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["dom", "es2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["packages/shared/*"],
      "@ui/*": ["packages/ui/*"],
      "@utils/*": ["packages/utils/*"]
    },
    "outDir": "./dist"
  },
  "include": ["apps/**/*", "packages/**/*"]
}
EOL

# Environment files setup
touch .env .env.local

# Backend .env file
cat <<EOL > apps/backend/.env
DATABASE_URL=
API_KEY=
EOL

# Frontend .env file
cat <<EOL > apps/frontend/.env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_ANALYTICS_ID=
EOL

# Sample README in shared packages
echo "# Shared Constants" > packages/shared/constants/README.md
echo "# Shared Types" > packages/shared/types/README.md
echo "# Shared Helpers" > packages/shared/helpers/README.md

echo "Project structure setup complete!"
