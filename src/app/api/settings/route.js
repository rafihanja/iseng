import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    success: true,
    data: db.settings,
    notifications: db.notifications
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();

    if (body.action === 'rotate_key') {
      const newKey = 'pulseops_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      db.settings.apiKey = newKey;
      saveDb(db);
      return NextResponse.json({ success: true, apiKey: newKey });
    }

    if (body.action === 'clear_notifications') {
      db.notifications.forEach(n => n.unread = false);
      saveDb(db);
      return NextResponse.json({ success: true });
    }

    if (body.settings) {
      db.settings = { ...db.settings, ...body.settings };
      saveDb(db);
      return NextResponse.json({ success: true, data: db.settings });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
