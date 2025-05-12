import React, { useState, useEffect } from 'react';

export const baseUrl = '127.0.0.1:8000';

export const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const authConfig = (token?: string) => ({
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
});

export interface ResponseProps<T> {
    data: T;
}

export const getLogger: (tag: string) => (...args:unknown[]) => void =
  tag => (...args) => console.log(tag, ...args);

const log = getLogger('api');

export function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`, err);
            return Promise.reject(err);
        });
}

export function formatNumber(num:number) {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}


export function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize); // cleanup
    }, []);

    return width;
}

export function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    });

    useEffect(() => {
        if(state != undefined )
            localStorage.setItem(key, JSON.stringify(state));
        else
            localStorage.removeItem(key);
    }, [key, state]);

    return [state, setState];
}