# Production build - multi-stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Security: create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE ${PORT:-3000}

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

ENV NODE_ENV=production

CMD ["node", "src/app.js"]