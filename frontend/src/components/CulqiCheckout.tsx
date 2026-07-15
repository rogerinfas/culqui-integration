'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';

// Extender el objeto global Window para TypeScript
declare global {
  interface Window {
    Culqi: any;
    culqi: () => void;
  }
}

interface CulqiCheckoutProps {
  amount: number;
  email: string;
  userId: number;
}

export function CulqiCheckout({ amount, email, userId }: CulqiCheckoutProps) {
  const [isReady, setIsReady] = useState(false);

  const processPayment = useMutation({
    mutationFn: async (tokenId: string) => {
      const response = await fetch('http://localhost:3000/payments/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          amount,
          email,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error processing payment on backend');
      }

      return response.json();
    },
    onSuccess: () => {
      alert('¡Pago procesado con éxito!');
    },
    onError: (error) => {
      console.error(error);
      alert('Hubo un error procesando el pago.');
    },
  });

  useEffect(() => {
    const initCulqi = () => {
      if (window.Culqi) {
        window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_...';
        window.Culqi.settings({
          title: 'Culqi Store',
          currency: 'PEN',
          description: 'Compra de prueba',
          amount: amount,
        });

        // Configurar opciones
        window.Culqi.options({
          lang: 'es',
          installments: false, 
          paymentMethods: {
            tarjeta: true,
            yape: true,
            bancaMovil: false,
            agente: false,
            billetera: false,
            cuotealo: false,
          }
        });

        setIsReady(true);
      }
    };

    // La función culqi() es llamada por Culqi v4 globalmente cuando termina
    window.culqi = () => {
      if (window.Culqi.token) {
        const token = window.Culqi.token.id;
        console.log('Token obtenido: ', token);
        // Procesar pago en el backend
        processPayment.mutate(token);
      } else {
        console.log('Error de Culqi: ', window.Culqi.error);
        alert(window.Culqi.error.user_message);
      }
    };

    // Dar un pequeño delay para asegurar que el script se cargó
    const timeoutId = setTimeout(initCulqi, 1000);
    return () => clearTimeout(timeoutId);
  }, [amount, processPayment]);

  const openCheckout = () => {
    if (isReady && window.Culqi) {
      window.Culqi.open();
    } else {
      alert('Culqi no está listo aún. Intenta en un momento.');
    }
  };

  return (
    <Button 
      onClick={openCheckout}
      disabled={!isReady || processPayment.isPending}
    >
      {processPayment.isPending ? 'Procesando...' : `Pagar S/ ${(amount / 100).toFixed(2)}`}
    </Button>
  );
}
