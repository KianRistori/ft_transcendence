# Dockerfile for Nginx

# Use the official Nginx base image
FROM nginx:latest

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/
COPY certs/nginx.crt /usr/nginx/
COPY certs/nginx.key /usr/nginx/

# Expose ports
EXPOSE 80:443
