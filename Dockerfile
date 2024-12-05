# Step 1: Build the React app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files and build the app
COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:latest

# Create directory for hosting the built files
RUN mkdir -p /var/www/vhosts/frontend/

# Copy the built files from Step 1
COPY --from=build /app/build /var/www/vhosts/frontend/

# Remove the default Nginx site configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration for the portfolio
COPY --from=build /app/bot.conf /etc/nginx/conf.d/bot.conf

# Expose port 80 and run Nginx in the foreground
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

