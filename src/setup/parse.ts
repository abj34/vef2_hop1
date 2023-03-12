import { readFile as fsReadFile } from 'fs/promises';

/**
 * Les línu og skilar námskeiði úr CSV skrá
 * @param line Lína úr CSV skrá
 * @param depId Id á deild sem námskeiðið tilheyrir
 * @returns Námskeiðið eða null ef línan er ógild
 */
/*function parseLine(line: string, depId: number): Omit<Course, 'id'> | null {
    const [
        id,
        title,
        lineUnits,
        lineSemester,
        lineLevel,
        lineUrl,
    ] = line.split(';');

    // Skoðar hvort units sé með rétt gildi (tala)
    const formattedUnits = (lineUnits ?? '').replace(/\./g, '').replace(',', '.');
    const courseUnits : number = Number.parseFloat(formattedUnits);

    // Skoðar hvort semester sé með rétt gildi
    const semesterList : string[] = ['Vor', 'Sumar', 'Haust', 'Heilsárs'];
    const courseSemester : 
        string | null = lineSemester === undefined || 
        !semesterList.includes(lineSemester) ? null : lineSemester;


    // Skoða hvort það vanti eitthvað gildi
    if (!id || !title || !courseSemester) {
        console.warn('missing required properties', {
            id: Boolean(id),
            title: Boolean(title),
            semester: Boolean(courseSemester),
        });
        return null;
    }
    
    // Býr til námskeiðið
    const result : Omit<Course, 'id'> = {
        course_id: id,
        title,
        units: courseUnits,
        semester: courseSemester,
        level: lineLevel,
        url: lineUrl,
        department_id: depId
    }

    // Skilar námskeiðinu
    return result;
}*/


/**
 * Þýðir CSV skrá í lista af námskeiðum
 * @param {string} data Gögn úr CSV skrá
 * @returns {Array<Course>} Listi af námskeiðum
 */
export function parseCSV(data: string, depId: number) {
    if (!data) { return []; }
  
    const courses = [];
    const lines = data.split('\n').slice(1);
  
    for (const line of lines) {  
        const parsed = parseLine(line, depId);
        if (parsed) {
            courses.push(parsed);
        } else {
            //console.warn(`error parsing line`, { line });
        }
    }
  
    return courses;
}


/**
 * Les skrá og skilar innihaldi
 * @param {string} file Skrá sem á að lesa
 * @returns {Promise<string | null>} Innihald skráar eða `null` ef ekki tókst að lesa
 */
export async function readFile(
    file : string, encoding: BufferEncoding = 'utf-8') : Promise<string | null> {
        
    try {
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unused-vars
        const content = await fsReadFile(file, { encoding });
        return content.toString();
    } catch (e) {
        return null;
    }
}