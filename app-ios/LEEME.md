# Peak. para iPhone

La app de iPhone es la misma Peak. de la web (https://dubooy.github.io/dtrack/beta/)
dentro de una app hecha con Capacitor. Se sigue actualizando sola: cada cambio que
se sube a main lo ve la app la próxima vez que la abres, sin pasar por Apple.

Lo que cambia frente a la web:
- La barra de abajo es la de Apple (`UITabBar`), así que en iOS 26 sale con el
  Liquid Glass de verdad. La web esconde la suya (`html.nativo`).
- Entrar con Google se abre con iOS y vuelve a la app por `peak://login`.
- El código nativo está en `ios/App/App/AppDelegate.swift` (`PeakViewController`).

## Una sola vez: en Supabase

Authentication → URL Configuration → Redirect URLs → añade `peak://login`.
Sin esto, entrar con Google desde la app no vuelve. Con el correo funciona igual.

## Cómo se consigue el .ipa (sin Mac)

GitHub lo compila solo en un Mac en la nube cada vez que cambia `app-ios/`
(también a mano: Actions → «App de iPhone» → Run workflow). Al acabar, en esa
ejecución, abajo en «Artifacts», está **Peak-iPhone**: se descarga un .zip con
`Peak.ipa` dentro.

## Cómo se instala en tu iPhone (gratis, desde Windows o Mac)

1. Instala **iTunes** (la versión de la web de Apple, no la de la Microsoft Store)
   y **Sideloadly** (sideloadly.io) en el ordenador.
2. Conecta el iPhone con el cable y dale a «Confiar en este ordenador».
3. Abre Sideloadly, arrastra `Peak.ipa`, pon tu Apple ID y dale a Start.
4. En el iPhone: Ajustes → General → VPN y gestión de dispositivos → tu Apple ID →
   Confiar. Y activa Ajustes → Privacidad y seguridad → Modo de desarrollador
   (pide reiniciar).

Con una cuenta de Apple gratis la app caduca a los **7 días**: se vuelve a
instalar igual con Sideloadly (los datos no se pierden, viven en tu cuenta).
Con la cuenta de desarrollador de Apple (99 €/año) dura un año y se puede subir
a TestFlight y a la App Store.

## Para tocarlo

- `npm install` y `npx cap copy ios` copian `www/` y la configuración al proyecto.
- `capacitor.config.json` → `server.url` es la web que carga la app.
