import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function RawDataModal({ isOpen, onClose, rawData }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-3xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">原始 API 数据</h3>
            <div className="flex flex-wrap mb-2 sm:mb-3 gap-1 sm:gap-2">
              {rawData.map((data, index) => (
                <button
                  key={index}
                  className={`px-2 py-1 text-xs sm:text-sm rounded-lg ${
                    activeTab === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {data.source}
                </button>
              ))}
            </div>
            <div className="flex-grow overflow-auto bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm">
              {rawData[activeTab] && (
                <pre className="whitespace-pre-wrap break-words">
                  {rawData[activeTab].error
                    ? `错误: ${rawData[activeTab].error}`
                    : rawData[activeTab].rawData}
                </pre>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-2 sm:mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 sm:py-2 sm:px-4 rounded text-xs sm:text-sm self-end"
            >
              关闭
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
