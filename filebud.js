class FileBud {
  constructor() {}
  conf = {
    memoryRevokeTimeout: 3000,
    prefix: "[FileBud]",
  };
  fileWrapper(file) {
    if (!file) {
      console.error("[FileBud] Valid file blob is invalid or empty");
    } else {
      return {
        file,
        name: file.name,
        type: file.type,
        download: (filename) => {
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.download = filename || file.name;
          a.href = url;
          a.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, this.conf.memoryRevokeTimeout);
        },
        isType: (types) => {
          if (!types) return false;

          const check = (t) => {
            t = t.toLowerCase();
            const filename = file.name.toLowerCase();
            const mime = file.type.toLowerCase();

            // If t is only letters, numbers, or a leading dot → normal string check
            if (/^[a-z0-9]+$|^\.[a-z0-9]+$/.test(t)) {
              return (
                filename.endsWith(t.startsWith(".") ? t : "." + t) || mime === t
              );
            }

            // Otherwise treat as regex
            try {
              const regex = new RegExp(t, "i");
              return regex.test(filename) || regex.test(mime);
            } catch (err) {
              console.warn("[FileBud] Invalid regex:", t);
              return false;
            }
          };

          return Array.isArray(types) ? types.some(check) : check(types);
        },
        read: (as = "text", chunkSize = 1024 * 1024) => {
          return new Promise(async (resolve, reject) => {
            if (!file) return reject(new Error("[FileBud] No file loaded"));

            let resultChunks = [];

            const processChunk = (blob) => {
              return new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onerror = rej;
                reader.onload = () => res(reader.result);

                if (as === "text" || as === "json") reader.readAsText(blob);
                else if (as === "arrayBuffer" || as === "binaryString")
                  reader.readAsArrayBuffer(blob);
                else if (as === "dataURL") reader.readAsDataURL(blob);
                else rej(new Error(`[FileBud] Unsupported read type: ${as}`));
              });
            };

            try {
              const total = file.size;
              for (let offset = 0; offset < total; offset += chunkSize) {
                const chunk = file.slice(offset, offset + chunkSize);
                let chunkData = await processChunk(chunk);

                // Safe binaryString conversion in subchunks
                if (as === "binaryString" && chunkData instanceof ArrayBuffer) {
                  const bytes = new Uint8Array(chunkData);
                  const subChunkSize = 0x8000; // 32k
                  let str = "";
                  for (let i = 0; i < bytes.length; i += subChunkSize) {
                    const subArray = bytes.subarray(i, i + subChunkSize);
                    str += String.fromCharCode.apply(null, subArray);
                  }
                  chunkData = str;
                }

                resultChunks.push(chunkData);
                // allow UI to breathe
                await new Promise((r) => setTimeout(r, 0));
              }

              let finalResult = resultChunks.join("");

              if (as === "json") {
                try {
                  finalResult = JSON.parse(finalResult);
                } catch {
                  return reject(new Error("[FileBud] Invalid JSON content"));
                }
              }

              resolve(finalResult);
            } catch (err) {
              reject(err);
            }
          });
        },
        size: file.size,
        sizeAs: (unit) => {
          let byteUnitDivisor = {
            B: 1,
            KiB: 1024,
            MiB: Math.pow(1024, 2),
            GiB: Math.pow(1024, 3),
            TiB: Math.pow(1024, 4),
            PiB: Math.pow(1024, 5),
            KB: 1000,
            MB: Math.pow(1000, 2),
            GB: Math.pow(1000, 3),
            TB: Math.pow(1000, 4),
            PB: Math.pow(1000, 5),
          };
          return file.size / byteUnitDivisor[unit || "B"];
        },
        displaySize: (round = 2, bin = true, unit) => {
          const size = file.size;
          const binUnits = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
          const decUnits = ["B", "KB", "MB", "GB", "TB", "PB"];
          let usedUnits = bin ? binUnits : decUnits;
          let divisor = bin ? 1024 : 1000;
          let magnitude = 0;
          if (unit) {
            magnitude = usedUnits.indexOf(unit);
            if (magnitude === -1) magnitude = 0;
          } else {
            magnitude =
              size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(divisor));
            magnitude = Math.min(magnitude, usedUnits.length - 1);
          }

          return `${(size / Math.pow(divisor, magnitude)).toFixed(round)} ${
            usedUnits[magnitude]
          }`;
        },
      };
    }
  }
  getFileInput(query) {
    return new Promise((resolve, reject) => {
      const input = document.querySelector(query);
      if (!input || !input.files || !input.files[0]) {
        reject(this.conf.prefix + " The file is unavailable");
      }
      if (input.files.length > 1) {
        reject(
          this.conf.prefix +
            " The file uploaded is more than one, use getFilesInput for handling this"
        );
      }
      resolve(this.fileWrapper(input.files[0]));
    });
  }
  getFilesInput(query) {
    return new Promise((resolve, reject) => {
      const input = document.querySelector(query);
      if (!input || !input.files || !input.files[0]) {
        reject(this.conf.prefix + " The file is unavailable");
      }
      resolve(Array.from(input.files).map((f) => this.fileWrapper(f)));
    });
  }
  downloadString(str, filename = "file.txt", mimeType = "text/plain") {
    const blob = new Blob([str], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });
    return this.fileWrapper(file).download();
  }

  // Download a JS object as JSON
  downloadJSON(obj, filename = "file.json") {
    const str = JSON.stringify(obj, null, 2); // formatted JSON
    const blob = new Blob([str], { type: "application/json" });
    const file = new File([blob], filename, { type: "application/json" });
    return this.fileWrapper(file).download();
  }
  async getFileInputFromURL(url, filename = "file") {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      return this.fileWrapper(file);
    } catch (err) {
      console.error(this.conf.prefix + " Failed to fetch file from URL:", err);
      return null;
    }
  }
  async getFilesInputFromURL(urls) {
    try {
      const files = await Promise.all(
        urls.map(async (url, i) => {
          const response = await fetch(url);
          const blob = await response.blob();
          const base = url.split("?")[0].split("#")[0];
          const parts = base.split("/");
          const filename =
            parts[parts.length - 1] ||
            parts[parts.length - 2] ||
            `file${i + 1}`;
          return new File([blob], filename, { type: blob.type });
        })
      );
      return files.map((f) => this.fileWrapper(f));
    } catch (err) {
      console.error(
        this.conf.prefix + " Failed to fetch files from URLs:",
        err
      );
      return [];
    }
  }
}
