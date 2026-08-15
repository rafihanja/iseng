import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    success: true,
    data: db.products
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, price, stock } = body;

    if (!name || !price) {
      return NextResponse.json({ success: false, message: 'Missing product details' }, { status: 400 });
    }

    const db = getDb();
    const sku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
    const thumbClasses = ['thumb-indigo', 'thumb-emerald', 'thumb-amber', 'thumb-violet'];
    const chosenThumb = thumbClasses[Math.floor(Math.random() * thumbClasses.length)];

    const newProd = {
      id: 'prod-' + Date.now(),
      sku,
      name,
      category: category || 'General Hardware',
      price: Number(price),
      stock: Number(stock) || 10,
      soldUnits: 0,
      totalRevenue: 'Rp 0 M',
      status: Number(stock) <= 5 ? 'Low Stock Alert' : 'In Stock',
      thumbClass: chosenThumb
    };

    db.products.unshift(newProd);
    saveDb(db);

    return NextResponse.json({ success: true, data: newProd });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
