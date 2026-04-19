// --- 1. Multilingual dictionary configuration ---
const translations = {
    ja: {
        pageTitle: "錦鯉画像生成と評価", btnUpload: "実行する", txtProcessing: "処理中... しばらくお待ちください",
        lblUploadImg: "画像を選択:", lblUploadMask: "マスクを選択:",
        labelOriginal: "入力画像", labelOrigMask: "入力マスク",
        labelRecon: "生成画像", labelMask: "生成マスク ",
        labelHighlight: "差異ハイライト", labelScore: "評価スコア:",
        alertSelect: "入力画像を選択してください！", alertError: "エラーが発生しました: ", btnReset: "もう一度"
    },
    zh: {
        pageTitle: "锦鲤图像生成与评估", btnUpload: "运行分析", txtProcessing: "正在处理中，请稍候...",
        lblUploadImg: "选择原图:", lblUploadMask: "选择掩膜:",
        labelOriginal: "原始图像", labelOrigMask: "输入掩膜",
        labelRecon: "生成图像", labelMask: "生成掩膜",
        labelHighlight: "差异高亮图", labelScore: "评估得分:",
        alertSelect: "请至少选择一张要处理的原图！", alertError: "发生错误：", btnReset: "重新上传"
    },
    en: {
        pageTitle: "Koi Generation & Evaluation", btnUpload: "Run Analysis", txtProcessing: "Processing... Please wait.",
        lblUploadImg: "Select Image:", lblUploadMask: "Select Mask:",
        labelOriginal: "Original Image", labelOrigMask: "Original Mask",
        labelRecon: "Reconstructed Image", labelMask: "Reconstructed Mask",
        labelHighlight: "Difference Highlight Map", labelScore: "Evaluation Score:",
        alertSelect: "Please select an input image!", alertError: "Error occurred: ", btnReset: "Upload Another"
    }
};

let currentLang = 'ja';
const BACKEND_URL = "/process_image";

function changeLanguage() {
    const selector = document.getElementById('languageSelect');
    if (selector) currentLang = selector.value;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.innerText = translations[currentLang][key];
        }
    });
}

async function handleUpload() {
    const imageInput = document.getElementById('imageInput');
    const maskInput = document.getElementById('maskInput');
    
    const previewImg = document.getElementById('previewImg');
    const previewMask = document.getElementById('previewMask');
    const reconImg = document.getElementById('reconImg');
    const maskImg = document.getElementById('maskImg');
    const highlightImg = document.getElementById('highlightImg');
    const scoreText = document.getElementById('scoreText');
    
    const loadingText = document.getElementById('loading');
    const controlPanel = document.getElementById('controlPanel');
    const displayArea = document.getElementById('displayArea');
    const resetBtn = document.getElementById('resetBtn');
    
    // Get the two containers that were just assigned IDs in the HTML
    const inputMaskBox = document.getElementById('inputMaskBox');
    const bottomRow = document.getElementById('bottomRow');

    const t = translations[currentLang];

    // [Modification 2] Only validate whether the original image is uploaded
    if (imageInput.files.length === 0) {
        alert(t.alertSelect);
        return;
    }

    const imgFile = imageInput.files[0];
    const hasMask = maskInput.files.length > 0; // Check whether the user uploaded a mask
    
    previewImg.src = URL.createObjectURL(imgFile);
    
    const formData = new FormData();
    formData.append("image", imgFile);

    // [Modification 3] Dynamically control UI display and FormData content
    if (hasMask) {
        const maskFile = maskInput.files[0];
        previewMask.src = URL.createObjectURL(maskFile);
        formData.append("mask", maskFile); // Append only if provided
        
        inputMaskBox.style.display = "block"; // Show input mask box
        bottomRow.style.display = "flex";     // Show bottom scoring row
    } else {
        inputMaskBox.style.display = "none";  // Hide input mask box
        bottomRow.style.display = "none";     // Hide bottom scoring row
    }

    controlPanel.style.display = "none";
    displayArea.style.display = "flex"; 
    loadingText.style.display = "block";
    
    [reconImg, maskImg, highlightImg].forEach(img => img.style.opacity = "0.3");
    scoreText.innerText = "...";

    try {
        const response = await fetch(BACKEND_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // Render backend results
        reconImg.src = "data:image/png;base64," + data.reconstruction;
        maskImg.src  = "data:image/png;base64," + data.mask;
        
        // [Modification 4] Only render highlight and score if highlight data exists
        if (data.highlight) {
            highlightImg.src = "data:image/png;base64," + data.highlight;
            scoreText.innerText = data.score;
        }

    } catch (error) {
        console.error("Upload Error:", error);
        alert(t.alertError + error.message);
        resetApp();
    } finally {
        loadingText.style.display = "none";
        [reconImg, maskImg, highlightImg].forEach(img => img.style.opacity = "1");
        resetBtn.style.display = "inline-block";
    }
}

function resetApp() {
    document.getElementById('controlPanel').style.display = "inline-block";
    document.getElementById('displayArea').style.display = "none";
    document.getElementById('resetBtn').style.display = "none";
    
    document.getElementById('imageInput').value = ""; 
    document.getElementById('maskInput').value = ""; 
    
    ['previewImg', 'previewMask', 'reconImg', 'maskImg', 'highlightImg'].forEach(id => {
        document.getElementById(id).removeAttribute('src');
    });
}

window.onload = changeLanguage;
