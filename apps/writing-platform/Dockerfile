# Use an official Node.js image
FROM public.ecr.aws/lambda/nodejs:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY sync-package.json package.json

# Install dependencies
RUN npm install

RUN yum update -y && yum install -y zip unzip

RUN mkdir -p nodejs
RUN cp -r node_modules nodejs/
RUN zip -r writing-platform-layer.zip nodejs

# Final image
FROM alpine:latest
COPY --from=builder /app/writing-platform-layer.zip /app/writing-platform-layer.zip

