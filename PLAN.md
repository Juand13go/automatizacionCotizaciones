# PRIMER CONTACTO
### Ningún cliente sin respuesta

**Juan Diego Ramírez Rendón**
Diplomado en Inteligencia Artificial Avanzada y Aplicada
Universidad EIA · Cámara de Comercio Aburrá Sur

---

## Qué es

Primer Contacto es un sistema que atiende las solicitudes comerciales que llegan por los
canales de mensajería de una empresa, las entiende, decide cuáles necesitan a una persona
y cuáles no, y le entrega al asesor solo lo que vale su tiempo — con el cliente ya
respondido.

No es un chatbot. Un chatbot responde. Este sistema **decide, enruta y registra el
resultado**.

---

## El problema

Las pequeñas y medianas empresas del Aburrá Sur reciben pedidos y consultas por WhatsApp
y redes sociales a toda hora. Los mensajes llegan de noche, los fines de semana y en
festivos. Llegan mal escritos, incompletos y mezclados con preguntas que no son ventas.

Pasa una de tres cosas:

1. El cliente espera hasta el lunes y para entonces ya compró en otro lado.
2. Un asesor gasta la mañana respondiendo consultas de bajo valor.
3. El mensaje simplemente se pierde en el chat.

Nadie sabe cuántos negocios se pierden así, porque **no queda registro de lo que no se
atendió**.

---

## Cómo funciona

```
Cliente escribe por el canal de la empresa
        │
        ▼
El sistema guarda la conversación completa
        │
        ▼
Agente de IA: entiende el mensaje y extrae
   · qué productos le interesan
   · de qué ciudad escribe
   · si esto necesita un humano
        │
        ├── No lo necesita  →  responde al cliente al instante
        │
        └── Sí lo necesita  →  crea el lead
                               asigna un asesor
                               le avisa al asesor
                               responde al cliente
        │
        ▼
El asesor entra al panel, ve sus leads y cierra:
        VENTA  /  NO VENTA
        │
        ▼
El sistema guarda el resultado
```

Ese último paso es el que importa: **cada decisión que toma el sistema queda vinculada a
un resultado real de negocio**.

---

## Arquitectura

| Capa | Tecnología |
|---|---|
| Canal de entrada | Telegram (extensible a WhatsApp) |
| Orquestación de flujo | n8n |
| Lógica de negocio | FastAPI · Python · arquitectura en tres capas |
| Agente de IA | Groq · Llama 3.3 70B con *tool calling* |
| Datos | PostgreSQL · SQLModel · migraciones con Alembic |
| Validación | Esquemas Pydantic |
| Interfaz | HTML, CSS y JavaScript sin frameworks |
| Empaquetado | Docker y Docker Compose |

La aplicación está separada en tres capas — servicio, persistencia y API — de modo que la
lógica de negocio no sabe nada de la base de datos ni de los endpoints. Cualquiera de las
tres piezas se puede cambiar sin tocar las otras dos.

---

## Estado actual

**Funcionando:**

- Recepción de mensajes por Telegram y persistencia de toda la conversación
- Agente que interpreta el mensaje y extrae datos estructurados del lead
- Decisión de escalar o responder automáticamente
- Creación del lead, asignación de asesor y notificación
- Respuesta al cliente por el mismo canal
- Panel web para consultar asesores, ver sus leads y registrar el cierre
- Todo el entorno levanta con un solo comando (`docker compose up`)

**En construcción:**

- Motor de lógica difusa para priorizar y explicar las decisiones de escalación
- Búsqueda semántica sobre el catálogo
- Despliegue en servidor con autenticación

**Alcance honesto:** es un prototipo funcional construido sobre un catálogo real de
productos. No está en producción en ninguna empresa.

---

## Lo que sigue: motor de lógica difusa

Hoy la decisión de escalar la toma el modelo de lenguaje. Funciona, pero no es auditable:
si el dueño pregunta *"¿por qué escalaste ese y no este otro?"*, no hay respuesta.

Voy a reemplazar esa decisión por un **sistema de lógica difusa** con reglas que yo diseño
a partir del criterio del negocio:

> Si el monto estimado es alto **y** el cliente es nuevo **y** la urgencia es media,
> entonces la prioridad es alta.

La lógica difusa permite que las variables tengan grados en lugar de sí/no: un cliente no
es "importante o no", es importante en cierto grado. El sistema combina esos grados
matemáticamente y entrega una prioridad continua **junto con las reglas que se activaron**.

