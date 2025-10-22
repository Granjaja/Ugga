
import { getServerSession } from 'next-auth';
import Chat from '../components/Chat'
import { redirect } from 'next/navigation';
import { authOptions } from '../auth';

export default async function ChatPage() {

  // Render chat page if user is authenticated or redirect to login page
    

    const session = await getServerSession(authOptions);
    if (!session) {
      redirect('/api/auth/signin');
    }
  return  <Chat />
}
