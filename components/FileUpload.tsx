import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileProcessed: (file: File) => Promise<void>;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isProcessing }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Basic validation for Excel and CSV types
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (isValid) {
      onFileProcessed(file);
    } else {
      alert("يرجى رفع ملف صالح بصيغة Excel (.xlsx, .xls) أو CSV (.csv)");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <div 
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out ${
          dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
        } hover:border-primary-400`}
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          onChange={handleChange}
          accept=".xlsx,.xls,.csv"
        />
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-primary-100 rounded-full text-primary-600">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800">
              {isProcessing ? "جاري المعالجة..." : "رفع ملف السجل التدريبي"}
            </h3>
            <p className="text-sm text-gray-500">
              قم بسحب وإفلات ملف Excel أو CSV هنا
            </p>
          </div>

          <button 
            onClick={onButtonClick}
            disabled={isProcessing}
            className="mt-4 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>اختر ملف</span>
          </button>
        </div>
      </div>
      
      <p className="mt-6 text-center text-xs text-gray-400">
        يدعم النظام ملفات Excel (.xlsx, .xls) وملفات القيم المفصولة بفاصلة (.csv).
      </p>
    </div>
  );
};

export default FileUpload;