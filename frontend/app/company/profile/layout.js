import { Suspense } from 'react';

export default function CompanyProfileLayout({ children }) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}

