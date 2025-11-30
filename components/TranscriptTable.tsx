import React from 'react';
import { CourseRecord } from '../types';
import { BookOpen, Check, X, AlertCircle } from 'lucide-react';

interface TranscriptTableProps {
  courses: CourseRecord[];
}

const TranscriptTable: React.FC<TranscriptTableProps> = ({ courses }) => {
  // Sort courses roughly by semester if possible
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.semester && b.semester) return a.semester.localeCompare(b.semester);
    return 0;
  });

  // Helper to render status icons based on Yes/No
  const renderStatusIcon = (status: string | boolean | undefined, type: 'warning' | 'success') => {
    // Normalize to string for comparison
    const val = String(status).toLowerCase();
    
    if (val === 'yes' || val === 'true') {
      return (
        <div className="flex justify-center">
          <div className={`${type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'} rounded-full p-1`}>
            <Check className="w-4 h-4" />
          </div>
        </div>
      );
    }
    
    if (val === 'no' || val === 'false') {
      return (
        <div className="flex justify-center">
          <div className="bg-red-50 text-red-400 rounded-full p-1">
            <X className="w-4 h-4" />
          </div>
        </div>
      );
    }

    return <span className="text-gray-300">-</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-600" />
          المقررات التدريبية
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded-full text-gray-600">
          عدد المقررات: {courses.length}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-right text-xs">رمز المقرر</th>
              <th className="px-6 py-3 font-medium text-right text-xs">اسم المقرر</th>
              <th className="px-6 py-3 font-medium text-center text-xs">الوحدات المعتمدة للمقرر</th>
              <th className="px-4 py-3 font-medium text-center text-xs w-32 bg-green-50 text-green-800 border-l border-gray-200">
                حالة المقرر/
                <br/>
                مستوفى
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCourses.map((course, index) => {
              const isProject = course.courseName.includes('المشروع الإنتاجي');

              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 font-mono text-gray-500 font-bold whitespace-nowrap">
                    {course.courseCode || '-'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {course.courseName}
                    {isProject && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 shadow-sm w-fit">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        هذا المقرر غير محسوب ضمن الخطة حالياً
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-center">
                    {course.credits || '-'}
                  </td>

                  {/* Column: Completed (Mustawfi) */}
                  <td className="px-4 py-4 text-center border-l border-gray-100 bg-green-50/30">
                     {renderStatusIcon(course.isCompleted, 'success')}
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  لا توجد مقررات مسجلة لهذا المتدرب.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TranscriptTable;