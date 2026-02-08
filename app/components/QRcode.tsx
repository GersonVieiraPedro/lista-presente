import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

export default function PixQr({ pix }: { pix: string }) {
  const [qr, setQr] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(pix, { width: 300 }).then(setQr)
  }, [pix])

  if (!qr) return null

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={qr} alt="QR Code Pix" className="mx-auto" />
}
