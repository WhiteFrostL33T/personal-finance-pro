import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '', ...props }) => {
  // @ts-expect-error Lucide icons indexed access
  const Component = LucideIcons[name] || LucideIcons.CircleHelp;
  return <Component size={size} className={className} {...props} />;
};
