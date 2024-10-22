 'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ComponentInfo({ components }) {
  const [parsedComponents, setParsedComponents] = useState({});

  useEffect(() => {
    const parseComponents = () => {
      const parsed = {};
      for (const [key, value] of Object.entries(components)) {
        switch (key) {
          case 'fonts':
            parsed.fonts = `检测到 ${value.value.length} 种字体`;
            break;
          case 'audio':
            parsed.audio = `音频指纹: ${value.value.toFixed(2)}`;
            break;
          case 'colorDepth':
            parsed.colorDepth = `颜色深度: ${value.value} 位`;
            break;
          case 'deviceMemory':
            if (value.value) {
              parsed.deviceMemory = `设备内存: ${value.value} GB`;
            }
            break;
          case 'hardwareConcurrency':
            parsed.hardwareConcurrency = `CPU 核心数: ${value.value}`;
            break;
          case 'screenResolution':
            parsed.screenResolution = `屏幕分辨率: ${value.value[0]}x${value.value[1]}`;
            break;
          case 'timezone':
            parsed.timezone = `时区: ${value.value}`;
            break;
          case 'touchSupport':
            parsed.touchSupport = `触摸支持: ${value.value.maxTouchPoints > 0 ? '是' : '否'}`;
            break;
          case 'vendor':
            parsed.vendor = `设备制造商: ${value.value}`;
            break;
          case 'platform':
            parsed.platform = `操作系统平台: ${value.value}`;
            break;
          case 'languages':
            parsed.languages = `语言: ${value.value.join(', ')}`;
            break;
          case 'webGlBasics':
            parsed.webGlBasics = `GPU: ${value.value.rendererUnmasked}`;
            break;
          case 'canvas':
            parsed.canvas = `Canvas 支持: ${value.value.winding ? '是' : '否'}`;
            break;
          case 'cookiesEnabled':
            parsed.cookiesEnabled = `Cookie 支持: ${value.value ? '是' : '否'}`;
            break;
          case 'pdfViewerEnabled':
            parsed.pdfViewerEnabled = `PDF 查看器: ${value.value ? '启用' : '禁用'}`;
            break;
          case 'hdr':
            parsed.hdr = `HDR 支持: ${value.value ? '是' : '否'}`;
            break;
          case 'architecture':
            parsed.architecture = `CPU 架构: ${value.value} 位`;
            break;
        }
      }
      setParsedComponents(parsed);
    };

    parseComponents();
    const interval = setInterval(parseComponents, 1000);
    return () => clearInterval(interval);
  }, [components]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { y: 5, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white shadow-lg rounded-lg p-2 sm:p-3 mt-3 sm:mt-4"
    >
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">设备详细信息</h3>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {Object.entries(parsedComponents).map(([key, value]) => (
          <motion.div
            key={key}
            variants={itemVariants}
            className={`bg-gray-50 rounded p-1 sm:p-2 shadow-sm transition-all duration-300 hover:shadow-md text-xs ${
              value.length > 20 ? 'col-span-3' : ''
            }`}
          >
            <h4 className="font-semibold text-blue-600 text-xs sm:text-sm">{getTitle(key)}</h4>
            <p className="text-gray-700 break-words">{value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function getTitle(key) {
  const titles = {
    fonts: '字体',
    audio: '音频',
    colorDepth: '颜色深度',
    deviceMemory: '设备内存',
    hardwareConcurrency: 'CPU 核心',
    screenResolution: '屏幕分辨率',
    timezone: '时区',
    touchSupport: '触摸支持',
    vendor: '设备制造商',
    platform: '操作系统',
    languages: '语言',
    webGlBasics: 'GPU',
    canvas: 'Canvas',
    cookiesEnabled: 'Cookie',
    pdfViewerEnabled: 'PDF 查看器',
    hdr: 'HDR',
    architecture: 'CPU 架构'
  };
  return titles[key] || key;
}