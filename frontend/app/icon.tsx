import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  const filePath = path.join(process.cwd(), 'public/favicon-img.png');
  let src = '';
  try {
    const fileBuffer = fs.readFileSync(filePath);
    src = `data:image/png;base64,${fileBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Failed to read favicon-img.png:', error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '30%',
          overflow: 'hidden',
        }}
      >
        {src ? (
          <img src={src} width="100%" height="100%" style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#ECEAE3' }} />
        )}
      </div>
    ),
    { ...size }
  );
}
