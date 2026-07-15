'use client';

import { useUsersControllerFindAll, useUsersControllerGetProfile } from '@/api/endpoints/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CulqiCheckout } from '@/components/CulqiCheckout';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: profileResponse, isLoading: isLoadingProfile, error: profileError } = useUsersControllerGetProfile({
    query: {
      retry: false,
    }
  });

  const { data: usersResponse, isLoading: isLoadingUsers } = useUsersControllerFindAll();

  if (profileError) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      router.push('/login');
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const profile = profileResponse as any;
  const users = usersResponse as any;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Panel principal</h1>
        <Button variant="outline" onClick={logout}>Cerrar sesión</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <p className="text-neutral-500">Cargando perfil...</p>
          ) : profile ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <p><strong>Nombre:</strong> {profile.name || 'N/A'}</p>
                <p><strong>Correo electrónico:</strong> {profile.email}</p>
                <p><strong>ID de usuario:</strong> {profile.id}</p>
              </div>
              
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="font-semibold mb-2">Pasarela de Pagos (Prueba)</h3>
                <p className="text-sm text-neutral-500 mb-4">Realiza un pago de prueba de S/ 10.00 usando Culqi.</p>
                <CulqiCheckout amount={1000} email={profile.email} userId={profile.id} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <p className="text-neutral-500">Cargando usuarios...</p>
          ) : users && users.length > 0 ? (
            <div className="border rounded-md divide-y">
              {users.map((u: any) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{u.name || 'Sin nombre'}</p>
                    <p className="text-sm text-neutral-500">{u.email}</p>
                  </div>
                  <div className="text-sm text-neutral-400">
                    Se unió el: {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No se encontraron usuarios.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
