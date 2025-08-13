export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const safeDateString = dateString.replace(/\+00:00$/, 'Z');
    const date = new Date(safeDateString);

    // Formateo de la fecha
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Formateo de la hora
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // El 0 de la medianoche debe ser 12
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${period}`;

    return `${formattedDate}, ${formattedTime}`;
};