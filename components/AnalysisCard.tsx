import React from 'react';
import { GeminiAnalysis } from '../types';
import { Sparkles, Brain, Target, TrendingUp } from 'lucide-react';

interface AnalysisCardProps {
  analysis: GeminiAnalysis | null;
  loading: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border-t-4 border-t-primary-500 overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">التحليل الذكي (Gemini AI)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                <TrendingUp className="w-5 h-5" />
                المعدل التقديري
              </h3>
              <p className="text-3xl font-extrabold text-blue-600">{analysis.estimatedGPA}</p>
              <p className="text-xs text-blue-400 mt-1">يتم حسابه بناءً على البيانات المتوفرة</p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                ملخص الأداء
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {analysis.summary}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                نقاط القوة
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.strengths.map((str, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {str}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="font-bold text-yellow-800 mb-2">توصيات وملاحظات</h3>
              <p className="text-yellow-900 text-sm leading-relaxed">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
