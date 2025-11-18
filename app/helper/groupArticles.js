// Classifica articles per any escolar i trimestre
export default function groupArticles(articles) {
    // const today = new Date();

    // PER PROVES, farem que la data actual sigue el 20 de febrer de 2026
    const today = new Date(2026, 1, 20);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    // Determinar l'any escolar actual
    let currentSchoolYearStart = currentYear;
    if (currentMonth < 8) { // Si és gener-agost (0-7), estem a l'any escolar anterior
        currentSchoolYearStart -= 1;
    }
    const currentSchoolYearEnd = currentSchoolYearStart + 1;

    // Per a l'ordenació trimestral (trimestre 1: set-des, trimestre 2: gen-mar, trimestre 3: abr-jun)
    const quarters = {
        '1r trimestre': [], // setembre - desembre
        '2n trimestre': [], // gener - març
        '3r trimestre': [], // abril - juny
    };
    const otherYears = [];

    for (const article of articles) {
        const pubDate = new Date(article.data_publicacio);
        const pubYear = pubDate.getFullYear();
        const pubMonth = pubDate.getMonth();

        // 1. Detecció d'any escolar
        let isThisYear = false;
        if (pubYear === currentSchoolYearStart && pubMonth >= 8) { // setembre-desembre de l'inici de l'any escolar
            isThisYear = true;
        } else if (pubYear === currentSchoolYearEnd && pubMonth < 8) { // gener-agost de l'any següent
            isThisYear = true;
        }

        if (!isThisYear) {
            otherYears.push(article);
            continue;
        }

        // 2. Classificació trimestral (dins de l'any escolar actual)
        if (pubMonth >= 8 && pubMonth <= 11) { // setembre (8) a desembre (11)
            quarters['1r trimestre'].push(article);
        } else if (pubMonth >= 0 && pubMonth <= 2) { // gener (0) a març (2)
            quarters['2n trimestre'].push(article);
        } else if (pubMonth >= 3 && pubMonth <= 5) { // abril (3) a juny (5)
            quarters['3r trimestre'].push(article);
        }
        // Note: juliol i agost (6, 7) són vacances i no es publiquen articles, si n'hi ha, caurien aquí si no els tractem.
    }

    const totalResultsThisYear = quarters['1r trimestre'].length + quarters['2n trimestre'].length + quarters['3r trimestre'].length;
    const totalResultsOtherYears = otherYears.length;

    return {
        thisYear: quarters,
        otherYears: otherYears,
        totalResultsThisYear: totalResultsThisYear,
        totalResultsOtherYears: totalResultsOtherYears
    };
}