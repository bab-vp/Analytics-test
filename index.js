import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts(); }, []);
  async function fetchProducts() {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/stats/top-products`);
      setProducts(res.data || []);
    } catch (e) {
      console.warn('fetch failed', e.message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Merchant Analytics</h1>
      <h2>Top Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}><Link href={`/product/${p.id}`}>{p.title} — {p.current_price}</Link></li>
        ))}
      </ul>
    </div>
  );
}
