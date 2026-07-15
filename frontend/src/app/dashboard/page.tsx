'use client';

import { useUsersControllerFindAll, useUsersControllerGetProfile } from '@/api/endpoints/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" onClick={logout}>Sign out</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <p className="text-neutral-500">Loading profile...</p>
          ) : profile ? (
            <div className="space-y-1">
              <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>User ID:</strong> {profile.id}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <p className="text-neutral-500">Loading users...</p>
          ) : users && users.length > 0 ? (
            <div className="border rounded-md divide-y">
              {users.map((u: any) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{u.name || 'No name'}</p>
                    <p className="text-sm text-neutral-500">{u.email}</p>
                  </div>
                  <div className="text-sm text-neutral-400">
                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
