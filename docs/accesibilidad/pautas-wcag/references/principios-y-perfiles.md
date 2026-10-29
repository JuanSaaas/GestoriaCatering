# Principios WCAG, ley y perfiles de usuario

## Contenido
1. Por qué importa
2. Qué dice la ley
3. Los 4 principios y los niveles
4. Perfiles de usuario (qué necesitan, Sí / No)

## 1. Por qué importa
- 1 de cada 6 personas en el mundo vive con una discapacidad importante (OMS). 4,3 millones en España (INE, EDAD 2020).
- 1 de cada 12 hombres distingue mal algunos colores; en mujeres, 1 de cada 200.
- **La discapacidad no siempre es permanente** (espectro de Microsoft):

| Situación | Tocar | Ver | Oír |
|---|---|---|---|
| Permanente | falta un brazo | ceguera | sordera |
| Temporal | brazo escayolado | operación de cataratas | infección de oído |
| Situacional | llevar un bebé en brazos | conducir | bar ruidoso |

- **Lo que nace para unos lo usamos todos** (efecto bordillo): subtítulos (vídeo sin sonido en el metro), texto grande/zoom (móvil a pleno sol), dictado por voz (conduciendo), modo oscuro (de noche), atajos de teclado (trabajar más rápido).

## 2. Qué dice la ley (España/UE)
| Norma | A quién obliga | Desde |
|---|---|---|
| Real Decreto 1112/2018 | webs y apps del sector público | 2018 |
| Ley 11/2023 (Directiva europea de accesibilidad) | comercio electrónico, banca, transporte y otros servicios privados, salvo microempresas | 28 jun 2025 |
| EN 301 549 | referencia técnica; remite a WCAG 2.1 AA | — |

La versión más reciente es **WCAG 2.2 (2023)**. Diseñar para **AA de WCAG 2.2** cubre lo que piden estas normas.

## 3. Los 4 principios (POUR) y niveles
| Principio | Significa | Ejemplos |
|---|---|---|
| **Perceptible** | Se puede ver u oír | textos alternativos, subtítulos, contraste |
| **Operable** | Se puede manejar | todo con teclado, tiempo suficiente, sin destellos |
| **Comprensible** | Se entiende | lenguaje claro, errores explicados, comportamiento previsible |
| **Robusto** | Funciona con cualquier tecnología | HTML correcto, nombres que entienda el lector de pantalla |

Niveles: **A** = mínimo imprescindible · **AA** = el que exige la ley y el que se aplica por defecto · **AAA** = el más exigente, para casos concretos.

## 4. Perfiles de usuario

### Personas ciegas (lector de pantalla)
Usan VoiceOver (Apple), TalkBack (Android), NVDA (Windows, gratuito). Navegan con teclado o gestos, saltando de título en título, enlace en enlace o campo en campo.
- **Necesitan:** imágenes con alt, botones y campos con nombre claro, títulos ordenados h1/h2/h3, nada que dependa solo de lo visual.
- **Sí:** describir imágenes y dar transcripción de vídeo · composición lineal y lógica · HTML5 semántico · pensar para solo teclado · enlaces y títulos descriptivos.
- **No:** información solo en imagen o vídeo · contenido desparramado por la página · usar tamaño/posición del texto como única estructura · forzar ratón o pantalla · enlaces/títulos poco informativos («pulsa aquí»).

### Personas con baja visión
Amplían pantalla, suben el tamaño de letra del sistema o usan alto contraste. Muchas son personas mayores.
- **Necesitan:** texto que crece al 200 % sin romper nada · contraste ≥ 4,5:1 · no bloquear el zoom · nada importante en letra pequeña.
- **Sí:** buen contraste y tipografía legible · publicar la información en páginas web · combinar color, formas y texto · composición lineal · botones y avisos en su contexto.
- **No:** contraste pobre y letra pequeña · ocultar información en descargables · usar solo color para dar significado · contenido disperso · separar las acciones de su contexto.

### Personas con daltonismo
Ven bien pero confunden colores: sobre todo rojo/verde (deuteranopía, protanopía); mucho más raro azul/amarillo (tritanopía).
- **Necesitan:** el color nunca como única pista · estados con texto o icono además de color · gráficos con etiquetas o texturas · enlaces subrayados.

### Personas sordas o con pérdida auditiva
Leen subtítulos y transcripciones; muchas usan lengua de signos y el texto escrito es su segunda lengua.
- **Necesitan:** vídeos con subtítulos · transcripción · avisos visuales, no solo sonoros · otra vía además del teléfono (chat o formulario).
- **Sí:** términos sencillos · subtítulos/transcripciones · diseño lógico y lineal · dividir contenido con subtítulos, imágenes y vídeos · permitir elegir la vía de comunicación preferida.
- **No:** expresiones idiomáticas o regionalismos · contenido solo en audio o vídeo · diseños y menús complejos · largos bloques de texto · el teléfono como único contacto.

### Personas con movilidad reducida
Usan solo teclado, pulsador, control por voz o ratón con la cabeza. Cada acción les cuesta más.
- **Necesitan:** todo con teclado · zonas pulsables grandes y separadas (icono de 24 dp con zona táctil de 48) · gestos simples o con alternativa · tiempo suficiente, sin cuentas atrás.
- **Sí:** acciones y enlaces grandes · distancia entre campos · diseñar para teclado o voz únicamente · pensar en móvil y táctil · ofrecer atajos.
- **No:** exigir precisión · agrupar interacciones juntas · contenido dinámico con mucho recorrido de ratón · caducidades breves de tarea · exigir demasiada información y desplazamiento en pantalla.

### Discapacidad cognitiva, dislexia y TDAH
Les cuesta más leer, recordar o concentrarse; una pantalla cargada les hace abandonar.
- **Necesitan:** frases cortas y palabras de uso diario · un paso cada vez con progreso visible · lo mismo siempre en el mismo sitio · sin animaciones ni distracciones.
- **Dislexia · Sí:** imágenes y diagramas de apoyo · texto alineado a la izquierda y estructura consistente · otros formatos (audio/vídeo) · contenido breve, claro y simple · permitir cambiar el contraste fondo/texto.
- **Dislexia · No:** bloques densos · subrayar, cursivas o mayúsculas · obligar a recordar cosas de páginas anteriores (mejor recordatorios) · exigir ortografía perfecta (mejor autocorrector/sugerencias) · demasiada información en un sitio.

### Personas con autismo
- **Sí:** colores simples · términos sencillos · oraciones simples y viñetas · botones descriptivos · diseños simples y consistentes.
- **No:** colores brillantes y contrastantes · expresiones idiomáticas o regionalismos · textos demasiado largos · botones vagos e impredecibles · diseños complejos y recargados.

### Personas con ansiedad
- **Sí:** dar tiempo suficiente para completar una acción · explicar qué ocurrirá después · dejar clara la información importante · dar la ayuda necesaria · permitir **revisar las respuestas antes de enviarlas**.
- **No:** meter prisa o poner límites de tiempo poco realistas · dejar confusos los siguientes pasos o plazos · dejar inseguros sobre las consecuencias de una acción · dificultar el acceso al soporte · dejar dudando de qué se respondió.

> Los «Sí / No» proceden de los carteles de accesibilidad del Home Office británico (CC BY-NC-SA 4.0), traducidos al español por Tamara López Breit.
