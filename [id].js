import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('../../components/Chart'), { ssr: false });

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [history, setHistory] = useState([]);

  useEffect(() => { if (id) load(); }, [id]);
  async function load() {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/product/${id}/history`);
      setHistory(res.data || []);
    } catch (e) {
      console.warn('load failed', e.message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Product</h1>
      <Chart data={history} />
    </div>
  );
}
