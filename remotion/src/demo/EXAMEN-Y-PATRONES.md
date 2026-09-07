# DemoSaaS · examen del video + patrones de ~150 demos de SaaS/agentes IA (5-sep-2026)

Método: (1) examen del MP4 actual con tira de 40 fotogramas (uno cada 2 s), auditoría de
audio frame a frame y las tablas del guion; (2) investigación web sobre ~150 videos de
lanzamiento/demo referenciados en rankings por vistas y desgloses cuantificados
(forkoff 30, advids 30+17, demosmith 22, vidico 12+10, superside 16, arcade 10,
yansmedia 10, Manus vs Genspark) más un dataset de 1,95 M de clips para ganchos (opus.pro);
(3) cruce: qué patrones ya cumplimos, cuáles faltan y cómo aplicarlos en Remotion.

## 1. Examen del video actual (v11, 80 s)

**Lo que ya está bien y coincide con lo que funciona afuera**
- Diseñado para verse sin sonido: texto cinético, sin voz en off (80–85 % del B2B se ve en mute).
- UI real, no ilustrada; un solo acento de color; blanco generoso; cursor con easing exagerado
  (la escuela Linear/Raycast); 80 s dentro del rango 60–90 s de tope de embudo.
- CTA específico («Escríbenos al WhatsApp») y pie honesto («0/10»).
- Sincronía verificada; sonido reducido a música + tecleo, limpio.

**Lo que el examen encuentra**
1. **Sin gancho ni problema en los primeros 5 s.** 0–1,9 s logo · 1,7–2,9 s login · 2,9–4,7 s
   pantalla en blanco escribiéndose · dashboard a los 4,9 s. La tesis («Ningún veterinario
   debería volver a escribir una ficha») aparece solo al final. Los datos van al revés: el
   problema/promesa debe caer en 1–3 s y la UI antes de 4 s; abrir con logo es el antipatrón
   más citado.
2. **~6 s de pantalla casi vacía** repartidos en los 9 interludios: cada uno tiene ~20 frames
   (fade a nieve 8 + espera del primer carácter 4–5 + vuelta 8) sin nada que leer. En la
   tira, 4 de 40 fotogramas son nieve con un caret (3 s, 25 s, 39 s, 41 s).
3. **El momento mágico está escondido.** Athos redactando la nota SOAP sucede detrás del
   interludio 39–41 s: la nota aparece ya terminada. El 86 % de los lanzamientos top muestran
   la velocidad con la UI cambiando a hipervelocidad ante cámara.
4. **Plano general demasiado tiempo.** 11 de 40 fotogramas son la app completa con sidebar y
   el sujeto pequeño; los zooms llegan a 1,3–1,4 solo en 4 momentos. Los mejores recortan
   agresivamente (85–100 % abstraen o recortan la UI).
5. **El cierre por pares va demasiado rápido para verse.** Cada pantalla de app entre
   interludios dura 27 frames menos 16 de fades = ~0,4 s totalmente visible (el fotograma de
   73 s cae en pleno fade). El texto se lee; la pantalla que lo prueba, no.
6. **Sin «antes» ni resultado explícito.** No hay contraste antes/después ni un beat de
   «esto ya quedó hecho» antes del cierre; 71 % de los top prueban ROI con un
   caos→orden visual y cierran con resultado.
7. **Un solo CTA, al segundo 79.** Los CTA a mitad de video convierten 16,95 % vs 10,98 %
   al final; no hay handle/marca persistente hasta el último segundo.
8. **Cortes fuera del beat.** La pista va a 120 BPM (golpe cada 15 frames, en f = 9 + 15k) y
   los interludios arrancan en 88, 140, 696, 1170… ninguno alineado. 86 % de los top
   sincronizan la tipografía cinética al beat.
9. **Un solo formato.** 16:9 de 80 s. Los que rinden shippean 4+ formatos (9:16, 1:1,
   cortes de 15/30 s) desde el mismo master; en LinkedIn 15–30 s gana en completion.

## 2. Patrones que se repiten en los ~150 videos

