FROM httpd:2.4

# Habilitar módulos de proxy y balanceo
RUN sed -i \
    -e 's/^#\(LoadModule proxy_module modules\/mod_proxy.so\)/\1/' \
    -e 's/^#\(LoadModule proxy_balancer_module modules\/mod_proxy_balancer.so\)/\1/' \
    -e 's/^#\(LoadModule proxy_http_module modules\/mod_proxy_http.so\)/\1/' \
    -e 's/^#\(LoadModule lbmethod_byrequests_module modules\/mod_lbmethod_byrequests.so\)/\1/' \
    -e 's/^#\(LoadModule lbmethod_bybusyness_module modules\/mod_lbmethod_bybusyness.so\)/\1/' \
    -e 's/^#\(LoadModule slotmem_shm_module modules\/mod_slotmem_shm.so\)/\1/' \
    conf/httpd.conf

# Copiar la configuración personalizada
COPY ./balancer.conf conf/extra/balancer.conf

# Incluir la configuración en el archivo principal
RUN echo "Include conf/extra/balancer.conf" >> conf/httpd.conf
