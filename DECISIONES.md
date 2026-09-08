# Decisiones de diseño — Radar

Registro de las decisiones importantes del proyecto, con su razón y sus consecuencias.
Se documentan aquí para que dentro de seis meses —o en una entrevista— se pueda explicar
**por qué** el sistema es como es, no solo cómo funciona.

---

## Estado del sistema a 8 de septiembre de 2026

**Funciona:** recepción por Telegram, persistencia de conversaciones y mensajes, agente con
*tool calling* que extrae `respuesta_cliente`, `productos_interes`, `ciudad` y
`debe_escalar`, creación de lead, asignación al asesor menos cargado, notificación,
respuesta al cliente, panel web para listar asesores y sus leads, y registro del cierre en
`venta` / `no_venta`.

**Arquitectura:** tres capas (API, servicio, persistencia), PostgreSQL con SQLModel,
migraciones con Alembic, validación con Pydantic, orquestación con n8n, todo en Docker
Compose. Excepciones propias, logging con identificador de conversación.

**Lo que falta:** el motor de lógica difusa (en curso), pruebas automatizadas, integración
continua.

---

## D-01 · La escalación se decide por completitud del lead

**Contexto.** Después de que el modelo decide `debe_escalar`, el código lo sobrescribe:

```python
if not ciudad or not productos_interes:
    escalar = False
```

**Razón original.** Evitar que los asesores reciban todo. Si se escala cada mensaje con
molestia o cada petición de hablar con alguien, la automatización no aporta nada. La
compuerta garantiza que solo suba lead calificado.

**Problema identificado.** La regla usa *"¿está completo el lead?"* para responder
*"¿necesita un humano?"*. Coinciden casi siempre, pero se separan en los casos caros: un
cliente de alta intención que aún no dio sus datos no se escala.

**Decisión.** Se mantiene el objetivo —autonomía, no inundar a los asesores— y se cambia el
mecanismo. La causa raíz es que la salida es binaria, así que hay que elegir entre dos
reglas malas. Con salida continua, la completitud pasa de ser **compuerta** a ser **una
variable más que baja la prioridad**.

**Estado.** El `if` se mantiene sin cambios hasta que el motor difuso lo reemplace por
completo. No se parcha: es la línea base contra la cual se demuestra la mejora.

---

## D-02 · Un fallo del modelo escala a un humano

**Contexto.** El bloque `except` de `comunicacion_agente` devolvía `escalar: False` y un
mensaje pidiéndole al cliente que volviera más tarde.

**Problema.** Eso no filtra un lead malo: pierde un cliente porque la infraestructura
falló, y sin que nadie se entere. Es un problema distinto al de D-01 —modo degradado, no
calificación— y merece la respuesta contraria.

**Decisión.** Ante fallo del modelo, `escalar: True` y mensaje al cliente diciendo que un
asesor lo contactará. La degradación es hacia el humano, nunca hacia el silencio.

> **Principio:** cuando la IA falla, el sistema no inventa ni abandona: entrega el caso a
> una persona.

---

## D-03 · El modelo es configuración, no código

**Contexto.** El 8 de septiembre el sistema dejó de funcionar. Groq retiró
`llama-3.3-70b-versatile` y toda llamada devolvía `404 model_not_found`. El código no había
cambiado.

**Decisión.** El identificador del modelo sale a variable de entorno `GROQ_MODEL`. Cambiar
de modelo no requiere tocar código, reconstruir la imagen ni hacer un commit.

**Modelo elegido:** `openai/gpt-oss-20b`. La tarea —extraer cuatro campos de un mensaje
corto— no requiere un modelo grande, y la latencia importa porque el cliente está esperando
en el chat.

**Consecuencia.** Este incidente es la demostración concreta de por qué en LLMOps el
proveedor es una dependencia externa que puede cambiar sin aviso.

---

## D-04 · Sin fine-tuning: el problema es de conocimiento, no de estilo

**Decisión.** No se entrena ni se ajusta ningún modelo. El agente necesita conocer el
catálogo, no cambiar su forma de escribir. Para conocimiento, lo correcto es darle acceso a
la información.

**Implementación actual.** El catálogo completo se inyecta en el *prompt* del sistema en
cada mensaje.

**Limitación aceptada.** Funciona con un catálogo pequeño. Con cientos de referencias, el
costo por mensaje crece y se topa con el límite de contexto. La solución es búsqueda
semántica sobre el catálogo, que queda como trabajo futuro por tiempo, no por criterio.

---

## D-05 · El agente responde solo sobre su dominio

**Decisión.** El agente no conversa de temas ajenos al negocio. Un asistente comercial que
responde sobre cualquier cosa es imposible de evaluar y de acotar.

**Implementación.** Ante una pregunta fuera de dominio no se responde con un rechazo seco;
se reconoce, se acota y se ofrece contacto humano. La restricción se diseña como parte del
producto, no como un `else`.

---

## D-06 · El sistema registra el resultado de cada decisión

**Decisión.** El panel del asesor cierra cada lead como `venta` o `no_venta`.

**Por qué importa.** Vincula cada decisión de priorización con un resultado de negocio
real. Permite evaluar el motor difuso —¿los leads de prioridad alta cierran más?— y hace
que el sistema genere su propio conjunto de datos etiquetados, en vez de depender de datos
externos.

---

## D-07 · Alcance recortado para el cierre del diplomado

Quedan tres semanas y media hasta el 2 de octubre. El motor difuso es el camino crítico.

**Dentro:**

- Motor de lógica difusa: 3 o 4 variables de entrada, inferencia Sugeno de orden cero,
  reglas en archivo YAML, salida de prioridad más las reglas activadas
- Pruebas unitarias del motor (función pura y determinística)
- Integración continua con linter y pruebas
- Explicación de la decisión visible en la interfaz
- Plan B de demostración corriendo en local, sin internet

**Fuera:**

- Búsqueda semántica sobre el catálogo → trabajo futuro (ver D-04)
- Despliegue en servidor → solo si el motor difuso queda listo antes del 24 de septiembre
- Algoritmos evolutivos para asignación de asesores → trabajo futuro

**Criterio de recorte.** Vale más una pieza terminada y bien explicada que tres a medias.

---

## Deuda técnica conocida

| Asunto | Detalle |
|---|---|
| Consultas N+1 | `menos_cargado` llama a `comparacion()` una vez por asesor. Con cuatro no importa; con cincuenta, sí. Se resuelve con una sola consulta agrupada. |
| Catálogo en cada mensaje | `catalogo_a_texto` consulta la base y arma el texto en cada llamada. Se puede cachear. |
| Sin autenticación | Los endpoints del panel están abiertos. Aceptable en local, no en un servidor. |
| Sin límite de tasa | `/procesar` gasta dinero real en cada llamada. |
| `productos_interes` es texto libre | Sin normalizar contra el catálogo. Se resuelve con búsqueda semántica. |
| Imagen `n8n:latest` | Puede actualizarse sola y romper el entorno. Fijar versión. |
| Prompt versionado como código | Vive dentro de `conversacion.py`, sin historial propio ni evaluación. |