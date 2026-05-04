
export const uploadImage = async (file: File, imgbbApiKey?: string): Promise<string> => {
    // Check file size (limit to 5MB to avoid long uploads/hanging)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`L'image est trop volumineuse (Max ${maxSizeMB} Mo).`);
    }

    if (imgbbApiKey) {
        return uploadToImgBB(file, imgbbApiKey);
    } else {
        return uploadToCatbox(file);
    }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result as string;
            // Remove the data:image/jpeg;base64, part
            encoded = encoded.replace(/^data:image\/\w+;base64,/, "");
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
};

const fetchWithTimeout = async (resource: string, options: RequestInit & { timeout?: number } = {}) => {
    const { timeout = 20000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
    });
    clearTimeout(id);
    return response;
};

const uploadToImgBB = async (file: File, apiKey: string): Promise<string> => {
    try {
        const base64Image = await fileToBase64(file);
        const formData = new FormData();
        formData.append('image', base64Image);
        formData.append('key', apiKey); // Key in POST body, not URL query param

        const response = await fetchWithTimeout('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
            timeout: 20000
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.error?.message || 'ImgBB upload failed');
        }
    } catch (error: any) {
        console.error('ImgBB Upload Error:', error);
        if (error.name === 'AbortError') {
            throw new Error('Délai d\'attente dépassé. L\'image est peut-être trop lourde.');
        }
        throw new Error(error.message || 'Échec de l\'upload ImgBB');
    }
};

const uploadToCatbox = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    try {
        const response = await fetchWithTimeout('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: formData,
            timeout: 20000
        });

        if (!response.ok) {
             throw new Error(`Catbox upload failed: ${response.statusText}`);
        }

        const url = await response.text();
        if (!url.startsWith('http')) {
            throw new Error('Réponse invalide du serveur Catbox');
        }
        return url;
    } catch (error: any) {
        console.error('Catbox Upload Error:', error);
        if (error.name === 'AbortError') {
            throw new Error('Délai d\'attente dépassé.');
        }
        throw new Error('L\'hébergement par défaut a échoué (CORS/Réseau). Veuillez configurer une clé API ImgBB dans les paramètres.');
    }
};
