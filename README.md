# Posts popup CDN

Para abrir las publicaciones en un popup sobre todo el sitio, inserta este script en el HTML de la página, antes de `</body>`. Sustituye la URL del API por la URL pública de Posts que entrega Widget Wizzard.

```html
<script
  src="https://cdn.jsdelivr.net/gh/ChristopherAzD/CDN-Post@main/posts-popup.js"
  data-api="https://TU-PANEL.netlify.app/api/posts/TU-CLAVE"
  defer
></script>
```

El popup se abre al cargar la página si hay posts con imagen. Cuando hay varios, se recorren con los botones o las flechas del teclado. Escape o el botón de cierre lo ocultan. El API decide qué publicaciones están vigentes.

El archivo `PostWidget.html` permanece disponible para la instalación en una sección mediante iframe. Un iframe no puede cubrir la página completa con un popup.
