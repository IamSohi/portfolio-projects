#!/bin/bash

# Ensure script is run from the root directory
if [ "$(basename "$PWD")" != "portfolio-projects" ]; then
  echo "Please run this script from the root 'portfolio-projects' directory."
  exit 1
fi

# Create the main folders
mkdir -p apps/{writing-platform,code-review-assistant,learning-assistant,task-manager}
mkdir -p shared/{utils,constants,types}
mkdir -p infrastructure/aws-modules
mkdir -p packages/{frontend,backend}

# Create base files for each section
# Root-level files
touch .env .gitignore tsconfig.json

# Initialize tsconfig.json with base config
cat <<EOL > tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/*"],
      "@frontend/*": ["packages/frontend/*"],
      "@backend/*": ["packages/backend/*"]
    },
    "skipLibCheck": true
  },
  "include": ["apps/**/*", "shared/**/*", "packages/**/*"]
}
EOL

# Initialize .gitignore
cat <<EOL > .gitignore
node_modules/
dist/
.env
EOL

# Create placeholder README files for each section
echo "# Writing Platform App" > apps/writing-platform/README.md
echo "# Code Review Assistant App" > apps/code-review-assistant/README.md
echo "# Learning Assistant App" > apps/learning-assistant/README.md
echo "# Task Manager App" > apps/task-manager/README.md
echo "# Shared Utilities" > shared/utils/README.md
echo "# Shared Constants" > shared/constants/README.md
echo "# Shared Types" > shared/types/README.md
echo "# Frontend Package" > packages/frontend/README.md
echo "# Backend Package" > packages/backend/README.md
echo "# AWS Infrastructure Modules" > infrastructure/aws-modules/README.md

# Update package.json with Turborepo-specific scripts
# Assumes the root package.json exists
npx json -I -f package.json -e 'this.scripts={ "dev": "turbo run dev", "build": "turbo run build", "lint": "turbo run lint", "test": "turbo run test" }'

# Inform the user of successful setup
echo "Directory structure and initial files created successfully."
