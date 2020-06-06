import React from 'react';
import { range } from '../common/helpers';

interface ChannelSettingProps {
  channel: number
  onChangeChannel: (channel: number) => void
}

const ChannelSetting: React.FC<ChannelSettingProps> = ({ channel, onChangeChannel}) => {

  const handleChangeChannel = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const channelStr = event.target.value;
    const channel = parseInt(channelStr);
    onChangeChannel(channel);
  };

  return (
    <select
      value={channel}
      onChange={handleChangeChannel}
    >
      {range(1, 17).map(n => (
        <option
          key={n}
          value={n}
        >Channel {n}</option>
      ))}
    </select>
  );
};

export default ChannelSetting;
