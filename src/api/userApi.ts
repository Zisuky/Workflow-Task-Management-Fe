import { useState, useEffect, useRef } from 'react';
import { employeeApi, type Employee } from './employeeApi';

let currentUserCache: Employee | null = null;
let isLoadingCache = false;
let loadingPromise: Promise<Employee | null> | null = null;
let hasInitialized = false;

export function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState<Employee | null>(currentUserCache);
    const [isLoadingUser, setIsLoadingUser] = useState(isLoadingCache);
    const [error, setError] = useState<Error | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        if (hasInitialized && currentUserCache !== null) {
            setIsLoadingUser(false);
            return;
        }

        if (loadingPromise) {
            loadingPromise.then(user => {
                if (mountedRef.current) {
                    setCurrentUser(user);
                    setIsLoadingUser(false);
                }
            }).catch(() => {
                if (mountedRef.current) {
                    setIsLoadingUser(false);
                }
            });
            return;
        }

        if (hasInitialized) {
            return;
        }
        hasInitialized = true;

        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (!token) {
                if (mountedRef.current) {
                    setIsLoadingUser(false);
                    setCurrentUser(null);
                }
                return;
            }

            isLoadingCache = true;
            if (mountedRef.current) {
                setIsLoadingUser(true);
            }
            setError(null);

            loadingPromise = employeeApi.getCurrentUser()
                .then(user => {
                    currentUserCache = user;
                    if (mountedRef.current) {
                        setCurrentUser(user);
                    }
                    return user;
                })
                .catch(() => {
                    if (mountedRef.current) {
                        setError(null);
                        setCurrentUser(null);
                    }
                    return null;
                })
                .finally(() => {
                    isLoadingCache = false;
                    if (mountedRef.current) {
                        setIsLoadingUser(false);
                    }
                    loadingPromise = null;
                });

            return loadingPromise;
        };

        fetchCurrentUser();

        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        currentUser,
        isLoadingUser,
        error,
        refetch: async () => {
            try {
                setIsLoadingUser(true);
                setError(null);
                const user = await employeeApi.getCurrentUser();
                setCurrentUser(user);
                return user;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch current user');
                setError(error);
                throw error;
            } finally {
                setIsLoadingUser(false);
            }
        },
    };
}

/**
 * @param name 
 * @returns
 */
export function getUserInitials(name: string | null | undefined): string {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return 'U';
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    const first = words[0].charAt(0).toUpperCase();
    const last = words[words.length - 1].charAt(0).toUpperCase();
    return first + last;
}

export type { Employee };

