FROM nginx:alpine
# Copiamos tu configuración personalizada al lugar donde Nginx la busca
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]