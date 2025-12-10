/**
 * Demo V2 Theme Page
 * Przykładowa strona demonstracyjna dla Next.js App Router
 */

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const metadata = {
  title: 'V2 Theme Demo - Aukcje Gołębi',
  description: 'Demonstracja nowego motywu V2 z efektami 3D i mikrointerakcjami',
};

export default function DemoV2Page() {
  return (
    <UnifiedLayout>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          V2 Theme Demo
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-gray-600">
            Sekcja w przygotowaniu...
          </p>
        </div>
      </div>
    </UnifiedLayout>
  );
}
