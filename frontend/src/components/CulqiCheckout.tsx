'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');

  const showDialog = (title: string, description: string) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Error processing payment on backend');
      }

      return data;
    },
    onSuccess: () => {
      showDialog('¡Pago Exitoso!', 'El pago de prueba se ha procesado correctamente.');
    },
    onError: (error) => {
      console.error(error);
      showDialog('Error en el pago', error.message);
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
        
        // 1. Cerramos el modal de Culqi para que no tape nada
        if (window.Culqi.close) {
          window.Culqi.close();
        }

        // 2. Procesar pago en el backend (Mostrará nuestro Dialog)
        processPayment.mutate(token);
      } else {
        // Culqi ya muestra sus propios errores en rojo dentro de su modal (ej. tarjeta inválida)
        // por lo que no es necesario lanzar otro Dialog encima que ensucie la pantalla.
        console.log('Error nativo de Culqi: ', window.Culqi.error);
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
      showDialog('Atención', 'Culqi no está listo aún. Intenta en un momento.');
    }
  };

  return (
    <>
      <Button 
        onClick={openCheckout}
        disabled={!isReady || processPayment.isPending}
      >
        {processPayment.isPending ? 'Procesando...' : `Pagar S/ ${(amount / 100).toFixed(2)}`}
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
