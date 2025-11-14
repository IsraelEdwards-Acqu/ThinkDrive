window.supabaseInterop = (function () {
    let client = null;

    return {
        // === Initialization ===
        init: function (url, anonKey) {
            try {
                if (!url || !anonKey) {
                    console.warn('[supabaseInterop] init called with null config');
                    return;
                }

                if (client) {
                    console.log('[supabaseInterop] Supabase already initialized');
                    return;
                }

                client = supabase.createClient(url, anonKey);

                // ✅ Inject Supabase into storageInterop
                if (window.storageInterop && typeof window.storageInterop.setSupabase === "function") {
                    window.storageInterop.setSupabase(client);
                }

                console.log('[supabaseInterop] Supabase initialized');
            } catch (e) {
                console.error('[supabaseInterop] init error:', e);
            }
        },

        getClient: function () {
            return client;
        },

        // === Database CRUD (Postgres via REST) ===
        saveDocument: async function (table, doc) {
            if (!client) throw new Error('Supabase not initialized');
            const { data, error } = await client.from(table).insert(doc).select();
            if (error) throw error;
            return data[0]?.id || null;
        },

        getCollection: async function (table) {
            if (!client) throw new Error('Supabase not initialized');
            const { data, error } = await client.from(table).select();
            if (error) throw error;
            return data;
        },

        getDocument: async function (table, id) {
            if (!client) throw new Error('Supabase not initialized');
            const { data, error } = await client.from(table).select().eq('id', id).single();
            if (error) throw error;
            return data;
        },

        updateDocument: async function (table, id, dataObj) {
            if (!client) throw new Error('Supabase not initialized');
            const { error } = await client.from(table).update(dataObj).eq('id', id);
            if (error) throw error;
            return true;
        },

        deleteDocument: async function (table, id) {
            if (!client) throw new Error('Supabase not initialized');
            const { error } = await client.from(table).delete().eq('id', id);
            if (error) throw error;
            return true;
        },

        // === Storage Helpers ===
        uploadFileFromInput: async function (inputId, bucket = "files") {
            if (!client) throw new Error('Supabase not initialized');
            const input = document.getElementById(inputId);
            if (!input || !input.files || input.files.length === 0) {
                throw new Error('No file selected');
            }
            const file = input.files[0];
            const filePath = `${collectionName(file)}/${Date.now()}_${file.name}`;

            const { error } = await client.storage.from(bucket).upload(filePath, file);
            if (error) throw error;

            const { data } = client.storage.from(bucket).getPublicUrl(filePath);
            return data.publicUrl;
        },

        deleteFile: async function (path, bucket = "files") {
            if (!client) throw new Error('Supabase not initialized');
            const { error } = await client.storage.from(bucket).remove([path]);
            if (error) throw error;
            return true;
        },

        getDownloadUrl: async function (path, bucket = "files") {
            if (!client) throw new Error('Supabase not initialized');
            const { data } = client.storage.from(bucket).getPublicUrl(path);
            return data.publicUrl;
        }
    };

    // Helper: choose folder based on file type
    function collectionName(file) {
        if (file.type.startsWith('image/')) return 'images';
        if (file.type.startsWith('video/')) return 'videos';
        return 'files';
    }
})();