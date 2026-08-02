import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccount = {
  type: "service_account",
  project_id: "turnly-ed288",
  private_key_id: "7a3258d1902f741011b445b7b755b2ca7f0a2921",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCyF9oOnZnq1qyh\nQjKTvn0oA53GOQBIU1l1zy4dgiezW4bfXrq4+RfNUqrNrUOBA34BF5x90eXwSYa0\njaQ3Np/XhGeY5oVW4HWWJ4jXmFcpBk7ZmcdQG1IEZbuygWfGUO8NxlVJt6sb38Oy\ntKfe1CkhqUApeSGDgKzxNTnr2L+z7VmMY8hhIxgUiu7pERKyljxwSoH3HkP8CyG+\nKHXblDDomw5fTXdq3sBlvjGFyHkJxoaFLkgfu0LGwdxATLymh5xWYEIPO/A6RaYk\ntJl/n4eK5G447odIO23Tiz9js0iwQ2P9V+EU+Txd4HOnXsbe1c5JsPXM8XjAPGqo\noMGjzKAhAgMBAAECggEAE1rhQXZiXHHhSBNMMN9idb9S3dCjFbktP075aY6UJvt7\nAHqom2LC8fcahgjfDb3l61N4F/qAXWl4QNYl8zQ2EfObWLQw6JyzWtLIHfo5+sTr\nO93pGe0mMEEoMYG72ANCv8H+0eiqqXhbqefVWLPBFp3w0bEO8d5BrWNF/LpNN04V\nX+Nq2JwCcm/xA1M1s5qDANv1BJ+blVsO+q9hF+xxtwQpaMeoIxHNcPDiEr9GMju5\nTOCHqKlMHK59fFntMczy3SXzg9mIJkloZlNEEHQMSwKHAInV6SD2dZeFsnwqO7El\n0axgJhAMYSN9wBg51tFx0fQGkl9yDrj7mevjDUqTawKBgQDbjZ9t61Jkz1mXTYt5\nuMXi0hzbBpls3jkDbTsVLt9AT82cYZLxZtIO80xP9G1PpqY35575SIF8iLT/0fNY\nJqKjnyetowEirZxs9JIuoCCOZIRIu2oHKGN6/FYA0o88KJdGaqdQkcajuHtmSOg2\nqMNm0wOoRSdBrhNp9K8SFzx5DwKBgQDPqEwHEqMkJkAUlVBUdVKHnGHz6EiX5SJr\ndTLBJrZIXqbvha2x7elFgM9nIA2U+wou7bewIUlhrRvTN68T4/iSfe93jNiEs150\n2BZmERxI0HGT/jKEgrnKK3nGt3XdMuyhvWHf+8JsCOfwyqsveHcgu4e9+uCAfstz\nb0IuBitzzwKBgQCEvw9bPYIW08vekJM5KH/1UYcC4u2XBpHAQaYMe8eeMeImoFRh\nQwLU6UQFv8rr8t3jRVc4cB9idaHCX2XbsZh6h7tM4BbKqd+/fOx55nVowtu8whws\ncb4cWT+Cxcy22fAFMm0xaMKKsPtjb8d/bPCgVguLDSzcKG0yji/gJ053/wKBgQCU\nZi5nA4+o/tjenNI6eVmQZlauCvsN6gcOCkRKOpMb5uCf3cWCmYYSUHpntUVfiYP+\ng425BiC9+Ashh/LLYSi779nZcsMtGk5PbDmdmW7ALo5sd8W8YvvJGga911AY0xK+\nh2vRuMZ5lGfE8eEiXJGtx7a7MvWLfpGAnisKXwhgiwKBgQC+gdCJchdmtmD4cqZg\nDg4VW3+jpGrQ4yymc158n8e8H3ux3NxwsD3FckvgGgqVrcSrensTTwGkIeogsROR\nhSnp+SWpbgf5zEhu+iDdvrh8K04+2iqVGaZSr+ilC+C47RpbnMHd266QsjifC5OD\nUV0DqxrBOpvkKRbnMGlau0AzTw==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@turnly-ed288.iam.gserviceaccount.com",
};

export const dynamic = 'force-dynamic';

function getAdminApp() {
  if (getApps().length === 0) {
    return initializeApp({ credential: cert(serviceAccount) });
  }
  return getApps()[0];
}

export async function POST(req) {
  try {
    const { fcmToken, title, body } = await req.json();

    if (!fcmToken) {
      return NextResponse.json({ error: 'Missing fcmToken' }, { status: 400 });
    }

    const app = getAdminApp();
    const messaging = getMessaging(app);

    // Exact same payload format as /api/test-push which is proven to work on locked screen
    const message = {
      token: fcmToken,
      data: {
        title: title || "It's Your Turn!",
        body: body || "Please proceed to the counter now.",
      },
      webpush: {
        headers: {
          Urgency: "high",
          TTL: "86400",
        },
        notification: {
          title: title || "It's Your Turn!",
          body: body || "Please proceed to the counter now.",
          icon: "/hero.png",   // ✅ hero.png exists in /public — same as test-push
          requireInteraction: true,
          tag: "turnly-call-alert",
        },
      },
      android: {
        priority: "high",
      },
    };

    const response = await messaging.send(message);
    console.log('[Turnly] FCM push sent:', response);
    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error('[Turnly] FCM Send Error:', err.message, err.code);
    return NextResponse.json({ error: err.message, code: err.code }, { status: 500 });
  }
}
