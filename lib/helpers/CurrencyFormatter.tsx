// Formateador base para moneda MXN
const defaultFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

// Formateador para montos grandes sin centavos
const wholeFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

// Formateador para montos compactos (ej: 1M, 1K)
const compactFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
});

// Función principal para formatear valores como moneda
export const formatCurrency = (
    value: number | string,
    options: {
        compact?: boolean;
        showDecimals?: boolean;
    } = { showDecimals: true }
): string => {
    // Convertir string a number si es necesario
    const numericValue =
        typeof value === 'string' ? parseFloat(value) : value;

    // Manejar valores no numéricos, indefinidos o nulos
    if (isNaN(numericValue) || numericValue === undefined || numericValue === null) {
        return defaultFormatter.format(0);
    }

    // Para valores muy grandes, usar notación compacta si se solicita
    if (options?.compact && Math.abs(numericValue) >= 1000000) {
        return compactFormatter.format(numericValue);
    }

    // Para valores enteros grandes, omitir decimales si no se solicitan
    if (!options?.showDecimals && Math.abs(numericValue) >= 1000) {
        return wholeFormatter.format(numericValue);
    }

    // Formato estándar para otros casos
    return defaultFormatter.format(numericValue);
};

// Exportar una versión simple para uso rápido
export const toCurrency = (value: number | string): string => formatCurrency(value);

// Formateador para números sin símbolo de moneda
const numberFormatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatNumber = (value: number | string): string => {
    // Convertir string a number si es necesario
    const numericValue =
        typeof value === 'string' ? parseFloat(value) : value;

    // Manejar valores no numéricos, indefinidos o nulos
    if (isNaN(numericValue) || numericValue === undefined || numericValue === null) {
        return numberFormatter.format(0);
    }

    return numberFormatter.format(numericValue);
};

// Exportar un objeto con todos los formateadores para casos específicos
export const CurrencyFormatter = {
    format: formatCurrency,
    short: (value: number | string) => formatCurrency(value, { compact: true }),
    precise: (value: number | string) => formatCurrency(value, { showDecimals: true }),
    number: formatNumber,

    // Método para formatear porcentajes
    percentage: (value: number | string): string => {
        // Convertir string a number si es necesario
        const numericValue =
            typeof value === 'string' ? parseFloat(value) : value;

        // Manejar valores no numéricos
        if (isNaN(numericValue) || numericValue === undefined || numericValue === null) {
            return '0.00%';
        }

        return `${(numericValue * 100).toFixed(2)}%`;
    },
};
