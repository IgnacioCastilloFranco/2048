# Use lightweight nginx image to serve static files
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy current project files into nginx html directory
# Only static files are required: html, js, css, assets
COPY . /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Start nginx (default CMD already in base image)
# Use the default nginx entrypoint/CMD from the base image
