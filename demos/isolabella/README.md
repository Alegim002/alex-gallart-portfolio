# Isolabella Art Studio — Demo de web + CRM

Propuesta de Agallart Digital. No es la web oficial del estudio.

## Probar

Descargar `index.html` y abrirlo en un navegador moderno. No requiere instalación ni dependencias. Se puede servir como sitio estático en GitHub Pages.

1. Solicitar una plaza desde la web (usar datos ficticios).
2. Abrir el panel CRM y confirmar la solicitud.
3. Probar un grupo completo: la solicitud entra en espera y no permite sobrepasar el aforo al confirmar.
4. Cancelar una reserva para liberar plazas y confirmar una solicitud en espera.
5. Registrar una señal simulada o saldar el importe. Revisar el resumen de pagos pendientes.
6. Crear una consulta de coworking; su precio queda por presupuestar.
7. Filtrar solicitudes, consultar aforos y alternar español e inglés.

## Alcance

- Ejemplos ficticios de actividades, fechas, precios, docentes y participantes.
- Persistencia exclusivamente local (`localStorage`), con funcionamiento en memoria si el navegador bloquea el almacenamiento.
- Sin backend, autenticación, datos compartidos entre dispositivos, emails, mensajes, cobros o reservas reales.
- Panel visible para demostrar el funcionamiento, no apropiado para datos reales de clientes.
- Los precios de los talleres son ilustrativos, no un presupuesto de desarrollo ni tarifas confirmadas del estudio.

## Versión de producción por definir

Confirmar programación, identidad visual, tarifas, política de reservas y cancelaciones, idiomas, usuarios y permisos. Implementar servidor, base de datos, autenticación, copias de seguridad y protección de datos antes de gestionar clientes reales. Cualquier integración de pagos o mensajería requiere especificación y autorización independientes.

## Comprobación local

`node verify.cjs` comprueba la sintaxis del JavaScript y los casos críticos de aforo, liberación de plazas y saldo pendiente con los datos iniciales. La revisión visual en navegador depende de disponibilidad del entorno.