| Patrón | Evidencia | Nosotros hoy |
|---|---|---|
| Problema/promesa en 1–3 s, UI antes de 4 s | 71 % muestran la UI en <4 s; hooks de 1–3 s; «problem-first» gana a «feature-first» en todas las métricas | Logo → login → dashboard a 4,9 s ✗ |
| «Caos antes del orden» | 71 % abren con caos visual <4 s; 71 % prueban ROI con muchos sistemas → uno | Sin «antes» ✗ |
| Hipervelocidad de la UI para mostrar tiempo ahorrado | 86 % | Transcripción sí; nota SOAP no ✗ |
| Recorte/abstracción de la UI (zoom a un componente, blur del resto) | 85–100 % | Parcial ✗ |
| Push-in continuo en Z (macro → micro) en vez de cortes | 57–71 % | Cámara sí; interludios son fade a blanco ✗ |
| Tipografía cinética sincronizada al beat | 86 % | Tipografía sí, beat no ✗ |
| Silent-first, texto grande, sin voz | 80–85 % ven en mute; los mejores sin VO (Apple WWDC, DoorDash 30 s) | ✓ |
| Un trabajo por video (single job-to-be-done) | Micro-demos de 30–60 s superan a tours 40–60 % en leads | Tour completo (por diseño) — falta la familia de cortos ✗ |
| Resultado + CTA específico al final; CTA también a mitad | Mid-roll 16,95 % vs post-roll 10,98 %; «Try free» > «Learn more» | CTA final ✓, mid-roll ✗ |
| Cara humana < 20 % del tiempo en software | 57 % | 0 % ✓ (el founder va en los cortos verticales) |
| 4+ formatos del mismo master | 3,4× tiempo de visualización agregado | Solo 16:9 ✗ |
| Producto real trabajando, no alguien describiéndolo | Los 30 más vistos: «the product working, not a founder describing it» | ✓ |
| Presentación mata producto | Manus 700 K vistas vs Genspark 32 K con mejor producto y peor video | — |

## 3. Qué aplicar (prioridad por impacto ÷ esfuerzo)

1. **Reordenar el arranque (0–5 s).** Frase-gancho tipo pregunta o promesa en el segundo 0
   («¿Cuánto de tu consulta se te va escribiendo la ficha?» → «Con Athos, nada.») con el
   logo pequeño encima como sello, y saltar el login: UI útil a los 3 s. Mantiene la intro
   de marca que pediste, pero en 1 s y con el problema delante.
2. **Mostrar a Athos escribiendo la nota** a hipervelocidad (typewriter de los campos
   S/O/A/P en ~2 s) en vez de revelarla hecha. Es el plano de dinero del video.
3. **Interludios sin pantalla vacía.** Empezar a escribir en el frame 1, fundir la ventana a
   un desenfoque/atenuado (frosted glass) en vez de blanco puro, y traerla de vuelta bajo las
   últimas letras. Quita ~6 s de nada y añade el movimiento que siempre pides.
4. **Cierre por pares: 2 beats por pantalla** (30 frames de app completamente visible) o
   cortes secos sincronizados al beat en vez de fades.
5. **Snapear cortes al beat** (±4 frames a f = 9 + 15k).
6. **Un «antes» de 2 s** con contraste cualitativo (sin cifras inventadas — línea roja):
   «Antes: la ficha la escribías tú, de noche.» → «Ahora la escribe Athos. Tú la firmas.»
7. **Zooms más valientes** (1,5–1,8) con el resto de la UI atenuado en: motivo de consulta,
   transcripción, SOAP, totales de factura, PDF en el chat.
8. **Beat de resultado antes del cierre:** «Consulta terminada. Ficha, informe y factura:
   hechos.» + CTA suave a mitad (handle de WhatsApp en el microrrótulo desde el segundo ~40).
9. **Familia de cortes desde el mismo Remotion:** 9:16 y 1:1, más 3 micro-demos de 30 s
   (Athos escribe la ficha / la factura al WhatsApp / la guarda de alergias) y el corte de
   15 s para LinkedIn. El founder en cámara va en los verticales, no en el master.

## 4. Estado (6-sep)

Aplicados en la pasada 6 (ver `NOTAS.md` → Revisión 6): 1 (arranque con gancho, sin
login, UI a 1,7 s), 2 (nota SOAP escribiéndose ante cámara), 3 (crossfades, cero nieve
vacía), 4 (cierre a corte seco, 30 frames por pantalla), 5 (cortes al beat), 6 («antes»
en la banda de ATHOS REDACTA), 7 (zooms 1.16–1.28 + viñeta), 8 (beat de resultado +
CTA en la barra desde el segundo 40).
Pendiente: 9 — familia de formatos (9:16, 1:1, micro-demos de 30 s, corte de 15 s).

## Fuentes
forkoff (30 lanzamientos por vistas) · advids (30 lanzamientos; 17 software) · demosmith (22 demos) ·
vidico (12 demos; 10 LinkedIn ads) · superside (16 B2B) · arcade (10 AI launches) · yansmedia (10 sin VO) ·
ngram (best practices + CTA data) · Wistia State of Video · opus.pro (1,95 M clips) · studiomaydit
(estética Linear/Vercel/Raycast) · whytryai (Manus vs Genspark) · Cluely (postbeam, viral.app, cluely.com/blog).
