// Parámetros centrales de ECHO//VOID.
// Todo número que cambie la sensación de juego vive aquí y no repartido por el código.

const deg = Math.PI / 180;

export const CONFIG = {
  render: {
    targetHeight: 144, // filas internas (192×144 en 4:3; en pantallas anchas se ensancha)
    fov: 66, // campo de visión vertical, en grados
    near: 0.08,
    far: 340,
    fogColor: 0x0c0d11,
    fogDensity: 0.0145,
    background: 0x08090d,
    shadowMapSize: 2048,
    shadowExtent: 58, // metros alrededor del jugador que reciben sombras
    vignette: 0.62,
    grain: 0.05,
    edge: 0.1, // brillo de las siluetas (contornos por profundidad)
  },
  player: {
    radius: 0.3, // media anchura de la caja del jugador
    height: 1.75,
    eye: 1.6,
    speed: 6.2,
    groundAccel: 70,
    airAccel: 24,
    airDrag: 6, // frenado en el aire cuando no se pulsa nada
    jumpSpeed: 8.3,
    gravity: 23,
    maxFall: 38,
    jumpCut: 0.55, // soltar ESPACIO en la subida acorta el salto
    coyoteTime: 0.12,
    jumpBuffer: 0.13,
    stepHeight: 0.55,
    fallDepth: 24, // metros por debajo del último punto de control = caída al vacío
  },
  camera: {
    sensitivity: 0.0022,
    pitchLimit: 88 * deg,
    stepSmoothing: 16,
  },
  observation: {
    halfAngle: 26 * deg, // radio del cono de la mirada
    range: 80,
    materializeTime: 0.22, // segundos de 0 a 1 al mirar
    forgetDelay: 0.45, // segundos que una estructura aguanta sin ser mirada
    fadeTime: 0.55, // segundos de 1 a 0 al olvidarse
    solidOn: 0.5, // presencia a partir de la que se puede pisar
    solidOff: 0.18, // presencia por debajo de la que deja de sostener
  },
  echoes: {
    duration: 5,
    max: 2,
    warnTime: 1.5, // el eco parpadea estos últimos segundos
    range: 48,
    aimAssist: 4 * deg,
  },
  physics: {
    step: 1 / 120,
    maxSteps: 10,
  },
  audio: {
    volume: 0.8,
  },
};
