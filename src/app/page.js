import DeviceInfo from '../components/DeviceInfo';
import NetworkInfo from '../components/NetworkInfo';
import WebsiteStatus from '../components/WebsiteStatus';

export default function Home() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 max-w-7xl">
      <NetworkInfo />
      <DeviceInfo />
      <WebsiteStatus />
    </div>
  );
}
