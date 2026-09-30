# Copia anterior a «Sobre nosotros» y «Patrocinio»

`deepintheflower-antes-sobre-nosotros.tar.gz` contiene los archivos del proyecto antes de añadir estas páginas (código fuente, configuración y dependencias declaradas). No incluye `.git`, `node_modules`, `.figma` ni archivos generados.

`deepintheflower-antes-formulario-patrocinio.tar.gz` conserva el proyecto con las páginas «Sobre nosotros» y «Patrocinio», justo antes de añadir el formulario emergente.

`deepintheflower-antes-acceso-cabecera.tar.gz` conserva el proyecto antes de añadir el acceso desde la esquina superior derecha.

`deepintheflower-antes-carrito.tar.gz` conserva el proyecto antes de conectar la cesta de la tienda a la cabecera.

Para revisar el contenido: `tar -tzf backups/deepintheflower-antes-sobre-nosotros.tar.gz`.

Si quieres volver al estado anterior, guarda primero cualquier trabajo posterior que desees conservar y extrae el archivo en la raíz del proyecto. Después elimina las páginas nuevas `src/pages/SobreNosotros.tsx` y `src/pages/Patrocinio.tsx`, que no existían en la copia original.
