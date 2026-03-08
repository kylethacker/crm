import Image from 'next/image';

type QRCodeOutput = {
  data: string;
  imageUrl: string;
  size: number;
};

export function QRCodeResult({ data }: { data: QRCodeOutput }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-white px-4 py-4 dark:bg-neutral-950">
      <Image
        src={data.imageUrl}
        alt={`QR code for: ${data.data}`}
        width={data.size}
        height={data.size}
        className="rounded-lg"
        unoptimized
      />
      <p className="max-w-[200px] truncate text-center text-xs text-neutral-500 dark:text-neutral-400">
        {data.data}
      </p>
    </div>
  );
}
