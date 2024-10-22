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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4">原始 API 数据</h3>
            <div className="flex mb-4 overflow-x-auto">
              {rawData.map((data, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
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
            <div className="flex-grow overflow-auto bg-gray-100 p-4 rounded">
              {rawData[activeTab] && (
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {rawData[activeTab].error
                    ? `错误: ${rawData[activeTab].error}`
                    : rawData[activeTab].rawData}
                </pre>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-end"
            >
              关闭
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
