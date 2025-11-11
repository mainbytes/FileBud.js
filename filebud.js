class FileBud{
    constructor(){};
    fileWrapper(file){
        if(!file){
            console.error("[FileBud] Valid file blob is invalid or empty");
        } else{
            return {
                file,
                name: file.name,
                type: file.type,
                download:(filename) => {
                    const url = URL.createObjectURL(file);
                    const a = document.createElement("a");
                    a.download = filename || file.name;
                    a.href = url;
                    a.click();
                    URL.revokeObjectURL(url);
                },
                isType: (types) => {
                    if (!types) return false;
                    const check = (t) => {
                        t = t.toLowerCase();
                        const filename = file.name.toLowerCase();
                        const mime = file.type.toLowerCase();
                        if (t.startsWith(".")) return filename.endsWith(t);
                        return filename.endsWith("." + t) || mime === t;
                    };

                    if (Array.isArray(types)) {
                        return types.some(t => check(t));
                    } else {
                        return check(types);
                    }
                },
                read: (as = "text") => {
                    return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;

                    if (as === "text") reader.readAsText(file);
                    else if (as === "dataURL") reader.readAsDataURL(file);
                    else if (as === "arrayBuffer") reader.readAsArrayBuffer(file);
                    else reject(new Error("Unsupported read type"));
                    });
                }
            }
        }
    };
    getFileInput(query){
        const input = document.querySelector(query);
        if (!input || !input.files || !input.files[0]) {
            console.error("[FileBud] The file is unavailable");
            return null;
        }
        if (input.files.length > 1){
            console.error("[FileBud] The file uploaded is more than one, use getFilesInput for handling this")
        }
        return this.fileWrapper(input.files[0]);
    };
    getFilesInput(query){
        const input = document.querySelector(query);
        if (!input || !input.files || !input.files[0]) {
            console.error("[FileBud] The file is unavailable");
            return [];
        }
        return Array.from(input.files).map(f => this.fileWrapper(f));
    };
    async getFileInputFromURL(url, filename = "file") {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });
            return this.fileWrapper(file);
        } catch (err) {
            console.error("[FileBud] Failed to fetch file from URL:", err);
            return null;
        }
    }
    async getFilesInputFromURL(urls) {
        try {
            const files = await Promise.all(
                urls.map(async (url, i) => {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const base = url.split("?")[0].split("#")[0]
                    const parts = base.split("/")
                    const filename = parts[parts.length - 1] || parts[parts.length - 2] || `file${i+1}`;
                    return new File([blob], filename, { type: blob.type });
                })
            );
            return files.map((f) => this.fileWrapper(f));
        } catch (err) {
            console.error("[FileBud] Failed to fetch files from URLs:", err);
            return [];
        }
    }

}