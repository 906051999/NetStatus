import DeviceInfo from '../components/DeviceInfo';
import NetworkInfo from '../components/NetworkInfo';
import WebsiteStatus from '../components/WebsiteStatus';

export default function Home() {
  return (
    <div className="space-y-8">
      <DeviceInfo />
      <NetworkInfo />
      <WebsiteStatus />
    </div>
  );
}
