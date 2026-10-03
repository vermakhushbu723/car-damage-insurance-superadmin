import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/superadminApi';
import { clearSuperAdminSession } from './session';
import { useClearRemoteData } from '../store/DataStore';
import { ROUTES } from '../constants/routes';

/** Signs out: tells the server (for the audit trail), then drops the token and any loaded database data. */
export default function useLogout() {
    const navigate = useNavigate();
    const clearRemote = useClearRemoteData();
    return useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            /* already expired / offline -- sign out locally anyway */
        }
        clearSuperAdminSession();
        clearRemote();
        navigate(ROUTES.LOGIN, { replace: true });
    }, [navigate, clearRemote]);
}
