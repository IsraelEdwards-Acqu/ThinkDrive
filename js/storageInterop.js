window.storageInterop = (function () {
    let supabaseClient = null;

    return {
        // Must be called from Blazor after supabaseInterop.init()
        setSupabase: function (client) {
            supabaseClient = client;
        },

        uploadFileFromInput: async function (inputId, bucket = "files") {
            try {
                if (!supabaseClient) throw new Error("Supabase not initialized");

                const input = document.getElementById(inputId);
                if (!input || !input.files || input.files.length === 0) {
                    console.warn("No file selected for upload:", inputId);
                    return null;
                }

                const file = input.files[0];
                const nameEl = document.getElementById(inputId + "FileName");
                if (nameEl) nameEl.textContent = file.name;

                const targetFolder = chooseFolder(file);
                const filePath = `${targetFolder}/${Date.now()}_${file.name}`;

                const { data, error } = await supabaseClient.storage
                    .from(bucket)
                    .upload(filePath, file);

                if (error) throw error;

                // Get public URL
                const { data: urlData } = supabaseClient.storage
                    .from(bucket)
                    .getPublicUrl(filePath);

                return urlData.publicUrl;
            } catch (err) {
                console.error("uploadFileFromInput error:", err);
                return null;
            }
        },

        deleteFile: async function (path, bucket = "files") {
            try {
                if (!supabaseClient) throw new Error("Supabase not initialized");

                const { error } = await supabaseClient.storage
                    .from(bucket)
                    .remove([path]);

                if (error) throw error;

                console.log("Deleted file:", path);
                return true;
            } catch (err) {
                console.error("deleteFile error:", err);
                return false;
            }
        },

        getDownloadUrl: async function (path, bucket = "files") {
            try {
                if (!supabaseClient) throw new Error("Supabase not initialized");

                const { data } = supabaseClient.storage
                    .from(bucket)
                    .getPublicUrl(path);

                return data.publicUrl;
            } catch (err) {
                console.error("getDownloadUrl error:", err);
                return null;
            }
        }
    };

    function chooseFolder(file) {
        if (file.type.startsWith("image/")) return "images";
        if (file.type.startsWith("video/")) return "videos";
        return "files";
    }
})();
