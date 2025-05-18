import React, {useState, useEffect} from 'react';
import * as H from "history";

export const baseUrl = '127.0.0.1:8000';

export const configNoToken = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const configToken = (token?: string|null) => ({
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

//redirecting to the path location only if the current location is different
//if it is the same location we don't want to push again the page on the history
export function handleRedirect(path: string, history:H.History<unknown>)  {
    if (history.location.pathname !== path) {
        history.push(path);
    }
}

export function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Custom fix: if default is Date and parsed is string, return Date object
                if (defaultValue instanceof Date && typeof parsed === 'string') {
                    return new Date(parsed) as T;
                }
                return parsed;
            } catch (e) {
                console.warn(`Failed to parse sessionStorage key "${key}":`, e);
                return defaultValue;
            }
        }
        return defaultValue;
    });

    useEffect(() => {
        try {
            if (state !== undefined) {
                localStorage.setItem(key, JSON.stringify(state));
            } else {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.warn(`Failed to save sessionStorage key "${key}":`, e);
        }
    }, [key, state]);

    return [state, setState];

}

