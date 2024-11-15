import { useMediaDeviceSelect } from '@livekit/components-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DeviceSelect() {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind: 'audioinput',
    requestPermissions: true,
    onError: (e) => console.error('Media device error:', e)
  });

  if (!devices || devices.length <= 1) return null;

  return (
    <Select
      value={activeDeviceId}
      onValueChange={(deviceId) => setActiveMediaDevice(deviceId)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select microphone" />
      </SelectTrigger>
      <SelectContent>
        {devices.map((device: MediaDeviceInfo) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 