"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import Image from 'next/image';

export function QRCodeDisplay() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const commentUrl = `${window.location.origin}/comment`;
        const url = await QRCode.toDataURL(commentUrl);
        setQrCodeUrl(url);
      } catch (err) {
        console.error(err);
      }
    };

    generateQRCode();
  }, []);

  return (
    <Card className="bg-white/90 dark:bg-blue-950/90 backdrop-blur-sm">
      <CardContent className="p-2">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="w-10 h-10" />
          <span className="text-xs">Scan to Comment</span>
        </div>
        <div className="flex justify-center">
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={48}
            height={48}
            className="w-96 h-96"
          />
        </div>
      </CardContent>
    </Card>
  );
}