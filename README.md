# 🐾 Sociedad Patitas — Pre-Entrega 6

Simulador de solicitud de adopción de **Sociedad Patitas**.
Curso de JavaScript · Carrera de Desarrollo de Aplicaciones · Coderhouse.

## Estructura

```
sociedad-patitas-js/
├── index.html      # enlaza el CSS y el script con defer
├── css/
│   └── styles.css  # estilos de la página
├── js/
│   └── main.js     # toda la lógica del simulador
└── README.md
```

Vinculación en el `<head>` del HTML:

```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/main.js" defer></script>
```

## Cómo se usa

1. Abrir `index.html` en el navegador.
2. Abrir la consola con `F12` → pestaña **Console**.
3. Elegir una opción del menú en las ventanas emergentes.

## Correcciones arrastradas de devoluciones anteriores

- La función `buscarRescatado`, que en la Pre-Entrega 4 estaba declarada dos
  veces, ya no existe: la reemplazó `buscarPorNombre()` con `find()`.
- Los `for...of` que recorrían la lista se reemplazaron por `forEach`, `map` y
  `filter`, que es la forma moderna de hacer lo mismo. Se conserva un `for`
  clásico en el cuestionario, donde sí hace falta el índice y poder cortar
  antes de terminar (un `forEach` no se puede frenar con `break`).

## Qué se agregó en esta entrega

La Pre-Entrega 5 ya tenía el array de objetos, pero se recorría siempre con
`for...of` y bucles escritos a mano. Ahora ese mismo array se consulta con
**funciones de orden superior**, y además el simulador arranca con un menú:
el usuario decide qué quiere hacer y el programa ejecuta el método que
corresponde.

```
🐾 Sociedad Patitas

1 - Consultar el refugio
2 - Iniciar una solicitud de adopción
3 - Salir
```

## El array de objetos

Las instancias de la clase `Rescatado` se guardan juntas en un array. Ese
array es la "base de datos" sobre la que trabajan todos los métodos:

```js
const rocco = new Rescatado("Rocco", "macho",  3, "grande", 3, 25000);
const luna  = new Rescatado("Luna",  "hembra", 2, "chico",  1, 12000);
// ...

const rescatados = [rocco, luna, rescatadoSinNombre, nube, tobias];
```

Cada objeto tiene **10 propiedades**: `nombre`, `sexo`, `edad`, `tamanio`,
`puntosViviendaMinimos`, `costoMensual`, `reservado`, `reservadoPor`,
`adoptado` y `adoptadoPor`. Las seis primeras llegan por parámetro al
`constructor`; las cuatro últimas arrancan en `false` y `""` y cambian cuando
se ejecuta `reservar()` o `adoptar()`.

> `costoMensual` es nuevo en esta entrega: es lo que cuesta mantener a ese
> perro por mes (comida + veterinario) y es el dato que suma `reduce`.
> Los montos son inventados, sirven solo para el ejercicio.

## Los métodos de orden superior

### Métodos de búsqueda

| Método | Dónde se usa | Qué devuelve |
|---|---|---|
| `forEach()` | `mostrarInforme()` — recorre e imprime cada rescatado | Nada |
| `find()` | `buscarPorNombre()` — opción 2 del panel, el bautizo y la elección al adoptar | El primer objeto que coincide, o `undefined` |
| `filter()` | `filtrarCompatibles()`, `filtrarCachorros()`, filtros por sexo | Un array nuevo |
| `some()` | `hayDelSexo()`, `hayCachorros()` — opción 4 del panel | `true` o `false` |

```js
// find → traer un rescatado puntual
function buscarPorNombre(lista, nombre) {
  const buscado = nombre.trim().toLowerCase();
  return lista.find((rescatado) => rescatado.nombre.toLowerCase() === buscado);
}

// filter → dos filtros encadenados: que entre en esa vivienda
// y que no esté ya reservado por otra persona
function filtrarCompatibles(lista, puntosVivienda) {
  return lista
    .filter(crearFiltroPorVivienda(puntosVivienda))
    .filter(estaLibre);
}

// some → saber si existe al menos uno, sin recorrer de más
function hayCachorros(lista) {
  return lista.some((rescatado) => rescatado.esCachorro());
}
```

