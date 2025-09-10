import { CellComponentProps } from '../types';
import { StatusIndicator } from '../components/StatusIndicator';

export const StatusCell = <T extends Record<string, any>>({ params }: CellComponentProps<T>) => {
  return (
    <StatusIndicator
      status={params.value}
      size="small"
      showIcon={true}
    />
  );
};
