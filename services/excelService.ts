import * as XLSX from 'xlsx';
import { RawRow, TraineeProfile } from '../types';

/**
 * Parses the uploaded Excel file.
 * Logic updated to specific user requirements:
 * 1. Ignore 'Program' and 'Training Stage'.
 * 2. Deduplicate numbers in 'Number of Semesters'.
 * 3. Support separate column for 'Completed'.
 * 4. Correctly parse 'Yes'/'No' (نعم/لا) values.
 * 5. Target specific column headers provided by user.
 */
export const parseExcelData = async (file: File): Promise<TraineeProfile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RawRow>(sheet);

        const trainees = processRawData(jsonData);
        resolve(trainees);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const processRawData = (rows: RawRow[]): TraineeProfile[] => {
  const traineeMap = new Map<string, TraineeProfile>();

  // Columns to explicitly ignore/hide as per user request
  const ignoredColumns = [
    'البرنامج', 'program', 
    'المرحلة التدريبية', 'training stage', 'training_stage'
  ];

  // Helper to fuzzy match keys but prioritize exact matches from the user's list
  const findKey = (row: RawRow, keywords: string[]): string | undefined => {
    const rowKeys = Object.keys(row);
    // Try exact match first
    const exactMatch = rowKeys.find(rk => keywords.includes(rk.trim()));
    if (exactMatch) return exactMatch;

    // Fallback to fuzzy match
    return rowKeys.find(rk => 
      keywords.some(k => rk.trim().toLowerCase().includes(k.toLowerCase()))
    );
  };

  // Helper to normalize Yes/No values (Arabic/English)
  const normalizeStatus = (val: any): string | undefined => {
    if (val === undefined || val === null) return undefined;
    const s = String(val).trim().toLowerCase();
    // Check for Arabic Yes/No and English Yes/No, and also "x" or "check" if user used symbols
    if (['نعم', 'yes', 'y', 'true', '1', 'correct', 'موافق'].includes(s)) return 'Yes';
    if (['لا', 'no', 'n', 'false', '0', 'wrong', 'رفض'].includes(s)) return 'No';
    return undefined;
  };

  rows.forEach(row => {
    // 1. Identify Identity Columns (Updated with specific headers)
    const idKey = findKey(row, ['رقم المتدرب', 'الرقم التدريبي', 'id', 'student_id']);
    const nameKey = findKey(row, ['إسم المتدرب', 'اسم المتدرب', 'name', 'student_name']);

    if (!idKey) return; // Cannot process without ID

    const id = String(row[idKey]).trim();
    const name = nameKey ? String(row[nameKey]).trim() : 'Unknown';

    if (!traineeMap.has(id)) {
      // 2. Capture Student Details
      const details: Record<string, string | number> = {};
      
      // Keywords that indicate a column belongs to a COURSE (to exclude from details)
      const courseKeywords = [
        'إسم المقرر', 'اسم المقرر', 'رمز المقرر', 
        'عدد الوحدات المعتمدة للمقرر', 'الوحدات المعتمدة للمقرر',
        'حالة المقرر/ مستوفى', 'حالة المقرر',
        'course', 'subject', 'grade', 'code', 'credits'
      ];

      // Explicit Student Attributes to capture
      // Based on user provided list: القسم, التخصص, حالة المتدرب, فصل القبول, عدد الفصول, المرشد الأكاديمي, رقم الهاتف الجوال, المعدل التراكمي, وصف المستوى
      const allowedStudentAttributes = [
        'القسم', 'التخصص', 'حالة المتدرب', 'فصل القبول', 'عدد الفصول', 
        'المرشد الأكاديمي', 'رقم الهاتف الجوال', 'المعدل التراكمي', 'وصف المستوى',
        'عدد المقررات المطلوبة للبرنامج', 'عدد الوحدات المعتمده للبرنامج', 
        'عدد المقررات المنجزه للبرنامج', 'عدد الوحدات المنجزه للبرنامج'
      ];

      const excludeKeys = [idKey, nameKey].filter(k => k !== undefined) as string[];

      Object.keys(row).forEach(key => {
        const cleanKey = key.trim();
        const lowerKey = cleanKey.toLowerCase();

        // Skip ID/Name
        if (excludeKeys.includes(key)) return;

        // Skip Blacklisted Columns
        if (ignoredColumns.some(ign => lowerKey.includes(ign))) return;

        // Determine if it's a student detail we want
        // It matches one of our allowed list OR it doesn't look like a course column
        const isAllowed = allowedStudentAttributes.some(k => cleanKey.includes(k));
        const isCourseCol = courseKeywords.some(k => cleanKey.includes(k));

        if (isAllowed || !isCourseCol) {
           let value = row[key];

           // Clean up empty values
           if (value !== undefined && String(value).trim() !== '') {
             
             // Special cleaning for "Number of Semesters" (عدد الفصول)
             if (cleanKey.includes('عدد الفصول')) {
               const valStr = String(value);
               if (/^(\d)\1+$/.test(valStr)) {
                 value = valStr[0];
               }
             }

             details[cleanKey] = value;
           }
        }
      });

      traineeMap.set(id, {
        id,
        name,
        details,
        courses: []
      });
    }

    // 3. Extract Course Data (Updated with specific headers)
    const courseNameKey = findKey(row, ['إسم المقرر', 'اسم المقرر', 'course name']);
    const courseCodeKey = findKey(row, ['رمز المقرر', 'course code']);
    const creditsKey = findKey(row, ['عدد الوحدات المعتمدة للمقرر', 'الوحدات المعتمدة للمقرر', 'الوحدات المعتمدة', 'credits']);
    
    // Explicit columns for specific statuses
    const completedKey = findKey(row, ['حالة المقرر/ مستوفى', 'مستوفي', 'مستوفى']);
    
    // Only add course if we have at least a name or code
    if (courseNameKey || courseCodeKey) {
      const trainee = traineeMap.get(id)!;
      
      const courseName = courseNameKey ? String(row[courseNameKey]).trim() : (courseCodeKey ? String(row[courseCodeKey]) : 'Unknown');
      
      if (courseName && courseName !== 'undefined') {
        const isCompleted = normalizeStatus(completedKey ? row[completedKey] : undefined);
        
        trainee.courses.push({
          courseName,
          courseCode: courseCodeKey ? String(row[courseCodeKey]).trim() : undefined,
          grade: '', // Removed grade column as requested previously
          credits: creditsKey ? row[creditsKey] : undefined,
          isCompleted: isCompleted
        });
      }
    }
  });

  return Array.from(traineeMap.values());
};
