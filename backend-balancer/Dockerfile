FROM httpd:2.4

# =========================
# ENABLE REQUIRED MODULES
# =========================

RUN sed -i '/mod_proxy.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_proxy_http.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_proxy_balancer.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_slotmem_shm.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_lbmethod_byrequests.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_status.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_headers.so/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/mod_rewrite.so/s/^#//g' /usr/local/apache2/conf/httpd.conf

# =========================
# COPY BALANCER CONFIG
# =========================

COPY apache.conf /usr/local/apache2/conf/extra/balanceo.conf

# =========================
# INCLUDE CUSTOM CONFIG
# =========================

RUN echo "Include conf/extra/balanceo.conf" \
>> /usr/local/apache2/conf/httpd.conf