# La Perruquería · CRM de demostración

Propuesta comercial independiente de su web pública. CRM interactivo en español, con navegación por Resumen, Agenda, Clientes y mascotas, Caja, Seguimiento y Servicios y tarifas.

## Recorrido para presentar
1. Abrir una ficha y guardar una preferencia.
2. Crear una cita para mañana a las 10:00; confirmar desde Agenda. Los solapamientos se rechazan.
3. En Resumen, finalizar el servicio de Nala y registrar un cobro de prueba. La caja y el historial se actualizan.
4. En Seguimiento, revisar un borrador de revisita y marcarlo como preparado. No se envía ningún mensaje.

Datos ficticios en memoria, reiniciados al recargar. Sin contactos reales de clientes, base de datos, autenticación propia, integración con WhatsApp, cobros reales ni facturación. Los importes de citas son ejemplos dentro de los rangos publicados. Horarios de 09:00–20:00, un puesto y duraciones de 45/60/75 minutos son supuestos para demostrar el flujo. Las fechas de revisita no son recomendaciones profesionales.

Tarifas y servicios consultados en https://laperruqueria.es/ el 3 de octubre de 2026. No se han reutilizado nombres de clientes ni reseñas de esa web. Diseño inspirado en el amarillo del negocio.

Sitio estático en `dist/`, sin compilación. `model.js` contiene la lógica, `app.js` la interfaz y `style.css` el diseño. El contexto WebMCP opcional expone una consulta de agenda de solo lectura cuando el navegador lo soporta.

Antes de convertirlo en un producto real: validar procesos y horarios con el negocio; integrar almacenamiento, cuentas, permisos, copias de seguridad y servicios externos según sus necesidades. Esta demo no acredita una integración o contratación existente.
