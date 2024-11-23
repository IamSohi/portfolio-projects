#!/bin/bash

# Ensure script is run from the root directory
if [ "$(basename "$PWD")" != "portfolio-projects" ]; then
  echo "Please run this script from the root 'portfolio-projects' directory."
  exit 1
fi

# Root directory for portfolio projects
ROOT_DIR="$PWD"

# Create main directory structure
mkdir -p $ROOT_DIR/{apps/{writing-platform,code-review-assistant,learning-assistant,task-manager},shared/{utils,constants,types},infrastructure/{aws-modules,env-configs},packages/{frontend,backend},.github/workflows,.husky,docs}

# Create common files in the root directory
touch $ROOT_DIR/package.json
touch $ROOT_DIR/turbo.json
touch $ROOT_DIR/tsconfig.json
touch $ROOT_DIR/.eslintrc.js
touch $ROOT_DIR/.prettierrc
touch $ROOT_DIR/.env.development
touch $ROOT_DIR/.env.staging
touch $ROOT_DIR/.env.production

# Create base files for each section
# Root-level files
touch .gitignore

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

# Add placeholders for documentation
mkdir -p $ROOT_DIR/docs/{writing-platform,code-review-assistant,learning-assistant,task-manager,shared}
touch $ROOT_DIR/docs/README.md
echo "# Portfolio Projects Documentation" > $ROOT_DIR/docs/README.md
for project in writing-platform code-review-assistant learning-assistant task-manager shared; do
    capitalized_project=$(echo "$project" | awk '{print toupper(substr($0,0,1)) tolower(substr($0,2))}')

    echo "# ${capitalized_project} Documentation" > $ROOT_DIR/docs/$project/README.md
done

# Create GitHub workflow placeholders
touch $ROOT_DIR/.github/workflows/{build.yml,deploy.yml,test.yml}

# Initialize Husky folder
mkdir -p $ROOT_DIR/.husky
touch $ROOT_DIR/.husky/pre-commit
echo "#!/bin/sh" > $ROOT_DIR/.husky/pre-commit
echo "npx lint-staged" >> $ROOT_DIR/.husky/pre-commit
chmod +x $ROOT_DIR/.husky/pre-commit

# Create placeholder files in shared utilities, constants, and types
echo "// Utility functions shared across projects" > $ROOT_DIR/shared/utils/index.ts
echo "// Global constants shared across projects" > $ROOT_DIR/shared/constants/index.ts
echo "// Type definitions shared across projects" > $ROOT_DIR/shared/types/index.ts

# Create infrastructure module placeholders
echo "# Terraform or CDK modules for AWS resources" > $ROOT_DIR/infrastructure/README.md
for module in api-gateway lambda s3 dynamodb; do
    mkdir -p $ROOT_DIR/infrastructure/aws-modules/$module
    touch $ROOT_DIR/infrastructure/aws-modules/$module/main.tf
    echo "// $module module configuration" > $ROOT_DIR/infrastructure/aws-modules/$module/main.tf
done

# Create environment configurations placeholder
echo "# Environment-specific configurations" > $ROOT_DIR/infrastructure/env-configs/README.md
touch $ROOT_DIR/infrastructure/env-configs/{development.tfvars,staging.tfvars,production.tfvars}

# Create frontend and backend package placeholders
echo "// Shared React components and hooks" > $ROOT_DIR/packages/frontend/index.ts
echo "// Shared backend utilities and middleware" > $ROOT_DIR/packages/backend/index.ts

# Create structure for each project in /apps
for project in writing-platform code-review-assistant learning-assistant task-manager; do
    # Create backend and frontend folders
    mkdir -p $ROOT_DIR/apps/$project/{backend,frontend}
    
    # Create placeholder README for each project
    echo "# $project Project" > $ROOT_DIR/apps/$project/README.md
    
    # Add placeholder files for backend and frontend
    echo "// $project backend code (e.g., API routes, Lambda functions)" > $ROOT_DIR/apps/$project/backend/index.ts
    echo "// $project frontend code (e.g., React components)" > $ROOT_DIR/apps/$project/frontend/index.ts
    
    # Initialize a package.json file for project-specific dependencies
    touch $ROOT_DIR/apps/$project/package.json
    echo "{ \"name\": \"$project\", \"version\": \"0.1.0\" }" > $ROOT_DIR/apps/$project/package.json
done


# Update package.json with Turborepo-specific scripts
# Assumes the root package.json exists
# npx json -I -f package.json -e 'this.scripts={ "dev": "turbo run dev", "build": "turbo run build", "lint": "turbo run lint", "test": "turbo run test" }'

# Inform the user of successful setup
# Notify completion
echo "Directory structure for portfolio projects created successfully at $ROOT_DIR."
