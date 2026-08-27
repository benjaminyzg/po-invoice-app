FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend code
COPY . .

EXPOSE 5173

# Bind Vite to 0.0.0.0 so Docker port mapping works
CMD ["npm", "run", "dev", "--", "--host"]