"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, setLogin, setAuthInitialized } from '@/lib/redux/authSlice';
import { getCookie } from '@/lib/utils/csrf';
import type { AppDispatch } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import { loadState } from '@/lib/redux/store';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { isAuthenticated, userRole, phoneVerified, emailVerified, isInitializing } = useSelector(selectAuth);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Only hydrate Redux state from localStorage on client
        const persisted = loadState();
        if (persisted && persisted.auth) {
            dispatch(setLogin(persisted.auth));
        }
        dispatch(setAuthInitialized());
        setHydrated(true);
    }, [dispatch]);

    useEffect(() => {
        if (!isInitializing && isAuthenticated && userRole === 'collector' && !phoneVerified && !emailVerified) {
            router.push('/signup/collector/verify');
        }
    }, [isAuthenticated, userRole, phoneVerified, emailVerified, isInitializing, router]);

    if (!hydrated || isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-lg font-semibold text-gray-700">Loading Application...</div>
            </div>
        );
    }

    return <>{children}</>;
}