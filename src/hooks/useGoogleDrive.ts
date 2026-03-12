import { useState, useEffect, useCallback } from 'react';
import { gapi } from 'gapi-script';
import { GOOGLE_CLIENT_ID, GOOGLE_API_KEY, DISCOVERY_DOCS, SCOPES } from '../config/google';

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
}

export const useGoogleDrive = () => {
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tokenClient, setTokenClient] = useState<any>(null);

    // Initialize GAPI and GIS
    useEffect(() => {
        const initGapi = async () => {
            try {
                await new Promise((resolve) => gapi.load('client', resolve));
                await gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: DISCOVERY_DOCS,
                });
                setIsGapiLoaded(true);
            } catch (error) {
                console.error('Error initializing GAPI:', error);
            }
        };

        const initGis = () => {
            try {
                const client = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: (response: any) => {
                        if (response.error !== undefined) {
                            throw response;
                        }
                        setAccessToken(response.access_token);
                        setIsAuthenticated(true);
                        // Fetch user info after successful login
                        fetchUserInfo(response.access_token);
                    },
                });
                setTokenClient(client);
            } catch (error) {
                console.error('Error initializing GIS:', error);
            }
        };

        // Load GIS script dynamically
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGis;
        document.body.appendChild(script);

        initGapi();
    }, []);

    const fetchUserInfo = async (token: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setUser({
                name: data.name,
                email: data.email,
                picture: data.picture,
            });
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const login = useCallback(() => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        }
    }, [tokenClient]);

    const logout = useCallback(() => {
        if (accessToken) {
            (window as any).google.accounts.oauth2.revoke(accessToken);
            setAccessToken(null);
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [accessToken]);

    const findConfigFile = async () => {
        try {
            const response = await gapi.client.drive.files.list({
                q: "name = 'easydash_config.json' and trashed = false",
                fields: 'files(id, name)',
                spaces: 'drive',
            });
            const files = response.result.files;
            return files && files.length > 0 ? files[0] : null;
        } catch (error) {
            console.error('Error finding config file:', error);
            throw error;
        }
    };

    const saveConfigToDrive = async (configData: any) => {
        if (!isAuthenticated || !isGapiLoaded) throw new Error('Not authenticated');

        try {
            const existingFile = await findConfigFile();
            const boundary = 'foo_bar_baz';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const contentType = 'application/json';
            const metadata = {
                name: 'easydash_config.json',
                mimeType: contentType,
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n\r\n' +
                JSON.stringify(configData, null, 2) +
                close_delim;

            if (existingFile) {
                // Update existing file
                await gapi.client.request({
                    path: `/upload/drive/v3/files/${existingFile.id}`,
                    method: 'PATCH',
                    params: { uploadType: 'multipart' },
                    headers: {
                        'Content-Type': 'multipart/related; boundary=' + boundary,
                    },
                    body: multipartRequestBody,
                });
            } else {
                // Create new file
                await gapi.client.request({
                    path: '/upload/drive/v3/files',
                    method: 'POST',
                    params: { uploadType: 'multipart' },
                    headers: {
                        'Content-Type': 'multipart/related; boundary=' + boundary,
                    },
                    body: multipartRequestBody,
                });
            }
            return true;
        } catch (error) {
            console.error('Error saving to Drive:', error);
            throw error;
        }
    };

    const loadConfigFromDrive = async () => {
        if (!isAuthenticated || !isGapiLoaded) throw new Error('Not authenticated');

        try {
            const file = await findConfigFile();
            if (!file) throw new Error('Config file not found on Drive');

            const response = await gapi.client.drive.files.get({
                fileId: file.id,
                alt: 'media',
            });
            
            return response.result;
        } catch (error) {
            console.error('Error loading from Drive:', error);
            throw error;
        }
    };

    return {
        login,
        logout,
        isAuthenticated,
        user,
        saveConfigToDrive,
        loadConfigFromDrive,
        isGapiLoaded
    };
};
