import { unslugify } from '@/lib/utils/format';

export async function generateMetadata({ params }: { params: { topic: string } }) {
  const topicName = unslugify(params.topic);
  
  return {
    title: `${topicName} - Sessional AI`,
    description: `Record your thoughts about ${topicName}`,
  }
}

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 
