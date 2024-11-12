import { Card } from "@/components/ui/card";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, description, children }: LegalPageLayoutProps) {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="p-8 md:p-12">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{title}</h1>
          <p className="text-muted-foreground mb-12">Effective Date: November 11th, 2024</p>
          <div className="space-y-16">
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
} 