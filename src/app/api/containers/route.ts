import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Odpytujemy bezpieczne proxy Dockera
    const res = await fetch('http://docker-proxy:2375/containers/json?all=true');
    const data = await res.json();
    
    return NextResponse.json(data.map((c: any) => ({
      name: c.Names[0].replace('/', ''),
      status: c.State,
      image: c.Image
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Docker Proxy unreachable' }, { status: 500 });
  }
}
