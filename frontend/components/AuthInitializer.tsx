"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLogin } from '@/lib/redux/authSlice';
import type { RootState, AppDispatch } from '@/lib/redux/store';
import { useRouter, usePathname } from 'next/navigation';
import { loadState } from '@/lib/redux/store';
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const userRole = useSelector((state: RootState) => state.auth.userRole);
    const phoneVerified = useSelector((state: RootState) => state.auth.phoneVerified);
    const emailVerified = useSelector((state: RootState) => state.auth.emailVerified);
    const currentPath = usePathname();
    const [isHydrated, setIsHydrated] = useState(false); // Local state for hydration

    useEffect(() => {
        // Only hydrate Redux state from localStorage on client
        const persisted = loadState();
        if (persisted && persisted.auth) {
            const { userRole, firstName, lastName, phoneVerified, emailVerified, applicationId, contact, contactType, paymentMade } = persisted.auth;
            dispatch(setLogin({
                role: userRole,
                roleName: persisted.auth.roleName,
                page_permissions: persisted.auth.page_permissions,
                firstName,
                lastName,
                phoneVerified,
                emailVerified,
                applicationId,
                contact,
                contactType,
                paymentMade
            }));
        }
        setIsHydrated(true); // Set to true after Redux state is loaded
    }, [dispatch]);

    useEffect(() => {
        if (isHydrated && isAuthenticated && userRole) { // Depend on isHydrated
            if (userRole === 'collector' && (!phoneVerified && !emailVerified)) {
                if (currentPath !== '/signup/collector/verify') {
                    router.push('/signup/collector/verify');
                }
            } else if (userRole === 'admin') {
                if (!currentPath.startsWith('/admin')) {
                    router.push('/admin/dashboard');
                }
            } else if (userRole === 'public') {
                if (!currentPath.startsWith('/user')) {
                    router.push('/user/dashboard');
                }
            }
        }
    }, [isAuthenticated, userRole, phoneVerified, emailVerified, router, currentPath, isHydrated]); // Add isHydrated to dependency array

    if (!isHydrated) {
        return null;
    }

    return <>{children}</>;
}