# FileBud

A lightweight JavaScript library for handling file operations with ease. FileBud provides a simple and intuitive API for reading, downloading, and manipulating files in the browser.

## Features

- 📁 File wrapper with utility methods
- 📖 Read files as text, JSON, arrayBuffer, binaryString, or dataURL
- 💾 Download files with automatic memory cleanup
- 🔍 File type detection with regex support
- 📊 File size utilities with multiple unit formats
- 🌐 Fetch files from URLs
- 🎯 Support for both single and multiple file inputs

## Installation
Add the CDN link of the library in the script tag on HTML
```html
<script src="https://cdn.jsdelivr.net/gh/mainbytes/FileBud.js/filebud.min.js"></script>
```

Or if it should be functional offline, download or copy-paste the script and link it
 ```html
<script src="./assets/js/filebud.min.js"></script>
```
## Quick Start

```javascript
// Initialize FileBud
const fileBud = new FileBud();

// Get a file from file input
const file = await fileBud.getFileInput('#file-input');

// Or create from existing File/Blob
const myFile = fileBud.fileWrapper(someFileBlob);
```

## API Reference

### Core Methods

#### `fileWrapper(file)`
Wraps a File/Blob object with utility methods.

```javascript
const wrappedFile = fileBud.fileWrapper(myFile);
```

#### `getFileInput(query)`
Gets a single file from a file input element.

```javascript
const file = await fileBud.getFileInput('#file-input');
```

#### `getFilesInput(query)`
Gets multiple files from a file input element.

```javascript
const files = await fileBud.getFilesInput('#file-input');
```

#### `getFileInputFromURL(url, filename)`
Fetches a file from a URL.

```javascript
const file = await fileBud.getFileInputFromURL('https://example.com/file.pdf');
```

#### `getFilesInputFromURL(urls)`
Fetches multiple files from URLs.

```javascript
const files = await fileBud.getFilesInputFromURL([
  'https://example.com/file1.pdf',
  'https://example.com/file2.jpg'
]);
```

#### `downloadString(str, filename, mimeType)`
Downloads a string as a file.

```javascript
fileBud.downloadString('Hello World!', 'greeting.txt', 'text/plain');
```

#### `downloadJSON(obj, filename)`
Downloads a JavaScript object as a JSON file.

```javascript
fileBud.downloadJSON({name: 'John', age: 30}, 'user.json');
```

### File Wrapper Methods

Each wrapped file has the following methods:

#### `download(filename)`
Downloads the file.

```javascript
file.download(); // Uses original filename
file.download('custom-name.pdf'); // Uses custom filename
```

#### `isType(types)`
Checks if the file matches given type(s).

```javascript
file.isType('pdf'); // Check for PDF
file.isType(['jpg', 'jpeg', 'png']); // Check for image types
file.isType(/\.(txt|md)$/i); // Check with regex
```

#### `read(as, chunkSize)`
Reads file content. Supports chunked reading for large files.

```javascript
// Read as text (default)
const text = await file.read('text');

// Read as JSON
const json = await file.read('json');

// Read as arrayBuffer
const buffer = await file.read('arrayBuffer');

// Read as binaryString
const binary = await file.read('binaryString');

// Read as dataURL
const dataURL = await file.read('dataURL');

// Read with custom chunk size (1MB chunks)
const content = await file.read('text', 1024 * 1024);
```

#### `size`
Original file size in bytes.

```javascript
console.log(file.size); // 1024000
```

#### `sizeAs(unit)`
Get file size in specific units.

```javascript
file.sizeAs('KB'); // Size in kilobytes
file.sizeAs('MiB'); // Size in mebibytes
```

**Supported units:** `B`, `KB`, `MB`, `GB`, `TB`, `PB`, `KiB`, `MiB`, `GiB`, `TiB`, `PiB`

#### `displaySize(round, bin, unit)`
Get formatted file size string.

```javascript
file.displaySize(); // "1.02 MiB" (default: 2 decimal, binary units)
file.displaySize(0); // "1 MiB" (no decimals)
file.displaySize(2, false); // "1.07 MB" (decimal units)
file.displaySize(2, true, 'KiB'); // "1048.58 KiB" (force specific unit)
```

## Configuration

Configure FileBud instance:

```javascript
const fileBud = new FileBud();
fileBud.conf.memoryRevokeTimeout = 5000; // Increase URL revocation timeout
fileBud.conf.prefix = "[MyApp]"; // Custom log prefix
```

## Examples

### Basic File Handling

```javascript
// Handle file input change
document.querySelector('#file-input').addEventListener('change', async (e) => {
  try {
    const file = await fileBud.getFileInput('#file-input');
    
    // Check if it's an image
    if (file.isType(['jpg', 'png', 'gif'])) {
      console.log('It\'s an image!');
    }
    
    // Get file info
    console.log(`Name: ${file.name}`);
    console.log(`Size: ${file.displaySize()}`);
    console.log(`Type: ${file.type}`);
    
    // Read content
    const content = await file.read('text');
    console.log('File content:', content);
    
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### Multiple Files

```javascript
const files = await fileBud.getFilesInput('#multi-file-input');

for (const file of files) {
  console.log(`Processing: ${file.name}`);
  
  if (file.isType('pdf')) {
    console.log('Found a PDF file');
    // Process PDF
  }
}
```

### Download Utilities

```javascript
// Download text
fileBud.downloadString('Hello World!', 'hello.txt');

// Download JSON
const data = { users: [{ name: 'John', id: 1 }] };
fileBud.downloadJSON(data, 'users.json');

// Download existing file
file.download('backup.pdf');
```

### Remote Files

```javascript
// Fetch single file from URL
const remoteFile = await fileBud.getFileInputFromURL(
  'https://example.com/document.pdf',
  'downloaded.pdf'
);

// Fetch multiple files
const remoteFiles = await fileBud.getFilesInputFromURL([
  'https://example.com/file1.jpg',
  'https://example.com/file2.png'
]);
```

## Error Handling

```javascript
try {
  const file = await fileBud.getFileInput('#file-input');
  const content = await file.read('json');
} catch (error) {
  if (error.message.includes('unavailable')) {
    console.error('No file selected');
  } else if (error.message.includes('more than one')) {
    console.error('Please select only one file');
  } else if (error.message.includes('Invalid JSON')) {
    console.error('File is not valid JSON');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Browser Support

FileBud works in all modern browsers that support:
- File API
- Fetch API
- Promise
- async/await

## License

MIT License - see LICENSE file for details.

---

FileBud makes file handling in the browser simple and intuitive. Whether you're working with local files, remote URLs, or creating downloads, FileBud has you covered with a clean, promise-based API.