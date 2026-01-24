import { NextResponse } from 'next/server';

let lastRxBytes = 0;
let lastTxBytes = 0;
let lastTimestamp = Date.now();

export async function GET() {
  const GLANCES_API = 'http://glances:61208/api/4/network';

  try {
    const response = await fetch(GLANCES_API, { next: { revalidate: 0 }, cache: 'no-store' });
    const data = await response.json();

    // Znajdź główny interfejs sieciowy (enp2s0, eno1, eth0, itp.) - wykluczając loopback, docker i veth
    const mainInterface = data.find((iface: any) => 
      (iface.interface_name.startsWith('enp') || 
       iface.interface_name.startsWith('eno') || 
       iface.interface_name === 'eth0') &&
      !iface.interface_name.startsWith('veth') &&
      !iface.interface_name.startsWith('br-')
    ) || data[0];

    if (!mainInterface) {
      return NextResponse.json({ error: 'No network interface found' }, { status: 404 });
    }

    const currentRxBytes = mainInterface.bytes_recv_gauge || mainInterface.rx || 0;
    const currentTxBytes = mainInterface.bytes_sent_gauge || mainInterface.tx || 0;
    const currentTimestamp = Date.now();

    // Jeśli Glances już podaje rate_per_sec, użyj tego zamiast obliczać
    const rxRate = mainInterface.bytes_recv_rate_per_sec || 
                   (lastRxBytes > 0 ? (currentRxBytes - lastRxBytes) / ((currentTimestamp - lastTimestamp) / 1000) : 0);
    const txRate = mainInterface.bytes_sent_rate_per_sec || 
                   (lastTxBytes > 0 ? (currentTxBytes - lastTxBytes) / ((currentTimestamp - lastTimestamp) / 1000) : 0);

    // Zapisz wartości dla następnego wywołania
    lastRxBytes = currentRxBytes;
    lastTxBytes = currentTxBytes;
    lastTimestamp = currentTimestamp;

    return NextResponse.json({
      interface: mainInterface.interface_name,
      rx_rate: Math.max(0, rxRate), // bytes per second
      tx_rate: Math.max(0, txRate), // bytes per second
      rx_total: currentRxBytes,
      tx_total: currentTxBytes,
      cumulative: mainInterface.cumulative || 0,
      time_since_update: mainInterface.time_since_update || 0
    });
  } catch (e) {
    console.error('Network API error:', e);
    return NextResponse.json({ error: 'Failed to fetch network data' }, { status: 500 });
  }
}
