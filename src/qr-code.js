export function createQrCode(container, data, options = {}) {
  if (typeof QRCodeStyling === 'undefined') {
    throw new Error('Библиотека QR-кода не загрузилась');
  }

  const size = options.size ?? 200;
  const color = options.color ?? '#000000';

  const qrCode = new QRCodeStyling({
    width: size,
    height: size,
    type: 'canvas',
    data,
    dotsOptions: {
      color,
      type: options.dotsType ?? 'rounded',
    },
    backgroundOptions: { color: '#ffffff' },
    cornersSquareOptions: {
      color,
      type: 'extra-rounded',
    },
    image: options.logo || undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 15,
      imageSize: 0.35,
      hideBackgroundDots: true,
    },
    qrOptions: { errorCorrectionLevel: 'H' },
  });

  container.replaceChildren();
  qrCode.append(container);

  return qrCode;
}

export function downloadQrCode(qrCode, fileName = 'qr') {
  return qrCode.download({ name: fileName, extension: 'png' });
}
