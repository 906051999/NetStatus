import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const QuickNav = forwardRef(({ scrollTo }, ref) => {
  const navItems = [
    { key: 'network', label: '网络信息', icon: '🔌' },
    { key: 'website', label: '网站访问', icon: '🌐' },
    { key: 'device', label: '设备信息', icon: '💻' },
  ];

  return (
    <motion.nav 
      ref={ref}
      className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-sm z-10"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <ul className="flex justify-around items-center p-3 max-w-3xl mx-auto">
        {navItems.map(({ key, label, icon }) => (
          <motion.li key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <motion.button
              onClick={() => scrollTo(key)}
              className="px-4 py-2 rounded-full text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-300 ease-in-out flex items-center space-x-2"
              whileHover={{ 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                y: -1
              }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
});

QuickNav.displayName = 'QuickNav';

export default QuickNav;
