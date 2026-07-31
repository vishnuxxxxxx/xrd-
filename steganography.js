// Attach Event Listeners safely when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const encodeBtn = document.getElementById("encodeBtn");
    const decodeBtn = document.getElementById("decodeBtn");

    if (encodeBtn) encodeBtn.addEventListener("click", encodeMessage);
    if (decodeBtn) decodeBtn.addEventListener("click", decodeMessage);
});

// Helper: XOR Encryption/Decryption
function xorEncryptDecrypt(text, key) {
    if (!key) return text;
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Helper: Create offscreen dynamic canvas
function createOffscreenCanvas() {
    const canvas = document.createElement("canvas");
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    return canvas;
}

// Encode Message Function
function encodeMessage() {
    const fileInput = document.getElementById("imageInput");
    const messageInput = document.getElementById("secretMessage");
    const passwordInput = document.getElementById("encryptPassword");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select an image first!");
        return;
    }

    if (!messageInput || !messageInput.value.trim()) {
        alert("Please enter a secret message!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            try {
                const canvas = createOffscreenCanvas();
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const password = passwordInput ? passwordInput.value : "";
                const processedMsg = xorEncryptDecrypt(messageInput.value, password);
                const fullMessage = processedMsg + "##EOF##";

                let binaryMessage = "";
                for (let i = 0; i < fullMessage.length; i++) {
                    let bin = fullMessage.charCodeAt(i).toString(2).padStart(8, "0");
                    binaryMessage += bin;
                }

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                if (binaryMessage.length > (data.length / 4)) {
                    alert("Message is too large for this image!");
                    canvas.remove();
                    return;
                }

                for (let i = 0; i < binaryMessage.length; i++) {
                    data[i * 4] = (data[i * 4] & ~1) | parseInt(binaryMessage[i]);
                }

                ctx.putImageData(imgData, 0, 0);

                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "hidden_secret_image.png";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    canvas.remove();
                    alert("Secret message hidden successfully! Image downloaded.");
                }, "image/png");

            } catch (err) {
                console.error("Encoding error:", err);
                alert("Error encoding image: " + err.message);
            }
        };
        img.onerror = () => alert("Error loading image file.");
        img.src = event.target.result;
    };
    reader.onerror = () => alert("Error reading file.");
    reader.readAsDataURL(fileInput.files[0]);
}

// Decode Message Function
function decodeMessage() {
    const fileInput = document.getElementById("decodeImageInput");
    const passwordInput = document.getElementById("decryptPassword");
    const outputContainer = document.getElementById("revealedOutputContainer");
    const outputDiv = document.getElementById("revealedOutput");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select an encoded image first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            try {
                const canvas = createOffscreenCanvas();
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                let binaryMessage = "";
                for (let i = 0; i < data.length; i += 4) {
                    binaryMessage += (data[i] & 1).toString();
                }

                let fullMessage = "";
                for (let i = 0; i < binaryMessage.length; i += 8) {
                    let byte = binaryMessage.slice(i, i + 8);
                    if (byte.length < 8) break;
                    let char = String.fromCharCode(parseInt(byte, 2));
                    fullMessage += char;

                    if (fullMessage.endsWith("##EOF##")) {
                        fullMessage = fullMessage.replace("##EOF##", "");
                        break;
                    }
                }

                const password = passwordInput ? passwordInput.value : "";
                const decryptedMsg = xorEncryptDecrypt(fullMessage, password);

                if (decryptedMsg) {
                    outputDiv.textContent = decryptedMsg;
                    outputContainer.classList.remove("hidden");
                } else {
                    alert("No secret message found or incorrect password!");
                    outputContainer.classList.add("hidden");
                }
                canvas.remove();

            } catch (err) {
                console.error("Decoding error:", err);
                alert("Error decoding image. It may be corrupted or missing hidden data.");
            }
        };
        img.onerror = () => alert("Error loading image file.");
        img.src = event.target.result;
    };
    reader.onerror = () => alert("Error reading file.");
    reader.readAsDataURL(fileInput.files[0]);
}