Ventajas concretas:

- **Es explicable.** Se muestra exactamente por qué se tomó cada decisión.
- **No necesita datos históricos.** Codifica el conocimiento del dueño del negocio, que es
  justo lo que una PYME sí tiene y un dataset no.
- **Es evaluable.** Como el sistema ya registra venta / no venta, puedo medir si sus
  prioridades acertaron.

---

## Pitch de 90 segundos

> Las empresas de esta zona reciben pedidos por WhatsApp a toda hora. De noche, los
> domingos, en festivos. Y el cliente que no recibe respuesta hoy, mañana compró en otro
> lado.
>
> Primer Contacto atiende esas solicitudes cuando no hay nadie. Lee el mensaje, entiende
> qué está pidiendo el cliente aunque escriba mal, y toma una decisión: si es una consulta
> sencilla la responde de una; si es un negocio de verdad, crea el lead, le asigna un
> asesor, le avisa, y le responde al cliente que ya lo están atendiendo.
>
> El asesor llega en la mañana y no tiene doscientos mensajes. Tiene una lista de leads
> reales, con la información ya organizada. Y cuando cierra, marca si fue venta o no.
>
> Eso último es lo que hace distinto a este sistema. Cada decisión que toma queda
> conectada a un resultado de negocio. No aprende de un archivo que descargué de
> internet: **genera sus propios datos**.
>
> Lo que sigue es reemplazar la decisión de escalación, que hoy la toma el modelo de
> lenguaje sin explicar nada, por un motor de lógica difusa con reglas que puedo mostrar
> en pantalla. Para que cuando el dueño pregunte por qué se escaló un lead, el sistema
> responda.

---

## Sobre el estado de avance

*Para cuando pregunten por qué hay menos pantallas que en otros proyectos:*

> Mi proyecto tiene menos interfaz que otros, y es una decisión.
>
> Preferí construir primero lo que va debajo: la base de datos con migraciones, la
> arquitectura en capas, los contenedores, el agente con herramientas, y el registro del
> cierre de cada lead. La interfaz es la capa más rápida de construir. El sistema que va
> debajo, no.
>
> Y hay algo que para mí no era negociable: **todo lo que está ahí lo escribí yo**. No hay
> una línea que no pueda explicar. Entré a este curso a aprender a construir estas cosas,
> no a ensamblarlas.
>
> En las próximas semanas viene el motor de lógica difusa y el despliegue. Pero la base
> ya está, y es sobre esa base que lo demás se puede montar.

---

## Preguntas difíciles y cómo responderlas

**"¿Esto está funcionando en alguna empresa?"**
No. Es un prototipo funcional construido sobre un catálogo real de productos. Está listo
para pilotear con una empresa que quiera probarlo.

**"¿Cuánto cuesta operarlo?"**
La infraestructura es un servidor pequeño. El costo variable es el modelo de lenguaje, que
se cobra por mensaje procesado y son fracciones de centavo por conversación. Frente al
costo de un solo negocio perdido, no es comparable.

**"¿Y si el bot responde una barbaridad?"**   
Por eso existe la escalación. El sistema está diseñado para reconocer lo que no debe
contestar y pasarlo a una persona. Y toda conversación queda registrada, así que siempre
se puede revisar qué se dijo.

**"¿Por qué no le entrenaste un modelo propio?"**
Porque el problema no era de estilo de respuesta sino de conocimiento del catálogo, y para
eso lo correcto es darle acceso a la información, no reentrenar el modelo. Entrenar habría
sido más caro y peor.

**"¿Cuánto se demoró?"**
Es un desarrollo que empecé en mayo de este año y lo he venido trabajando durante todos estos meses con el 
objetivo de desarrollar un sistema robusto, usar buenas practicas e implementar un stack real utilizado en proyectos del sector.


---

## Guion de la demostración

1. **Mandar un mensaje desde Telegram** como si fueras un cliente, escribiendo mal a
   propósito: *"buenas necesito cotizar unas cosas para un trabajo"*.
2. **Mostrar la respuesta del agente** llegando al cliente.
3. **Abrir el panel**, listar asesores y buscar los leads de uno.
4. **Mostrar el lead creado** con la información ya estructurada.
5. **Cerrarlo como venta** y explicar que ese dato es el que alimenta la evaluación del
   sistema.

Tiempo objetivo: dos minutos. Ensáyalo tres veces antes.