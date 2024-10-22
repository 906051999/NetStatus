'use client';

import { useState, useRef, useEffect } from 'react';
import DeviceInfo from '../components/DeviceInfo';
import NetworkInfo from '../components/NetworkInfo';
import WebsiteStatus from '../components/WebsiteStatus';
import RawDataModal from '../components/RawDataModal';
import QuickNav from '../components/QuickNav';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const networkRef = useRef(null);
  const websiteRef = useRef(null);
  const deviceRef = useRef(null);
  const quickNavRef = useRef(null);

  const openModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const scrollTo = (section) => {
    const refs = {
      network: networkRef,
      website: websiteRef,
      device: deviceRef,
    };
    const targetRef = refs[section];
    if (targetRef.current && quickNavRef.current) {
      const navHeight = quickNavRef.current.offsetHeight;
      const targetPosition = targetRef.current.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 max-w-7xl">
      <QuickNav ref={quickNavRef} scrollTo={scrollTo} />
      <div ref={networkRef}>
        <NetworkInfo openModal={openModal} />
      </div>
      <div ref={websiteRef}>
        <WebsiteStatus />
      </div>
      <div ref={deviceRef}>
        <DeviceInfo />
      </div>
      <RawDataModal
        isOpen={isModalOpen}
        onClose={closeModal}
        rawData={modalData}
      />
    </div>
  );
}
