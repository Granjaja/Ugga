
import { getServerSession } from 'next-auth';
import Chat from '../components/Chat'
import { redirect } from 'next/navigation';
import { authOptions } from '../auth';

export default async function ChatPage() {

    const session = await getServerSession(authOptions);
    if (!session) {
      redirect('/api/auth/signin');
    }
  return  <Chat />
}
