# Isolabella · Web multipágina + CRM de demostración

Web en español e inglés para presentar talleres de cerámica y coworking. Nueve páginas HTML independientes: inicio, catálogo, torno, modelado, clases semanales, estudio, contacto, solicitud y CRM.

El CRM gestiona solicitudes, plazas confirmadas, espera, cancelaciones y pagos simulados. Una solicitud creada desde cualquier taller aparece en el CRM del mismo navegador. Se conserva la clave `isolabella-demo-v1` de la demo anterior y el idioma elegido entre páginas.

## Desarrollo

Sin dependencias. Para regenerar las páginas: `python3 build.py`. En el proyecto de publicación se escribe en `dist/`; en la copia de GitHub se escribe junto a este README. Los recursos compartidos están en `assets/` dentro de la raíz publicada.

Comprobación: `node verify.cjs`.

Vista local: `python3 -m http.server 8080 --directory dist` y abrir `http://localhost:8080`. En la copia de GitHub, donde los archivos publicados están directamente en `demos/isolabella/`, servir esa carpeta como raíz. Es necesario HTTP para cargar los módulos; no abrir como `file://`.

## Límites de la demo

Datos, fechas, docentes y tarifas ficticios. No hay backend, autenticación, pagos, reservas, correos ni mensajes reales. El almacenamiento es local al navegador y al origen; no se comparte entre dispositivos ni dominios. La página de CRM forma parte de la demo y no es un sistema de producción protegido. Si localStorage no está disponible, se muestra un aviso y los cambios no persisten al navegar.

Antes de usarla en producción se deben validar contenido, condiciones, tarifas y datos de contacto con el estudio, e implementar autenticación, almacenamiento y servicios reales.
