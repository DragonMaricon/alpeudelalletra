// Determina en quin període de temps es va publicar un article
export default function getArticlePeriod(inputDate) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const academicStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;

    const startOfCycle = new Date(academicStartYear, 8, 1);
    const endOfCycle = new Date(academicStartYear + 1, 5, 30);

    if (inputDate < startOfCycle || inputDate > endOfCycle) {
        return "Altre any";
    }

    const month = inputDate.getMonth();
    if (month >= 8 && month <= 11) {
        return "1r trimestre";
    }
    if (month >= 0 && month <= 2) {
        return "2n trimestre";
    }
    if (month >= 3 && month <= 5) {
        return "3r trimestre";
    }

    return "Estiu";
}