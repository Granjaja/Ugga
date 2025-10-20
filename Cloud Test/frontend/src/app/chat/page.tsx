
import { getServerSession } from 'next-auth';
import Chat from '../components/Chat'
import { redirect } from 'next/navigation';
import { GET as handler } from '../api/auth/[...nextauth]/route';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function ChatPage() {

    const session = await getServerSession(authOptions);
    if (!session) {
      redirect('/api/auth/signin');
    }
  return  <Chat />
}
