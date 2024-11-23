FROM public.ecr.aws/lambda/nodejs:18 AS builder

WORKDIR /app

# Copy all packages and shared folder
COPY packages/ ./packages
COPY shared/ ./shared

# Install dependencies for each package
RUN npm install --production --prefix ./packages/auth
RUN npm install --production --prefix ./packages/backend

# Install build tools
RUN npm install -g esbuild
RUN yum update -y && yum install -y zip unzip

# Build packages
WORKDIR /app/packages/auth
RUN esbuild index.ts --bundle --platform=node --outfile=dist/index.js --external:jsonwebtoken

WORKDIR /app/packages/utils
RUN esbuild index.ts --bundle --platform=node --outfile=dist/index.js

WORKDIR /app/packages/backend
RUN esbuild index.ts --bundle --platform=node --outfile=dist/index.js

# Build shared modules
WORKDIR /app/shared/constants
RUN esbuild index.ts --bundle --platform=node --outfile=dist/index.js
WORKDIR /app/shared/types
RUN esbuild index.ts --bundle --platform=node --outfile=dist/index.js

# Create and populate asset directory
WORKDIR /app
RUN mkdir -p /asset/dist
RUN mkdir -p /asset/dist/{auth,utils,backend,constants,types}
RUN mkdir -p /asset/node_modules

RUN cp -r packages/auth/dist/* /asset/dist/auth/
RUN cp -r packages/utils/dist/* /asset/dist/utils/
RUN cp -r packages/backend/dist/* /asset/dist/backend/
RUN cp -r shared/constants/dist/* /asset/dist/constants/
RUN cp -r shared/types/dist/* /asset/dist/types/

RUN cp -r packages/{auth,backend}/node_modules /asset/

# Create the lambda layer
WORKDIR /asset
RUN zip -r common-layer.zip dist node_modules

# Final image
FROM alpine:latest
COPY --from=builder /asset/common-layer.zip /asset/common-layer.zip

# (Optional) copy the layer to a host directory (remove for ECR deployment)
# COPY /asset/common-layer.zip /tmp/

# CMD ["npm", "start"] # Use your function's entry point if needed (remove for layers)