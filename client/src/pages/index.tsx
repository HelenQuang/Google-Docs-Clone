import { useEffect } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(`/documents/${uuidV4()}`);
  }, [router]);

  return <p>Home</p>;
};

export default Home;
