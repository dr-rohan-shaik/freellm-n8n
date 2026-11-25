# FreeLLM n8n - Docker image with FreeLLM nodes pre-installed
FROM n8nio/n8n:latest

# Switch to root to install packages
USER root

# Install pnpm
RUN npm install -g pnpm@9

# Create custom nodes directory
RUN mkdir -p /home/node/.n8n/custom

# Copy the FreeLLM nodes package
COPY packages/nodes-freellm /home/node/.n8n/custom/nodes-freellm

# Install dependencies
WORKDIR /home/node/.n8n/custom/nodes-freellm
RUN pnpm install --production

# Build the nodes
RUN pnpm build

# Switch back to node user
USER node

# Expose n8n port
EXPOSE 5678

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5678/healthz || exit 1

# Start n8n
CMD ["n8n", "start"]