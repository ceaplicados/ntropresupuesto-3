// Utilidades para deflactar montos con el INPC.
// Si falta el INPC de algún año no se devuelve NaN: se avisa en consola
// (una vez por año) y quien llama decide no calcular hasta tener los datos.

const aniosAvisados = new Set();

const valorValido = (valor) => typeof valor === 'number' && Number.isFinite(valor) && valor > 0;

// true si el INPC tiene un valor válido para todos los años indicados
export function tieneINPC(inpc, ...anios) {
    // un INPC vacío significa que aún se está cargando: no es un error
    if (!inpc || Object.keys(inpc).length === 0) return false;
    // un año sin definir significa que el componente aún no tiene sus datos
    if (anios.some((anio) => anio === undefined || anio === null)) return false;
    const faltantes = anios.filter((anio) => !valorValido(inpc[anio]));
    faltantes.forEach((anio) => {
        if (!aniosAvisados.has(anio)) {
            aniosAvisados.add(anio);
            console.warn(`INPC: no hay valor para el año ${anio}; no se pueden deflactar montos con ese año.`);
        }
    });
    return faltantes.length === 0;
}

// Convierte un monto de pesos de anioOrigen a pesos de anioDestino.
// Devuelve null si falta el INPC de alguno de los dos años.
export function deflactar(monto, anioOrigen, anioDestino, inpc) {
    if (!tieneINPC(inpc, anioOrigen, anioDestino)) return null;
    return monto * inpc[anioDestino] / inpc[anioOrigen];
}
