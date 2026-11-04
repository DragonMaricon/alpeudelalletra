# changelog

## mejoras de la web

- **página de error:** antes remix mostraba su pantalla genérica; ahora hay una página propia para rutas inexistentes y errores inesperados, con un enlace para volver al inicio.
- **renderizado de markdown:** antes el contenido se procesaba sin personalización; ahora los artículos y la vista previa del admin comparten un renderizador que escapa html, filtra protocolos inseguros y mantiene el formato de enlaces e imágenes.
- **visitas:** antes no se guardaban lecturas; ahora cada carga de un artículo público incrementa el contador de forma atómica y muestra el total.
- **comentarios:** antes no había forma de comentar; ahora se pueden enviar mensajes con límites de longitud y quedan ocultos hasta que un administrador los apruebe.
- **búsqueda:** antes el campo de búsqueda estaba desactivado; ahora busca en el título y el contenido de artículos de cualquier año, y mantiene la agrupación trimestral normal cuando no se busca.
- **editor de markdown:** antes el admin tenía un textarea simple; ahora incluye botones para insertar formato en el cursor y una vista previa en paralelo.
- **borradores:** antes todos los artículos se publicaban al guardar; ahora se pueden guardar en privado y publicar más tarde desde el panel.

## base de datos y compatibilidad

- se añade `db/features-migration.sql` para crear el contador de visitas, el estado de publicación y la tabla de comentarios.
- los artículos existentes siguen publicados tras aplicar la migración; los comentarios nuevos quedan pendientes de moderación.
