interface DisplayIfProps {
  condition: boolean;
  children: any;
  fallback?: React.ReactNode;
}

export const DisplayIf: React.FC<DisplayIfProps> = ({ condition, children, fallback }) => {
  return <>{condition ? children : fallback}</>;
};
