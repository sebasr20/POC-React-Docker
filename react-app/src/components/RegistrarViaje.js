import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const RegistrarViaje = () => {
  
  useEffect(() => {
    // Inicializar el escáner QR en el div con id="qr-reader"
    const qrCodeScanner = new Html5QrcodeScanner(
      "qr-reader", 
      {
        fps: 10,   // Cuadros por segundo
        qrbox: { width: 250, height: 250 }  // Tamaño de la caja de escaneo
      }
    );

    // Función de éxito: Se llama cuando se escanea un código QR válido
    const handleQrCodeSuccess = (decodedText) => {
      console.log(`Código QR leído: ${decodedText}`);
      qrCodeScanner.clear(); // Detener el escaneo después de un escaneo exitoso
      // Aquí puedes agregar la lógica para manejar el código QR (como registrar un viaje)
      
    };

    // Función de error: Se llama en cada frame de video que no tiene un código QR
    const handleQrCodeError = (error) => {
      console.warn(`Error al escanear QR: ${error}`);
    };

    // Renderizar el escáner
    qrCodeScanner.render(handleQrCodeSuccess, handleQrCodeError);

    // Limpiar cuando el componente se desmonte
    return () => {
      qrCodeScanner.clear();
    };
  }, []);

  return (
    <div>
      <h1>Registrar Viaje</h1>
      <div id="qr-reader" style={{ width: '300px' }}></div>
    </div>
  );
};

export default RegistrarViaje;

