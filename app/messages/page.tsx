import { getConversations } from '@/lib/messages/mock-data';
import { MessagesPage } from '@/components/messages/messages-page';

export const metadata = {
  title: 'Customers',
};

export default function Messages() {
  const conversations = getConversations();

  return <MessagesPage conversations={conversations} />;
}
