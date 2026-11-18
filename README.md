# herdr-mod-claude-usage

Barra de [Herdr](https://herdr.dev) que muestra el consumo de tu suscripción de Claude: el porcentaje usado de la ventana de **5 horas** y de la de **7 días**, con el tiempo hasta que se reinicia.

- Verde por debajo de 60 %, amarillo hasta 85 %, rojo desde 85 %.
- Si el dato tiene más de 30 minutos, lo marca como desactualizado.
- Si una ventana ya se reinició, muestra `–` hasta que llegue un dato nuevo.

## Cómo funciona

Claude Code ejecuta el comando `statusLine` de tu `settings.json` y le pasa por stdin un JSON de la sesión. Para cuentas con suscripción incluye `rate_limits.five_hour` y `rate_limits.seven_day` (`used_percentage` y `resets_at`). El script `scripts/herdr-usage-statusline.js` guarda esos valores en `~/.config/herdr-app/data/claude-usage.json` y **no imprime nada**. El mod lee ese archivo cada 5 segundos y dibuja la barra.

## Requisitos

- Herdr app y Node.js (para el script).
- Cuenta de Claude con suscripción (Pro, Max o Ultra). Con API key no hay `rate_limits`.
- Claude Code con `statusLine` (la documentación no indica desde qué versión aparecen los límites; se probó con la 2.1.327).

## Instalación

**1. El mod**

```sh
cp -R mods/claude-usage ~/.config/herdr-app/mods/
```

**2. El script**

```sh
cp scripts/herdr-usage-statusline.js ~/.claude/herdr-usage-statusline.js
```

**3. Claude Code: agrega el `statusLine` a `~/.claude/settings.json`** con la ruta absoluta de tu máquina:

```json
"statusLine": {
  "type": "command",
  "command": "node \"C:/Users/<tu-usuario>/.claude/herdr-usage-statusline.js\""
}
```

En macOS/Linux: `"node \"/home/<tu-usuario>/.claude/herdr-usage-statusline.js\""`. Usa `/` también en Windows.

**4. Herdr: agrega la barra a tu layout.** Los layouts que trae Herdr son de solo lectura, así que clona el tuyo primero:

```sh
herdr-app do layout.clone '{"name":"main","as":"my-layout"}'   # omite si ya tienes uno propio
```

En `~/.config/herdr-app/layouts/<tu-layout>.json`, dentro de la columna que contiene el bloque `workspace-status` (la barra del fondo), agrega después de él:

```json
{
  "id": "claude-usage",
  "type": "block",
  "content": { "mod": "claude-usage" },
  "size": { "px": 26 }
}
```

**5. Comprueba:** `herdr-app check ~/.config/herdr-app/mods/claude-usage`. Los datos aparecen después de la primera respuesta en una sesión de Claude Code; antes la barra dice "No usage data yet".

## Qué modificar para que funcione en tu setup

1. **Ya tienes un `statusLine`.** Claude Code admite uno solo. Llama a este script desde el tuyo pasándole el mismo stdin, por ejemplo en un script de shell: `input=$(cat); echo "$input" | node ~/.claude/herdr-usage-statusline.js; echo "$input" | tu-script`.
2. **Herdr en otra carpeta.** El script escribe en `~/.config/herdr-app/data/claude-usage.json` (constante `OUT` en el script) y el mod lee `appHome()/data/claude-usage.json`. Si usas `HERDR_APP_HOME`, cambia `OUT`.
3. **Umbrales y colores.** En `mods/claude-usage/main.js`: `60` y `85` (amarillo y rojo), `STALE` (1800 s) y el ancho de la barra (90 px).
4. **Altura.** 26 px en el bloque del layout.

## Limitaciones

- Solo se actualiza mientras hay una sesión de Claude Code activa; sin ninguna, queda el último valor, marcado como desactualizado.
- No aparece hasta la primera respuesta de la sesión, ni en sesiones con API key.
- Si Claude Code no entrega `rate_limits`, el archivo no se crea y la barra no muestra datos.
- Probado en Windows.

## Licencia

MIT, ver `LICENSE`.