`find()` reemplazó al `buscarRescatado` de la entrega anterior, que armaba un
array auxiliar de nombres para poder usar `includes()` e `indexOf()`. Con
`find()` la búsqueda se hace directamente sobre los objetos y además devuelve
el objeto entero, no una posición.

### Métodos de transformación

| Método | Dónde se usa | Qué devuelve |
|---|---|---|
| `map()` | `transformarEnTextos()` — etiquetas de jaula, listas de nombres, textos de los `alert` | Un array nuevo del mismo largo |
| `reduce()` | `calcularCostoMensual()`, `calcularEdadPromedio()`, `contarPorTamanio()` y el rescatado más costoso | Un único valor |

```js
// map → N objetos entran, N textos salen
const etiquetas = rescatados.map(etiquetaDeJaula);

// reduce → todos los elementos se combinan en un solo número
function calcularCostoMensual(lista) {
  return lista.reduce((acumulador, rescatado) => acumulador + rescatado.costoMensual, 0);
}

// reduce → el acumulador también puede ser un objeto: { chico: 3, mediano: 2 }
function contarPorTamanio(lista) {
  return lista.reduce((conteo, rescatado) => {
    if (conteo[rescatado.tamanio] === undefined) {
      conteo[rescatado.tamanio] = 0;
    }

    conteo[rescatado.tamanio] = conteo[rescatado.tamanio] + 1;
    return conteo; // con llaves {} el return va escrito
  }, {});
}
```

**Inmutabilidad:** ni `map`, ni `filter`, ni `reduce` modifican el array
original. Por eso el panel de consultas puede filtrar todas las veces que
haga falta sin perder rescatados. Los que sí modifican la lista son `push`,
`unshift`, `pop` y `splice`, y se usan solo cuando el refugio realmente cambia
(entra un animal, alguien lo adopta).

## Funciones de orden superior propias

Además de los métodos del array, el simulador define sus propias funciones de
orden superior.

### Una función que retorna otra función (fábrica + closure)

En vez de escribir un filtro para las hembras y otro para los machos, se
fabrica el filtro que haga falta. La función interna sigue recordando el
parámetro `sexo` aunque la externa ya terminó de ejecutarse: eso es un
**closure**.

```js
function crearFiltroPorSexo(sexo) {
  return (rescatado) => rescatado.sexo === sexo;
}

const esHembra = crearFiltroPorSexo("hembra");
const esMacho  = crearFiltroPorSexo("macho");

rescatados.filter(esHembra); // [Nina, Luna, Pelusa, Nube]
rescatados.some(esMacho);    // true
```

`crearFiltroPorVivienda(puntosVivienda)` funciona igual, pero el filtro que
fabrica invoca el método `esCompatibleCon()` de cada objeto.

### Una función que recibe otra función (callback)

`mostrarInforme` no sabe **cómo** se muestra cada rescatado: eso lo decide la
función que le pasan por parámetro.

```js
function mostrarInforme(titulo, lista, formatear) {
  console.log(titulo + " (" + lista.length + ")");

  lista.forEach((rescatado, indice) => {
    console.log("   " + (indice + 1) + ". " + formatear(rescatado));
  });

  return lista.length;
}

mostrarInforme("Hembras disponibles", hembras, soloNombre);
mostrarInforme("Ficha completa", rescatados, fichaCompleta);
mostrarInforme("Etiquetas", rescatados, etiquetaDeJaula);
```

Los tres formateadores (`soloNombre`, `fichaCompleta`, `etiquetaDeJaula`) son
funciones flecha que también se le pasan a `map`.

## El panel de consultas

Cada opción ejecuta un método distinto sobre el array, según lo que pida
la persona:

| Opción | Qué hace | Método |
|---|---|---|
| 1 | Ver la lista completa de rescatados | `forEach` |
| 2 | Buscar un rescatado por su nombre | `find` |
| 3 | Ver los que se adaptan a mi vivienda | `filter` |
| 4 | ¿Hay cachorros o hembras disponibles? | `some` (+ `filter` para el detalle) |
| 5 | Imprimir las etiquetas de las jaulas | `map` |
| 6 | Informe mensual del refugio | `reduce` |
| 7 | Volver al menú principal | — |

