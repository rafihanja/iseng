import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    success: true,
    data: db.transactions,
    totalCount: db.transactions.length
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, amount, status } = body;

    if (!customerName || !amount) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EX';
    const ref = '#ORD-' + Math.floor(10000 + Math.random() * 90000);
    const avatarClasses = ['av-blue', 'av-emerald', 'av-purple', 'av-amber'];
    const chosenAv = avatarClasses[Math.floor(Math.random() * avatarClasses.length)];

    const newTx = {
      id: 'tx-' + Date.now(),
      ref,
      customerName,
      customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@enterprise.id`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      amount: Number(amount),
      status: status || 'Settled',
      avatarClass: chosenAv,
      initials
    };

    db.transactions.unshift(newTx);
    saveDb(db);

    return NextResponse.json({ success: true, data: newTx });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const db = getDb();
    const tx = db.transactions.find(t => t.id === id || t.ref === id);
    if (!tx) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    if (status) tx.status = status;
    saveDb(db);

    return NextResponse.json({ success: true, data: tx });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const db = getDb();
    db.transactions = db.transactions.filter(t => t.id !== id && t.ref !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