Ejemplo de lo que muestra la opción 6 por consola:

```
📈 Informe mensual del refugio (reduce)
   Rescatados a cargo: 6
   Gasto mensual total: $100.000
   Edad promedio: 2.7 años
   Conteo por porte: { chico: 3, grande: 1, mediano: 2 }
   El que más cuesta mantener es Rocco ($25.000).
```

Si después alguien adopta, el mismo informe cambia solo, porque se recalcula
sobre el array actualizado.

## La solicitud de adopción

Todo el circuito de la Pre-Entrega 5 sigue funcionando, ahora dentro de la
función `procesarSolicitud()` para que el menú pueda invocarlo:

1. Valida el nombre y la edad (máximo 3 intentos cada uno) y rechaza a
   menores de 18.
2. Pide el tipo de vivienda → de 1 a 3 puntos.
3. Crea la instancia de `Solicitud` con `new`.
4. Recorre el cuestionario de 5 preguntas → `sumarPuntos(2)` por cada "sí".
5. `evaluar()` clasifica el puntaje sobre 13:
   - **11 a 13** → APROBADA
   - **7 a 10** → PREAPROBADA (con visita de seguimiento)
   - **0 a 6** → RECHAZADA
6. Si `fueAceptada()`, `filter` arma la lista de compatibles **y libres**, y
   `find` localiza al elegido. Después depende del estado:
   - **APROBADA** → `adoptar()` y `splice` lo retira de la lista.
   - **PREAPROBADA** → `reservar()`: queda apartado a su nombre, sigue en el
     refugio y deja de aparecer como disponible para otras personas.

## Verificación por consola

Apenas se abre la página, antes del menú, el script comprueba las clases y
cada método de orden superior:

```
--- Verificación de las funciones de orden superior ---
find('luna') → Rescatado { nombre: 'Luna', sexo: 'hembra', ... }
filter(esHembra) → [ 'Luna', 'Sin nombre', 'Nube' ]
some(hay hembras) → true
some(hay cachorros) → true
map(soloNombre) → [ 'Rocco', 'Luna', 'Sin nombre', 'Nube', 'Tobías' ]
reduce(costo mensual) → $90.000
reduce(edad promedio) → 3.6 años
reduce(conteo por porte) → { grande: 1, chico: 2, mediano: 2 }
El array original sigue intacto: 5 rescatados.
```

## Resto de las funciones

### Entrada de datos

| Función | Parámetros | Retorna |
|---|---|---|
| `pedirTexto` | `mensaje`, `largoMinimo` | El texto validado, o `""` si falla |
| `pedirNumeroEntero` | `mensaje`, `minimo`, `maximo` | El número validado, o `0` si falla |
| `pedirRespuestaSiNo` | `pregunta`, `numero`, `total` | `"si"`, `"no"` o `""` |
| `pedirVivienda` | — | El objeto `{ nombre, puntos }` |

### Procesamiento

| Función | Tipo | Retorna |
|---|---|---|
| `obtenerVivienda` | Declarada | Un objeto literal `{ nombre, puntos }` |
| `clasificarSolicitud` | **Expresada** | El estado de la solicitud |
| `obtenerRecomendacion` | Declarada | Texto con la recomendación |
| `esAfirmativa`, `esNegativa` | **Flecha** | `true` o `false` |
| `puntosQueFaltan` | **Flecha** | Cuántos puntos faltaron |
| `enPesos` | **Flecha** | El monto con formato `$1.000` |

### Gestión de la lista (métodos que sí modifican el array)

| Función | Método | Qué representa |
|---|---|---|
| `registrarIngreso` | `push` | Llega un rescatado nuevo, al final |
| `registrarUrgencia` | `unshift` | Caso urgente: entra con prioridad |
| `registrarAdopcionDelDia` | `pop` | El último de la lista fue adoptado |
| `retirarDeLaLista` | `indexOf` + `splice` | Sacar al que acaban de adoptar |
