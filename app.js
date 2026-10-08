// InkErase AI - Studio Inpainting & Portrait Blur Engine
// Supports:
// 1. Studio Precision Tattoo Removal (Multi-Island LaMa + Smart Ink-Snap + Skin Grain)
// 2. AI Background Blur (Human-isolated Bokeh with Real-time Blur Density Slider)
// 3. Manual Blur Brush (Selective Blur with Adjustable Brush Size & Blur Density)

(function () {
  'use strict';

  // DOM Elements - Common
  const imageInput = document.getElementById('imageInput');
  const emptyState = document.getElementById('emptyState');
  const editorView = document.getElementById('editorView');
  const bottomBar = document.getElementById('bottomBar');

  const baseCanvas = document.getElementById('baseCanvas');
  const maskCanvas = document.getElementById('maskCanvas');
  const cursorCanvas = document.getElementById('cursorCanvas');
  const canvasWrapper = document.getElementById('canvasWrapper');
  const canvasViewport = document.getElementById('canvasViewport');

  const btnNewImage = document.getElementById('btnNewImage');
  const btnCompare = document.getElementById('btnCompare');
  const btnZoomReset = document.getElementById('btnZoomReset');
  const originalBadge = document.getElementById('originalBadge');

  const saveSuccessModal = document.getElementById('saveSuccessModal');
  const btnModalNewImage = document.getElementById('btnModalNewImage');
  const btnModalStay = document.getElementById('btnModalStay');
  const btnModalShare = document.getElementById('btnModalShare');
  const gpuStatusText = document.getElementById('gpuStatusText');

  const processingOverlay = document.getElementById('processingOverlay');
  const processStatusTitle = document.getElementById('processStatusTitle');
  const processStatusSub = document.getElementById('processStatusSub');
  const progressFill = document.getElementById('progressFill');

  // Studio Tool Tabs
  const tabErase = document.getElementById('tabErase');
  const tabBgBlur = document.getElementById('tabBgBlur');
  const tabBrushBlur = document.getElementById('tabBrushBlur');
  const tabSkinSmooth = document.getElementById('tabSkinSmooth');
  const tabAdjust = document.getElementById('tabAdjust');
  const tabCanvas = document.getElementById('tabCanvas');
  const tabCrop = document.getElementById('tabCrop');

  // Tool Panels
  const panelErase = document.getElementById('panelErase');
  const panelBgBlur = document.getElementById('panelBgBlur');
  const panelBrushBlur = document.getElementById('panelBrushBlur');
  const panelSkinSmooth = document.getElementById('panelSkinSmooth');
  const panelAdjust = document.getElementById('panelAdjust');
  const panelCanvas = document.getElementById('panelCanvas');
  const panelCrop = document.getElementById('panelCrop');
  const cropOverlayLayer = document.getElementById('cropOverlayLayer');

  // Tool 1: Tattoo Erase Controls
  const brushSizeInput = document.getElementById('brushSize');
  const brushSizeVal = document.getElementById('brushSizeVal');
  const btnUndo = document.getElementById('btnUndo');
  const btnClearMask = document.getElementById('btnClearMask');
  const btnEraseTattoo = document.getElementById('btnEraseTattoo');
  const btnSaveImage = document.getElementById('btnSaveImage');

  // Tool 2: Background Blur Controls
  const bgBlurDensityInput = document.getElementById('bgBlurDensity');
  const bgBlurDensityVal = document.getElementById('bgBlurDensityVal');
  const bgBlurFeatherInput = document.getElementById('bgBlurFeather');
  const bgBlurFeatherVal = document.getElementById('bgBlurFeatherVal');
  const btnCancelBgBlur = document.getElementById('btnCancelBgBlur');
  const btnApplyBgBlur = document.getElementById('btnApplyBgBlur');
  const btnSaveImageBg = document.getElementById('btnSaveImageBg');

  // Tool 3: Manual Blur Brush Controls
  const manualBrushSizeInput = document.getElementById('manualBrushSize');
  const manualBrushSizeVal = document.getElementById('manualBrushSizeVal');
  const manualBlurDensityInput = document.getElementById('manualBlurDensity');
  const manualBlurDensityVal = document.getElementById('manualBlurDensityVal');
  const manualBrushFeatherInput = document.getElementById('manualBrushFeather');
  const manualBrushFeatherVal = document.getElementById('manualBrushFeatherVal');
  const btnUndoBlurBrush = document.getElementById('btnUndoBlurBrush');
  const btnRevertBlurBrush = document.getElementById('btnRevertBlurBrush');
  const btnSaveImageBrush = document.getElementById('btnSaveImageBrush');

  // Tool 4: Skin Smooth Controls
  const skinSmoothBrushSizeInput = document.getElementById('skinSmoothBrushSize');
  const skinSmoothBrushSizeVal = document.getElementById('skinSmoothBrushSizeVal');
  const skinSmoothStrengthInput = document.getElementById('skinSmoothStrength');
  const skinSmoothStrengthVal = document.getElementById('skinSmoothStrengthVal');
  const skinSmoothFeatherInput = document.getElementById('skinSmoothFeather');
  const skinSmoothFeatherVal = document.getElementById('skinSmoothFeatherVal');
  const btnUndoSkinSmooth = document.getElementById('btnUndoSkinSmooth');
  const btnRevertSkinSmooth = document.getElementById('btnRevertSkinSmooth');
  const btnSaveImageSmooth = document.getElementById('btnSaveImageSmooth');

  // Tool 5: Color Adjustment Controls
  const adjBrightnessInput = document.getElementById('adjBrightness');
  const adjBrightnessVal = document.getElementById('adjBrightnessVal');
  const adjContrastInput = document.getElementById('adjContrast');
  const adjContrastVal = document.getElementById('adjContrastVal');
  const adjSaturationInput = document.getElementById('adjSaturation');
  const adjSaturationVal = document.getElementById('adjSaturationVal');
  const adjWarmthInput = document.getElementById('adjWarmth');
  const adjWarmthVal = document.getElementById('adjWarmthVal');
  const btnResetAdjust = document.getElementById('btnResetAdjust');
  const btnApplyAdjust = document.getElementById('btnApplyAdjust');
  const btnSaveImageAdjust = document.getElementById('btnSaveImageAdjust');

  // Tool 6: Text Studio Controls
  const tabText = document.getElementById('tabText');
  const panelText = document.getElementById('panelText');
  const textOverlayLayer = document.getElementById('textOverlayLayer');
  const textBoxElement = document.getElementById('textBoxElement');
  const textContentDisplay = document.getElementById('textContentDisplay');
  const btnDeleteText = document.getElementById('btnDeleteText');
  const btnDragText = document.getElementById('btnDragText');
  const textStudioInput = document.getElementById('textStudioInput');
  const btnClearTextInput = document.getElementById('btnClearTextInput');
  const fontChipsScroll = document.getElementById('fontChipsScroll');
  const activeFontTag = document.getElementById('activeFontTag');
  const activeColorTag = document.getElementById('activeColorTag');
  const btnTextBold = document.getElementById('btnTextBold');
  const btnTextItalic = document.getElementById('btnTextItalic');
  const btnTextUnderline = document.getElementById('btnTextUnderline');
  const btnTextAlignCenter = document.getElementById('btnTextAlignCenter');
  const btnTextAlignLeft = document.getElementById('btnTextAlignLeft');
  const btnTextAlignRight = document.getElementById('btnTextAlignRight');
  const textColorPicker = document.getElementById('textColorPicker');
  const textSizeSlider = document.getElementById('textSizeSlider');
  const textSizeVal = document.getElementById('textSizeVal');
  const textOpacitySlider = document.getElementById('textOpacitySlider');
  const textOpacityVal = document.getElementById('textOpacityVal');
  const btnResetText = document.getElementById('btnResetText');
  const btnApplyText = document.getElementById('btnApplyText');
  const btnSaveImageText = document.getElementById('btnSaveImageText');
  const btnCancelText = document.getElementById('btnCancelText');
  const btnCancelTextBottom = document.getElementById('btnCancelTextBottom');

  // Text Studio Effect Controls
  const panelOutlineSettings = document.getElementById('panelOutlineSettings');
  const activeOutlineTag = document.getElementById('activeOutlineTag');
  const outlineColorPicker = document.getElementById('outlineColorPicker');
  const outlineWidthSlider = document.getElementById('outlineWidthSlider');
  const outlineWidthVal = document.getElementById('outlineWidthVal');
  const outlineOpacitySlider = document.getElementById('outlineOpacitySlider');
  const outlineOpacityVal = document.getElementById('outlineOpacityVal');

  const panelShadowSettings = document.getElementById('panelShadowSettings');
  const activeShadowTag = document.getElementById('activeShadowTag');
  const shadowColorPicker = document.getElementById('shadowColorPicker');
  const shadowBlurSlider = document.getElementById('shadowBlurSlider');
  const shadowBlurVal = document.getElementById('shadowBlurVal');
  const shadowDistSlider = document.getElementById('shadowDistSlider');
  const shadowDistVal = document.getElementById('shadowDistVal');
  const shadowOpacitySlider = document.getElementById('shadowOpacitySlider');
  const shadowOpacityVal = document.getElementById('shadowOpacityVal');

  const panelGlowSettings = document.getElementById('panelGlowSettings');
  const activeGlowTag = document.getElementById('activeGlowTag');
  const glowColorPicker = document.getElementById('glowColorPicker');
  const glowRadiusSlider = document.getElementById('glowRadiusSlider');
  const glowRadiusVal = document.getElementById('glowRadiusVal');
  const glowOpacitySlider = document.getElementById('glowOpacitySlider');
  const glowOpacityVal = document.getElementById('glowOpacityVal');

  const panelBoxSettings = document.getElementById('panelBoxSettings');
  const activeBoxTag = document.getElementById('activeBoxTag');
  const boxColorPicker = document.getElementById('boxColorPicker');
  const boxOpacitySlider = document.getElementById('boxOpacitySlider');
  const boxOpacityVal = document.getElementById('boxOpacityVal');

  // Canvas Contexts
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  const cursorCtx = cursorCanvas.getContext('2d');
  const pipMagnifier = document.getElementById('pipMagnifier');
  const pipCanvas = document.getElementById('pipCanvas');
  const pipCtx = pipCanvas ? pipCanvas.getContext('2d', { willReadFrequently: true }) : null;

  // State Management
  let activeTool = 'erase';         // 'erase' | 'bgblur' | 'brushblur' | 'skinsmooth' | 'adjust' | 'text'
  let pristineOriginalImage = null; // Unaltered original for compare
  let currentWorkingImage = null;   // Active baked image
  let imageHistory = [];            // Undo stack for image commits
  let maskStrokeHistory = [];       // Undo stack for red tattoo strokes
  let isComparing = false;          // Original vs edited comparison state
  const MAX_HISTORY = 12;

  // Background Blur Cache
  let cachedSubjectCutout = null;   // Cutout Image with transparent BG
  let cachedSubjectMask = null;     // Legacy mask cache
  let isExtractingMask = false;

  // Manual Blur Brush State
  let blurSourceCanvas = null;      // Offscreen snapshot blurred for manual painting
  let manualBrushRadius = parseInt(manualBrushSizeInput.value, 10);
  let manualBlurDensity = parseInt(manualBlurDensityInput.value, 10);
  let manualBrushFeather = parseInt(manualBrushFeatherInput ? manualBrushFeatherInput.value : 75, 10);

  // Tool 4: Skin Smooth State (Wrinkles & Cellulite Softener)
  let smoothSourceCanvas = null;    // Offscreen snapshot smoothed for skin brush
  let skinSmoothRadius = parseInt(skinSmoothBrushSizeInput ? skinSmoothBrushSizeInput.value : 45, 10);
  let skinSmoothStrength = parseInt(skinSmoothStrengthInput ? skinSmoothStrengthInput.value : 12, 10);
  let skinSmoothFeather = parseInt(skinSmoothFeatherInput ? skinSmoothFeatherInput.value : 80, 10);

  // Tool 5: Color Adjustment State
  let adjustBrightness = 0;
  let adjustContrast = 0;
  let adjustSaturation = 0;
  let adjustWarmth = 0;

  // Tool 6: Text Studio State
  let textString = 'MayaTheDiva.com';
  let textFont = 'Inter';
  let textSize = 8;
  let textOpacity = 0.5;
  let textColor = '#ffffff';
  let textBold = false;
  let textItalic = false;
  let textUnderline = false;
  let textAlign = 'center';
  let textEffect = 'none'; // 'none' | 'border' | 'shadow' | 'glow' | 'box'
  let textDisplayX = 0;
  let textDisplayY = 0;
  let isTextDragging = false;
  let dragStartPointerX = 0;
  let dragStartPointerY = 0;
  let dragStartTextX = 0;
  let dragStartTextY = 0;

  // Individual Effect Parameters (Isolated from Text Fill)
  let outlineColor = '#000000';
  let outlineWidth = 4;
  let outlineOpacity = 1.0;

  let shadowColor = '#000000';
  let shadowBlur = 12;
  let shadowDist = 4;
  let shadowOpacity = 0.9;

  let glowColor = '#38bdf8';
  let glowRadius = 18;
  let glowOpacity = 1.0;

  let boxColor = '#000000';
  let boxOpacity = 0.72;

  // Tool 7: Canva Frame State (Aspect Ratios + InShot Blur/Color BG)
  let canvasRatio = 'orig';           // 'orig' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3' | '2:3'
  let canvasBgType = 'blur';          // 'blur' | 'color'
  let canvasBlurIntensity = 30;       // 5 to 65px
  let canvasSolidColor = '#FFFFFF';
  let canvasFitScale = 0.85;          // 0.20 to 3.0
  let canvasOffsetX = 0;              // Drag shift X inside frame
  let canvasOffsetY = 0;              // Drag shift Y inside frame
  let isCanvaDragging = false;
  let canvaDragStartX = 0;
  let canvaDragStartY = 0;
  let isCanvaPinching = false;
  let canvaPinchDist = 0;

  // Tool 8: Crop & Straighten State
  let cropRatio = 'free';             // 'free' | 'orig' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3'
  let cropRect = { x: 0, y: 0, w: 0, h: 0 };
  let isDraggingCrop = false;
  let activeCropHandle = null;        // null | 'box' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
  let cropDragStart = { mouseX: 0, mouseY: 0, startRect: null };

  function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(255, 255, 255, ${alpha !== undefined ? alpha : 1})`;
    let c = hex.replace('#', '').trim();
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    if (isNaN(num)) return `rgba(255, 255, 255, ${alpha !== undefined ? alpha : 1})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const a = typeof alpha === 'number' ? Math.max(0, Math.min(1, alpha)) : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Zoom & Pan State
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let defaultPanX = 0;
  let defaultPanY = 0;
  let displayWidth = 0;
  let displayHeight = 0;

  let isPinching = false;
  let startPinchDist = 0;
  let startScale = 1.0;
  let startPanX = 0;
  let startPanY = 0;
  let pinchMidpoint = { x: 0, y: 0 };
  let lastTapTime = 0;

  // Drawing State
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let eraseBrushRadius = parseInt(brushSizeInput.value, 10);
  // Permanent 24/7 Cloud AI Engine on Hugging Face ZeroGPU
  let CLOUD_TUNNEL_URL = 'https://qadirdelhi2-inkerase-ai.hf.space';
  const GITHUB_ENDPOINT_URL = 'https://raw.githubusercontent.com/qadirdelhi2/inkerase-ai/master/endpoint.json';

  async function syncBackendEndpoint() {
    try {
      const res = await fetch(GITHUB_ENDPOINT_URL, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const activeUrl = data.endpoint || data.url;
        if (activeUrl) {
          CLOUD_TUNNEL_URL = activeUrl.replace(/\/+$/, '');
          console.log('[InkErase] Active AI backend synced from cloud:', CLOUD_TUNNEL_URL);
        }
      }
    } catch (e) {
      console.warn('[InkErase] Cloud sync fallback to active preset:', CLOUD_TUNNEL_URL);
    }
  }
  syncBackendEndpoint();

  function getApiEndpoint(path) {
    // 1. In local desktop browser testing directly on port 8080
    if ((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && window.location.port === '8080') {
      return path;
    }
    // 2. If opened from localhost/127.0.0.1 on another port (e.g., Live Server port 5500, 3000, 80)
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
      return `http://127.0.0.1:8080${path}`;
    }
    // 3. If accessed through the cloud tunnel web page directly
    if (window.location.origin === CLOUD_TUNNEL_URL) {
      return path;
    }
    // 4. In native Android APK (https://localhost, capacitor://, file://, etc.) or external network
    return `${CLOUD_TUNNEL_URL}${path}`;
  }

  // Universal Cloud / Local AI Engine Caller
  async function callCloudAi(endpointName, dataArray, localPath, localBody, timeoutMs = 45000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 1. Permanent Hugging Face Space (ZeroGPU Cloud Engine)
      if (CLOUD_TUNNEL_URL && CLOUD_TUNNEL_URL.includes('hf.space')) {
        const callUrl = `${CLOUD_TUNNEL_URL}/gradio_api/call/${endpointName}`;
        const callRes = await fetch(callUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: dataArray }),
          signal: controller.signal
        });
        if (!callRes.ok) throw new Error(`HF Space API HTTP ${callRes.status}`);
        const { event_id } = await callRes.json();
        if (!event_id) throw new Error('No event_id returned from HF Space');

        const streamUrl = `${CLOUD_TUNNEL_URL}/gradio_api/call/${endpointName}/${event_id}`;
        const streamRes = await fetch(streamUrl, { signal: controller.signal });
        if (!streamRes.ok) throw new Error(`HF Space Stream HTTP ${streamRes.status}`);
        const text = await streamRes.text();
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr.startsWith('[')) {
              const arr = JSON.parse(jsonStr);
              return arr[0];
            }
          }
        }
        throw new Error('No valid data received in HF Space stream');
      }

      // 2. Localhost server or standard REST fallback
      const targetUrl = getApiEndpoint(localPath);
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localBody),
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`Local server HTTP ${res.status}`);
      const data = await res.json();
      return data.result || data.cutout;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  gpuStatusText.textContent = '⚡ Cloud AI 24/7 Active';

  // ==========================================
  // 1. Tool Switching & Tab Navigation
  // ==========================================
  function switchStudioTool(tool) {
    if (activeTool === tool) return;

    // If leaving bgblur, adjust or canvas without applying, restore previous working image
    if ((activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'canvas') && currentWorkingImage) {
      if (baseCanvas.width !== currentWorkingImage.width || baseCanvas.height !== currentWorkingImage.height) {
        baseCanvas.width = currentWorkingImage.width;
        baseCanvas.height = currentWorkingImage.height;
      }
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(currentWorkingImage, 0, 0);
      if (activeTool === 'adjust') resetAdjustSliders();
    }

    // If leaving crop tool, hide crop overlay
    if (cropOverlayLayer) cropOverlayLayer.classList.add('hidden');

    activeTool = tool;

    // Update Tab UI
    tabErase.classList.toggle('active', tool === 'erase');
    tabBgBlur.classList.toggle('active', tool === 'bgblur');
    tabBrushBlur.classList.toggle('active', tool === 'brushblur');
    tabSkinSmooth.classList.toggle('active', tool === 'skinsmooth');
    tabAdjust.classList.toggle('active', tool === 'adjust');
    if (tabText) tabText.classList.toggle('active', tool === 'text');
    if (tabCanvas) tabCanvas.classList.toggle('active', tool === 'canvas');
    if (tabCrop) tabCrop.classList.toggle('active', tool === 'crop');

    // Update Panels
    panelErase.classList.toggle('hidden', tool !== 'erase');
    panelBgBlur.classList.toggle('hidden', tool !== 'bgblur');
    panelBrushBlur.classList.toggle('hidden', tool !== 'brushblur');
    panelSkinSmooth.classList.toggle('hidden', tool !== 'skinsmooth');
    panelAdjust.classList.toggle('hidden', tool !== 'adjust');
    if (panelText) panelText.classList.toggle('hidden', tool !== 'text');
    if (panelCanvas) panelCanvas.classList.toggle('hidden', tool !== 'canvas');
    if (panelCrop) panelCrop.classList.toggle('hidden', tool !== 'crop');

    // Update Canvas Overlays
    if (textOverlayLayer) textOverlayLayer.classList.toggle('hidden', tool !== 'text');

    // Tool-specific initialization
    if (tool === 'erase') {
      maskCanvas.style.pointerEvents = 'none';
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateUndoState();
      previewBrush(eraseBrushRadius);
    } else if (tool === 'bgblur') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      initBackgroundBlur();
    } else if (tool === 'brushblur') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      prepareBlurSource();
      updateUndoState();
      previewBrush(manualBrushRadius);
    } else if (tool === 'skinsmooth') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      prepareSmoothSource();
      updateUndoState();
      previewBrush(skinSmoothRadius);
    } else if (tool === 'adjust') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      renderLiveAdjust();
      updateUndoState();
    } else if (tool === 'text') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateTextPreview();
      updateUndoState();
    } else if (tool === 'canvas') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      renderLiveCanvasFrame();
      updateUndoState();
    } else if (tool === 'crop') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      initCropOverlay();
      updateUndoState();
    }

    // Auto-fit canvas to viewport so photo is never covered by bottom panels
    requestAnimationFrame(() => fitCanvasToCurrentViewport());
  }

  function cancelTextMode() {
    if (textOverlayLayer) textOverlayLayer.classList.add('hidden');
    switchStudioTool('erase');
  }

  if (btnCancelText) btnCancelText.addEventListener('click', cancelTextMode);
  if (btnCancelTextBottom) btnCancelTextBottom.addEventListener('click', cancelTextMode);

  tabErase.addEventListener('click', () => switchStudioTool('erase'));
  tabBgBlur.addEventListener('click', () => switchStudioTool('bgblur'));
  tabBrushBlur.addEventListener('click', () => switchStudioTool('brushblur'));
  tabSkinSmooth.addEventListener('click', () => switchStudioTool('skinsmooth'));
  tabAdjust.addEventListener('click', () => switchStudioTool('adjust'));
  if (tabText) tabText.addEventListener('click', () => switchStudioTool('text'));
  if (tabCanvas) tabCanvas.addEventListener('click', () => switchStudioTool('canvas'));
  if (tabCrop) tabCrop.addEventListener('click', () => switchStudioTool('crop'));

  // ==========================================
  // 2. Navigation & New Photo Selection
  // ==========================================
  btnNewImage.addEventListener('click', () => {
    imageInput.value = '';
    imageInput.click();
  });
  btnModalNewImage.addEventListener('click', () => {
    saveSuccessModal.classList.add('hidden');
    imageInput.value = '';
    imageInput.click();
  });
  btnModalStay.addEventListener('click', () => saveSuccessModal.classList.add('hidden'));

  if (btnModalShare) {
    btnModalShare.addEventListener('click', async () => {
      if (!lastExportedDataUrl) return;
      try {
        const parts = lastExportedDataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const file = new File([blob], lastExportedFilename, { type: mime });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'InkErase Clean Photo',
            text: 'Edited with InkErase AI'
          });
        } else if (navigator.share) {
          await navigator.share({
            title: 'InkErase Clean Photo',
            url: window.location.href
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('[InkErase] Share button error:', err);
      }
    });
  }

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (processingOverlay) {
      processingOverlay.classList.remove('hidden');
      processStatusTitle.textContent = "Loading Photo...";
      processStatusSub.textContent = "Preparing high-resolution studio canvas";
      if (progressFill) progressFill.style.width = "40%";
    }

    const loadImgFromSrc = (src, cleanup) => {
      const img = new Image();
      img.onload = () => {
        if (cleanup) cleanup();
        if (progressFill) progressFill.style.width = "100%";
        setTimeout(() => {
          if (processingOverlay) processingOverlay.classList.add('hidden');
        }, 120);
        try {
          initializeWorkspace(img);
        } catch (initErr) {
          console.error('[InkErase] Failed to initialize workspace:', initErr);
          alert('Could not initialize workspace: ' + (initErr.message || initErr));
        }
      };
      img.onerror = (err) => {
        if (cleanup) cleanup();
        if (processingOverlay) processingOverlay.classList.add('hidden');
        console.error('[InkErase] Failed to decode image:', err);
        alert('Could not load the selected photo. Please try choosing another photo from your gallery.');
      };
      img.src = src;
    };

    if (window.URL && typeof window.URL.createObjectURL === 'function') {
      try {
        const objUrl = URL.createObjectURL(file);
        loadImgFromSrc(objUrl, () => {
          try { URL.revokeObjectURL(objUrl); } catch (_) {}
        });
        return;
      } catch (err) {
        console.warn('[InkErase] URL.createObjectURL failed, falling back to FileReader:', err);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      loadImgFromSrc(event.target.result);
    };
    reader.onerror = () => {
      if (processingOverlay) processingOverlay.classList.add('hidden');
      alert('Could not read image file from device storage. Please check gallery permissions.');
    };
    reader.readAsDataURL(file);
  });

  function initializeWorkspace(img) {
    emptyState.classList.add('hidden');
    editorView.classList.remove('hidden');
    bottomBar.classList.remove('hidden');
    btnNewImage.classList.remove('hidden');
    saveSuccessModal.classList.add('hidden');

    // Save pristine copy of original for compare
    const origCopy = document.createElement('canvas');
    origCopy.width = img.width;
    origCopy.height = img.height;
    origCopy.getContext('2d').drawImage(img, 0, 0);
    pristineOriginalImage = origCopy;
    currentWorkingImage = origCopy;

    imageHistory = [];
    maskStrokeHistory = [];
    cachedSubjectCutout = null;
    cachedSubjectMask = null;
    blurSourceCanvas = null;
    smoothSourceCanvas = null;
    isExtractingMask = false;
    if (typeof resetAdjustSliders === 'function') resetAdjustSliders();

    // Viewport layout calculation
    const vWidth = Math.max(280, canvasViewport.clientWidth || window.innerWidth);
    const vHeight = Math.max(280, canvasViewport.clientHeight || (window.innerHeight - 220));

    const margin = 20;
    const maxW = vWidth - margin;
    const maxH = vHeight - margin;

    const w = img.width;
    const h = img.height;

    const scaleW = maxW / w;
    const scaleH = maxH / h;
    const fitScale = Math.min(scaleW, scaleH, 1.0);

    displayWidth = Math.round(w * fitScale);
    displayHeight = Math.round(h * fitScale);

    [baseCanvas, maskCanvas, cursorCanvas].forEach(c => {
      c.width = w;
      c.height = h;
      c.style.width = `${displayWidth}px`;
      c.style.height = `${displayHeight}px`;
    });

    if (textOverlayLayer) {
      textOverlayLayer.style.width = `${displayWidth}px`;
      textOverlayLayer.style.height = `${displayHeight}px`;
    }
    textDisplayX = Math.round(displayWidth * 0.5);
    textDisplayY = Math.round(displayHeight * 0.5);
    updateTextPreview();

    baseCtx.drawImage(img, 0, 0);
    clearMask();

    scale = 1.0;
    defaultPanX = Math.round((vWidth - displayWidth) / 2);
    defaultPanY = Math.round((vHeight - displayHeight) / 2);
    panX = defaultPanX;
    panY = defaultPanY;

    updateTransform();
    switchStudioTool('erase');
    updateUndoState();
  }

  // ==========================================
  // 3. Zoom, Pan & Auto-Centering Engine
  // ==========================================
  function getScaleFactor() {
    const rect = baseCanvas.getBoundingClientRect();
    return (rect.width > 0 && baseCanvas.width > 0) ? (baseCanvas.width / rect.width) : 1;
  }

  function fitCanvasToCurrentViewport() {
    if (!currentWorkingImage || !baseCanvas.width || !baseCanvas.height) return;
    const vWidth = Math.max(200, canvasViewport.clientWidth);
    const vHeight = Math.max(160, canvasViewport.clientHeight);
    const margin = 16;
    const maxW = Math.max(100, vWidth - margin);
    const maxH = Math.max(100, vHeight - margin);

    const w = baseCanvas.width;
    const h = baseCanvas.height;
    const scaleW = maxW / w;
    const scaleH = maxH / h;
    const fitScale = Math.min(scaleW, scaleH);

    displayWidth = Math.round(w * fitScale);
    displayHeight = Math.round(h * fitScale);

    [baseCanvas, maskCanvas, cursorCanvas].forEach(c => {
      c.style.width = `${displayWidth}px`;
      c.style.height = `${displayHeight}px`;
    });

    if (textOverlayLayer) {
      textOverlayLayer.style.width = `${displayWidth}px`;
      textOverlayLayer.style.height = `${displayHeight}px`;
    }

    if (cropOverlayLayer) {
      cropOverlayLayer.style.width = `${displayWidth}px`;
      cropOverlayLayer.style.height = `${displayHeight}px`;
    }

    scale = 1.0;
    defaultPanX = Math.round((vWidth - displayWidth) / 2);
    defaultPanY = Math.round((vHeight - displayHeight) / 2);
    panX = defaultPanX;
    panY = defaultPanY;

    updateTransform();
  }

  // Auto-fit whenever viewport dimensions change (bottom bar expands, keyboard opens, orientation change)
  const viewportResizeObserver = new ResizeObserver(() => {
    if (currentWorkingImage && scale <= 1.05) {
      fitCanvasToCurrentViewport();
    }
  });
  viewportResizeObserver.observe(canvasViewport);

  function updateTransform() {
    canvasWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0px) scale(${scale})`;
  }

  function resetTransform() {
    fitCanvasToCurrentViewport();
  }

  btnZoomReset.addEventListener('click', resetTransform);

  // Mouse Wheel Zoom
  canvasViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const vWidth = canvasViewport.clientWidth;
    const vHeight = canvasViewport.clientHeight;
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    let newScale = scale * zoomFactor;

    if (newScale <= 1.05) {
      resetTransform();
      return;
    }

    newScale = Math.min(8.0, newScale);
    const rect = canvasViewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    panX = mouseX - (mouseX - panX) * (newScale / scale);
    panY = mouseY - (mouseY - panY) * (newScale / scale);
    scale = newScale;

    clampPan(vWidth, vHeight);
    updateTransform();
  }, { passive: false });

  function clampPan(vWidth, vHeight) {
    const curW = displayWidth * scale;
    const curH = displayHeight * scale;
    const margin = 80;

    if (curW > vWidth) {
      const minPanX = vWidth - curW - margin;
      const maxPanX = margin;
      panX = Math.min(maxPanX, Math.max(minPanX, panX));
    } else {
      const center = (vWidth - curW) / 2;
      panX = Math.min(center + margin, Math.max(center - margin, panX));
    }

    if (curH > vHeight) {
      const minPanY = vHeight - curH - margin;
      const maxPanY = margin;
      panY = Math.min(maxPanY, Math.max(minPanY, panY));
    } else {
      const center = (vHeight - curH) / 2;
      panY = Math.min(center + margin, Math.max(center - margin, panY));
    }
  }

  // Multi-Touch Focal-Point Pinch Zoom + 2-Finger Pan + Single-Finger Drawing
  let lastPinchEndTime = 0;
  let currentStrokePoints = [];
  let prevPinchDist = 0;
  let prevMidX = 0;
  let prevMidY = 0;

  canvasViewport.addEventListener('touchstart', (e) => {
    if (e.touches.length >= 2) {
      if (pipMagnifier) pipMagnifier.classList.add('hidden');

      if (isDrawing) {
        // If an accidental stroke dot was placed before second finger landed, revert immediately!
        if (activeTool === 'erase' && maskStrokeHistory.length > 0) {
          const prevState = maskStrokeHistory.pop();
          maskCtx.putImageData(prevState, 0, 0);
          updateUndoState();
        } else if ((activeTool === 'brushblur' || activeTool === 'skinsmooth') && imageHistory.length > 0) {
          const prevState = imageHistory.pop();
          baseCtx.putImageData(prevState, 0, 0);
        }
        isDrawing = false;
        currentStrokePoints = [];
      }

      if (activeTool === 'canvas') {
        if (e.touches.length >= 2) {
          isCanvaPinching = true;
          isCanvaDragging = false;
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          canvaPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          prevMidX = (t1.clientX + t2.clientX) / 2;
          prevMidY = (t1.clientY + t2.clientY) / 2;
          e.preventDefault();
          return;
        }
      }

      isPinching = true;
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      prevPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      prevMidX = (t1.clientX + t2.clientX) / 2;
      prevMidY = (t1.clientY + t2.clientY) / 2;
      e.preventDefault();
      return;
    }

    if (e.touches.length === 1) {
      if (activeTool === 'canvas') {
        isCanvaDragging = true;
        isCanvaPinching = false;
        canvaDragStartX = e.touches[0].clientX;
        canvaDragStartY = e.touches[0].clientY;
        e.preventDefault();
        return;
      }

      // If we just finished a 2-finger gesture within the last 300ms, ignore trailing release touches
      if (Date.now() - lastPinchEndTime < 300 || isPinching) {
        e.preventDefault();
        return;
      }

      if (activeTool !== 'text') e.preventDefault();

      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      startInteraction(clientX, clientY);
    }
  }, { passive: false });

  canvasViewport.addEventListener('touchmove', (e) => {
    if (activeTool === 'canvas') {
      if (isCanvaPinching && e.touches.length >= 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;

        if (canvaPinchDist > 5 && currentDist > 5) {
          const ratio = currentDist / canvaPinchDist;
          canvasFitScale = Math.min(3.0, Math.max(0.20, canvasFitScale * ratio));
          if (canvasFitScaleSlider) canvasFitScaleSlider.value = Math.round(canvasFitScale * 100);
          if (canvasFitScaleVal) {
            const pct = Math.round(canvasFitScale * 100);
            canvasFitScaleVal.textContent = pct === 100 ? '100% (Full Fit)' : `${pct}% (Framed)`;
          }

          const sf = getScaleFactor();
          canvasOffsetX += (currentMidX - prevMidX) * sf;
          canvasOffsetY += (currentMidY - prevMidY) * sf;
          prevMidX = currentMidX;
          prevMidY = currentMidY;
          canvaPinchDist = currentDist;
          renderLiveCanvasFrame();
        }
        return;
      } else if (isCanvaDragging && e.touches.length === 1) {
        e.preventDefault();
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        const sf = getScaleFactor();
        canvasOffsetX += (clientX - canvaDragStartX) * sf;
        canvasOffsetY += (clientY - canvaDragStartY) * sf;
        canvaDragStartX = clientX;
        canvaDragStartY = clientY;
        renderLiveCanvasFrame();
        return;
      }
    }

    if (e.touches.length >= 2 || isPinching) {
      e.preventDefault();
      if (pipMagnifier) pipMagnifier.classList.add('hidden');

      if (isDrawing) {
        if (activeTool === 'erase' && maskStrokeHistory.length > 0) {
          const prevState = maskStrokeHistory.pop();
          maskCtx.putImageData(prevState, 0, 0);
          updateUndoState();
        } else if ((activeTool === 'brushblur' || activeTool === 'skinsmooth') && imageHistory.length > 0) {
          const prevState = imageHistory.pop();
          baseCtx.putImageData(prevState, 0, 0);
        }
        isDrawing = false;
        currentStrokePoints = [];
      }

      if (e.touches.length >= 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;

        if (prevPinchDist > 5 && currentDist > 5) {
          // Smooth delta scale multiplier
          const distRatio = currentDist / prevPinchDist;
          const scaleMultiplier = 1.0 + (distRatio - 1.0) * 0.95;
          const targetScale = Math.min(8.0, Math.max(0.75, scale * scaleMultiplier));
          const actualRatio = targetScale / scale;

          // Pan delta directly 1:1 with finger shift
          const dx = currentMidX - prevMidX;
          const dy = currentMidY - prevMidY;

          // True focal-point zoom anchored between the two fingers + smooth 1:1 pan
          panX = currentMidX - (currentMidX - panX) * actualRatio + dx;
          panY = currentMidY - (currentMidY - panY) * actualRatio + dy;
          scale = targetScale;

          clampPan(canvasViewport.clientWidth, canvasViewport.clientHeight);
          updateTransform();
        }

        prevPinchDist = currentDist;
        prevMidX = currentMidX;
        prevMidY = currentMidY;
      }
      return;
    }

    if (e.touches.length === 1 && !isPinching && Date.now() - lastPinchEndTime >= 300) {
      e.preventDefault();
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;

      if (isDrawing) {
        moveInteraction(clientX, clientY);
      }
    }
  }, { passive: false });

  canvasViewport.addEventListener('touchend', (e) => {
    if (activeTool === 'canvas') {
      if (e.touches.length === 0) {
        isCanvaDragging = false;
        isCanvaPinching = false;
      } else if (e.touches.length === 1 && isCanvaPinching) {
        isCanvaPinching = false;
        isCanvaDragging = true;
        canvaDragStartX = e.touches[0].clientX;
        canvaDragStartY = e.touches[0].clientY;
      }
      return;
    }

    if (isPinching) {
      if (e.touches.length === 0) {
        isPinching = false;
        lastPinchEndTime = Date.now();
        if (scale < 0.96) {
          fitCanvasToCurrentViewport();
        } else {
          clampPan(canvasViewport.clientWidth, canvasViewport.clientHeight);
          updateTransform();
        }
      } else if (e.touches.length === 1) {
        // One finger released: seamless transition to remaining finger without jumping
        const t = e.touches[0];
        prevMidX = t.clientX;
        prevMidY = t.clientY;
      }
      return;
    }

    if (e.touches.length === 0) {
      stopInteraction();
    }
  });

  // Desktop Mouse Events
  canvasWrapper.addEventListener('mousedown', (e) => {
    if (activeTool === 'canvas' && e.button === 0) {
      isCanvaDragging = true;
      canvaDragStartX = e.clientX;
      canvaDragStartY = e.clientY;
      return;
    }
    if (e.button === 0) {
      startInteraction(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (activeTool === 'canvas' && isCanvaDragging) {
      const sf = getScaleFactor();
      canvasOffsetX += (e.clientX - canvaDragStartX) * sf;
      canvasOffsetY += (e.clientY - canvaDragStartY) * sf;
      canvaDragStartX = e.clientX;
      canvaDragStartY = e.clientY;
      renderLiveCanvasFrame();
      return;
    }
    moveInteraction(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    if (activeTool === 'canvas') {
      isCanvaDragging = false;
      return;
    }
    stopInteraction();
  });

  function getCanvasCoords(clientX, clientY) {
    const rect = baseCanvas.getBoundingClientRect();
    const scaleX = baseCanvas.width / rect.width;
    const scaleY = baseCanvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  // ==========================================
  // 4. Drawing & Interaction Handlers
  // ==========================================
  function updatePipMagnifier(clientX, clientY, canvasX, canvasY, radius) {
    if (!pipMagnifier || !pipCanvas || !pipCtx) return;
    if (!isDrawing || !currentWorkingImage) {
      pipMagnifier.classList.add('hidden');
      return;
    }
    if (activeTool !== 'erase' && activeTool !== 'brushblur' && activeTool !== 'skinsmooth') {
      pipMagnifier.classList.add('hidden');
      return;
    }

    // Keep square PiP fixed in top-left corner (no moving, no vectors, no text)
    pipMagnifier.classList.remove('hidden');

    // True Screen-Relative 2.0x Optical Magnification
    const pipW = pipCanvas.width; // 110
    const pipH = pipCanvas.height; // 110
    const canvasRect = baseCanvas.getBoundingClientRect();
    const screenPixelToCanvasRatio = baseCanvas.width / (canvasRect.width || 1);

    // 2.0x optical screen zoom: 110px loupe displays 55px worth of the visible screen area
    const srcSize = (pipW / 2.0) * screenPixelToCanvasRatio;

    pipCtx.clearRect(0, 0, pipW, pipH);
    pipCtx.fillStyle = '#141418';
    pipCtx.fillRect(0, 0, pipW, pipH);

    const sx = canvasX - srcSize / 2;
    const sy = canvasY - srcSize / 2;

    // 1. Draw pristine magnified base photo under finger
    pipCtx.drawImage(baseCanvas, sx, sy, srcSize, srcSize, 0, 0, pipW, pipH);

    // 2. If tattoo erase, draw mask with 45% transparency so photo is ALWAYS visible!
    if (activeTool === 'erase') {
      pipCtx.save();
      pipCtx.globalAlpha = 0.45;
      pipCtx.drawImage(maskCanvas, sx, sy, srcSize, srcSize, 0, 0, pipW, pipH);
      pipCtx.restore();
    }
  }

  let pipRafId = null;
  function schedulePipMagnifier(clientX, clientY, canvasX, canvasY, radius) {
    if (!pipMagnifier || !pipCanvas || !pipCtx) return;
    if (pipRafId) return;
    pipRafId = requestAnimationFrame(() => {
      pipRafId = null;
      updatePipMagnifier(clientX, clientY, canvasX, canvasY, radius);
    });
  }

  function startInteraction(clientX, clientY) {
    if (!currentWorkingImage || isComparing) return;
    if (activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'text' || activeTool === 'canvas' || activeTool === 'crop') return;

    const coords = getCanvasCoords(clientX, clientY);
    lastX = coords.x;
    lastY = coords.y;
    isDrawing = true;
    currentStrokePoints = [coords];

    let activeRadius = eraseBrushRadius;
    if (activeTool === 'brushblur') activeRadius = manualBrushRadius;
    else if (activeTool === 'skinsmooth') activeRadius = skinSmoothRadius;
    drawCursor(coords.x, coords.y, activeRadius, true);

    if (activeTool === 'erase') {
      saveMaskStroke();
      drawEraseDot(coords.x, coords.y);
    } else if (activeTool === 'brushblur') {
      saveImageState();
      prepareBlurSource();
      drawManualBlurDab(lastX, lastY);
    } else if (activeTool === 'skinsmooth') {
      saveImageState();
      drawSkinSmoothDab(lastX, lastY);
    }

    updatePipMagnifier(clientX, clientY, coords.x, coords.y, activeRadius);
  }

  function moveInteraction(clientX, clientY) {
    if (activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'text' || activeTool === 'canvas' || activeTool === 'crop') {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      if (pipMagnifier) pipMagnifier.classList.add('hidden');
      return;
    }

    const coords = getCanvasCoords(clientX, clientY);

    let activeRadius = eraseBrushRadius;
    if (activeTool === 'brushblur') activeRadius = manualBrushRadius;
    else if (activeTool === 'skinsmooth') activeRadius = skinSmoothRadius;

    drawCursor(coords.x, coords.y, activeRadius, true);

    if (!isDrawing || !currentWorkingImage || isComparing) return;

    if (activeTool === 'erase') {
      // 100% Instantaneous touch tracking with zero lag and no trailing tail
      drawEraseStroke(lastX, lastY, coords.x, coords.y);
      lastX = coords.x;
      lastY = coords.y;
    } else if (activeTool === 'brushblur') {
      drawManualBlurStroke(lastX, lastY, coords.x, coords.y);
      lastX = coords.x;
      lastY = coords.y;
    } else if (activeTool === 'skinsmooth') {
      drawSkinSmoothStroke(lastX, lastY, coords.x, coords.y);
      lastX = coords.x;
      lastY = coords.y;
    }

    // Schedule magnifier rendering via RAF for 60/120fps butter-smooth drawing with zero lag
    schedulePipMagnifier(clientX, clientY, coords.x, coords.y, activeRadius);
  }

  function stopInteraction() {
    if (pipRafId) {
      cancelAnimationFrame(pipRafId);
      pipRafId = null;
    }
    if (pipMagnifier) pipMagnifier.classList.add('hidden');
    if (!isDrawing) return;
    isDrawing = false;
    currentStrokePoints = [];
    setTimeout(() => {
      if (!isDrawing) cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    }, 450);

    if (activeTool === 'brushblur' || activeTool === 'skinsmooth') {
      // Bake manual stroke to working image
      const snap = document.createElement('canvas');
      snap.width = baseCanvas.width;
      snap.height = baseCanvas.height;
      snap.getContext('2d').drawImage(baseCanvas, 0, 0);
      currentWorkingImage = snap;
      // Invalidate cached cutout because image pixels changed
      cachedSubjectCutout = null;
    }

    updateUndoState();
  }

  let brushPreviewTimer = null;
  function previewBrush(radius) {
    if (!currentWorkingImage || !baseCanvas.width) return;
    const centerX = baseCanvas.width / 2;
    const centerY = baseCanvas.height / 2;
    drawCursor(centerX, centerY, radius);
    clearTimeout(brushPreviewTimer);
    brushPreviewTimer = setTimeout(() => {
      if (!isDrawing) {
        cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      }
    }, 1400);
  }

  function drawCursor(x, y, radius, isFast = false) {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    if (activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'text' || activeTool === 'canvas' || activeTool === 'crop') return;

    const rect = baseCanvas.getBoundingClientRect();
    const scaleX = baseCanvas.width / (rect.width || 1);
    const scaleY = baseCanvas.height / (rect.height || 1);
    const rX = radius * scaleX;
    const rY = radius * scaleY;
    const sf = (scaleX + scaleY) / 2;

    cursorCtx.save();
    if (!isFast) {
      cursorCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      cursorCtx.shadowBlur = 4 * sf;
    }

    // Outer boundary ring - guaranteed 100% round circle on physical display
    cursorCtx.beginPath();
    cursorCtx.ellipse(x, y, rX, rY, 0, 0, Math.PI * 2);
    if (activeTool === 'skinsmooth') {
      cursorCtx.strokeStyle = 'rgba(251, 191, 36, 1.0)';
    } else if (activeTool === 'brushblur') {
      cursorCtx.strokeStyle = 'rgba(56, 189, 248, 1.0)';
    } else {
      cursorCtx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    }
    cursorCtx.lineWidth = Math.max(2.5 * sf, 2);
    cursorCtx.stroke();

    // Center precision dot (also perfectly round)
    cursorCtx.beginPath();
    cursorCtx.ellipse(x, y, Math.max(2 * scaleX, 2), Math.max(2 * scaleY, 2), 0, 0, Math.PI * 2);
    cursorCtx.fillStyle = cursorCtx.strokeStyle;
    cursorCtx.fill();

    // If blur brush or skin smooth, draw inner dotted circle showing feather core
    if (activeTool === 'brushblur' || activeTool === 'skinsmooth') {
      const featherVal = (activeTool === 'skinsmooth') ? skinSmoothFeather : manualBrushFeather;
      const innerX = Math.max(1, rX * (1.0 - featherVal / 100.0));
      const innerY = Math.max(1, rY * (1.0 - featherVal / 100.0));
      cursorCtx.beginPath();
      cursorCtx.ellipse(x, y, innerX, innerY, 0, 0, Math.PI * 2);
      cursorCtx.setLineDash([4 * sf, 4 * sf]);
      cursorCtx.strokeStyle = (activeTool === 'skinsmooth') ? 'rgba(251, 191, 36, 0.85)' : 'rgba(56, 189, 248, 0.85)';
      cursorCtx.lineWidth = Math.max(1.8 * sf, 1.8);
      cursorCtx.stroke();
      cursorCtx.setLineDash([]);
    }
    cursorCtx.restore();
  }

  // --- Tool 1: Tattoo Mask Drawing with Quadratic Bézier Splines ---
  function drawEraseDot(x, y) {
    const sf = getScaleFactor();
    const radius = eraseBrushRadius * sf;
    maskCtx.fillStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.beginPath();
    maskCtx.arc(x, y, radius, 0, Math.PI * 2);
    maskCtx.fill();
  }

  function drawEraseStroke(x1, y1, x2, y2) {
    const sf = getScaleFactor();
    const radius = eraseBrushRadius * sf;
    maskCtx.strokeStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.fillStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.lineWidth = radius * 2;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    maskCtx.beginPath();
    maskCtx.moveTo(x1, y1);
    maskCtx.lineTo(x2, y2);
    maskCtx.stroke();
  }

  function drawEraseCurve(x0, y0, cx, cy, x1, y1) {
    const sf = getScaleFactor();
    const radius = eraseBrushRadius * sf;
    maskCtx.strokeStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.fillStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.lineWidth = radius * 2;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    maskCtx.beginPath();
    maskCtx.moveTo(x0, y0);
    maskCtx.quadraticCurveTo(cx, cy, x1, y1);
    maskCtx.stroke();
  }

  brushSizeInput.addEventListener('input', (e) => {
    eraseBrushRadius = parseInt(e.target.value, 10);
    brushSizeVal.textContent = `${eraseBrushRadius}px`;
    previewBrush(eraseBrushRadius);
  });

  function saveMaskStroke() {
    if (maskStrokeHistory.length >= MAX_HISTORY) maskStrokeHistory.shift();
    const state = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    maskStrokeHistory.push(state);
    updateUndoState();
  }

  function clearMask() {
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskStrokeHistory = [];
    updateUndoState();
  }
  btnClearMask.addEventListener('click', clearMask);

  // --- Tool 3: Manual Blur Brush Drawing ---
  function prepareBlurSource() {
    if (!currentWorkingImage) return;
    blurSourceCanvas = document.createElement('canvas');
    blurSourceCanvas.width = baseCanvas.width;
    blurSourceCanvas.height = baseCanvas.height;
    const bCtx = blurSourceCanvas.getContext('2d');
    bCtx.filter = `blur(${manualBlurDensity}px)`;
    bCtx.drawImage(currentWorkingImage, 0, 0);
  }

  const dabCanvas = document.createElement('canvas');
  const dabCtx = dabCanvas.getContext('2d');

  function drawManualBlurDab(x, y) {
    if (!blurSourceCanvas) return;
    const sf = getScaleFactor();
    const R = Math.max(3, manualBrushRadius * sf);
    const D = Math.ceil(R * 2);
    if (D < 2) return;

    if (dabCanvas.width !== D || dabCanvas.height !== D) {
      dabCanvas.width = D;
      dabCanvas.height = D;
    } else {
      dabCtx.clearRect(0, 0, D, D);
    }

    // 1. Draw ONLY the tiny D x D slice from blurSourceCanvas (100x faster than full canvas draw)
    const srcX = Math.max(0, Math.min(blurSourceCanvas.width - 1, Math.round(x - R)));
    const srcY = Math.max(0, Math.min(blurSourceCanvas.height - 1, Math.round(y - R)));
    const srcW = Math.min(D, blurSourceCanvas.width - srcX);
    const srcH = Math.min(D, blurSourceCanvas.height - srcY);
    if (srcW > 0 && srcH > 0) {
      const dstX = Math.round(srcX - (x - R));
      const dstY = Math.round(srcY - (y - R));
      dabCtx.drawImage(blurSourceCanvas, srcX, srcY, srcW, srcH, dstX, dstY, srcW, srcH);
    }

    // 2. Feather mask using radial gradient (destination-in)
    dabCtx.globalCompositeOperation = 'destination-in';
    const innerRadius = Math.max(0, R * (1.0 - manualBrushFeather / 100.0));
    const grad = dabCtx.createRadialGradient(R, R, innerRadius, R, R, R);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    dabCtx.fillStyle = grad;
    dabCtx.fillRect(0, 0, D, D);
    dabCtx.globalCompositeOperation = 'source-over';

    // 3. Composite feathered dab onto base canvas with responsive smooth flow
    baseCtx.save();
    baseCtx.globalAlpha = 0.50;
    baseCtx.drawImage(dabCanvas, Math.round(x - R), Math.round(y - R));
    baseCtx.restore();
  }

  function drawManualBlurStroke(x1, y1, x2, y2) {
    const sf = getScaleFactor();
    const R = Math.max(3, manualBrushRadius * sf);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(2, R * 0.28);
    const steps = Math.ceil(dist / step);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const curX = x1 + (x2 - x1) * t;
      const curY = y1 + (y2 - y1) * t;
      drawManualBlurDab(curX, curY);
    }
  }

  manualBrushSizeInput.addEventListener('input', (e) => {
    manualBrushRadius = parseInt(e.target.value, 10);
    manualBrushSizeVal.textContent = `${manualBrushRadius}px`;
    previewBrush(manualBrushRadius);
  });

  manualBlurDensityInput.addEventListener('input', (e) => {
    manualBlurDensity = parseInt(e.target.value, 10);
    let desc = 'Medium';
    if (manualBlurDensity <= 8) desc = 'Soft';
    else if (manualBlurDensity >= 30) desc = 'Heavy';
    manualBlurDensityVal.textContent = `${manualBlurDensity}px (${desc})`;
    prepareBlurSource();
    previewBrush(manualBrushRadius);
  });

  if (manualBrushFeatherInput) {
    manualBrushFeatherInput.addEventListener('input', (e) => {
      manualBrushFeather = parseInt(e.target.value, 10);
      let desc = 'Medium';
      if (manualBrushFeather <= 30) desc = 'Crisp';
      else if (manualBrushFeather >= 70) desc = 'Soft';
      manualBrushFeatherVal.textContent = `${manualBrushFeather}% (${desc})`;
      previewBrush(manualBrushRadius);
    });
  }

  btnUndoBlurBrush.addEventListener('click', () => {
    if (imageHistory.length > 0) {
      const prevState = imageHistory.pop();
      currentWorkingImage = prevState;
      baseCtx.drawImage(prevState, 0, 0);
      prepareBlurSource();
      cachedSubjectMask = null;
      updateUndoState();
    }
  });

  btnRevertBlurBrush.addEventListener('click', () => {
    if (pristineOriginalImage) {
      saveImageState();
      currentWorkingImage = pristineOriginalImage;
      baseCtx.drawImage(pristineOriginalImage, 0, 0);
      prepareBlurSource();
      cachedSubjectMask = null;
      updateUndoState();
    }
  });

  // ==========================================
  // 5. Tool 2: AI Background Blur (Portrait Bokeh)
  // ==========================================
  async function initBackgroundBlur() {
    if (!currentWorkingImage) return;

    if (!cachedSubjectCutout) {
      await extractSubjectMask();
    }

    renderLiveBokeh();
  }

  let selfieSegmenter = null;

  async function getOfflineSegmenter() {
    if (selfieSegmenter) return selfieSegmenter;
    if (typeof window.SelfieSegmentation === 'undefined') return null;

    try {
      const segmenter = new window.SelfieSegmentation({
        locateFile: (file) => {
          return 'mediapipe/' + file;
        }
      });
      await segmenter.setOptions({
        modelSelection: 1 // 1: Landscape model (more accurate for portraits and full body)
      });
      selfieSegmenter = segmenter;
      return selfieSegmenter;
    } catch (err) {
      console.warn('Could not initialize MediaPipe SelfieSegmentation:', err);
      return null;
    }
  }

  function generateSaliencySubjectMask(sourceCanvas, targetCanvas) {
    const sw = sourceCanvas.width;
    const sh = sourceCanvas.height;
    const targetCtx = targetCanvas.getContext('2d');

    const dw = 180;
    const dh = Math.max(60, Math.round(180 * (sh / sw)));
    const smallC = document.createElement('canvas');
    smallC.width = dw;
    smallC.height = dh;
    const sCtx = smallC.getContext('2d');
    sCtx.drawImage(sourceCanvas, 0, 0, dw, dh);

    const imgData = sCtx.getImageData(0, 0, dw, dh);
    const data = imgData.data;

    let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
    const marginX = Math.max(2, Math.floor(dw * 0.08));
    const marginY = Math.max(2, Math.floor(dh * 0.08));

    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const isBorder = (x < marginX || x >= dw - marginX || y < marginY || y >= dh - marginY);
        if (isBorder) {
          const idx = (y * dw + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
          bgCount++;
        }
      }
    }
    bgR = bgR / Math.max(1, bgCount);
    bgG = bgG / Math.max(1, bgCount);
    bgB = bgB / Math.max(1, bgCount);

    const maskBuffer = new Uint8ClampedArray(dw * dh);
    const cx = dw * 0.5;
    const cy = dh * 0.5;
    const maxRadius = Math.sqrt(cx * cx + cy * cy);

    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const idx = (y * dw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const dr = r - bgR;
        const dg = g - bgG;
        const db = b - bgB;
        const colorDist = Math.sqrt(dr * dr + dg * dg + db * db) / 441.67;

        let edge = 0;
        if (x < dw - 1 && y < dh - 1) {
          const rightIdx = idx + 4;
          const downIdx = idx + dw * 4;
          const gradX = Math.abs(r - data[rightIdx]) + Math.abs(g - data[rightIdx + 1]) + Math.abs(b - data[rightIdx + 2]);
          const gradY = Math.abs(r - data[downIdx]) + Math.abs(g - data[downIdx + 1]) + Math.abs(b - data[downIdx + 2]);
          edge = (gradX + gradY) / (3 * 255);
        }

        const distFromCenter = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / maxRadius;
        const centerWeight = Math.max(0.1, 1.0 - Math.pow(distFromCenter * 1.3, 2));

        let score = (colorDist * 1.5 + edge * 0.9) * centerWeight;
        score = 1.0 / (1.0 + Math.exp(-9.0 * (score - 0.26)));
        maskBuffer[y * dw + x] = Math.round(Math.min(255, Math.max(0, score * 255)));
      }
    }

    const maskImgData = sCtx.createImageData(dw, dh);
    for (let i = 0; i < dw * dh; i++) {
      const pIdx = i * 4;
      const v = maskBuffer[i];
      maskImgData.data[pIdx] = 255;
      maskImgData.data[pIdx + 1] = 255;
      maskImgData.data[pIdx + 2] = 255;
      maskImgData.data[pIdx + 3] = v;
    }
    sCtx.putImageData(maskImgData, 0, 0);

    targetCtx.clearRect(0, 0, sw, sh);
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';
    targetCtx.drawImage(smallC, 0, 0, sw, sh);
  }

  async function extractSubjectMask() {
    if (isExtractingMask || !currentWorkingImage) return;
    isExtractingMask = true;

    showProgress(true, 'Detecting Subject...', 'AI isolating person for portrait depth-of-field...', 30);

    try {
      let cutoutLoaded = false;

      // 1. Try server segmentation if connected
      try {
        const maxDim = 640;
        const w = baseCanvas.width;
        const h = baseCanvas.height;
        const s = Math.min(1.0, maxDim / Math.max(w, h));
        const fastCanvas = document.createElement('canvas');
        fastCanvas.width = Math.max(1, Math.round(w * s));
        fastCanvas.height = Math.max(1, Math.round(h * s));
        const fCtx = fastCanvas.getContext('2d');
        fCtx.drawImage(baseCanvas, 0, 0, fastCanvas.width, fastCanvas.height);
        const imgB64 = fastCanvas.toDataURL('image/jpeg', 0.85);

        progressFill.style.width = '60%';

        const cutoutB64 = await callCloudAi('segment_subject', [imgB64], '/api/segment_subject', { image: imgB64 }, 35000);

        if (cutoutB64 && !cutoutB64.startsWith('ERROR:')) {
          await new Promise((resolve, reject) => {
            const cutoutImg = new Image();
            cutoutImg.onload = () => {
              cachedSubjectCutout = cutoutImg;
              resolve();
            };
            cutoutImg.onerror = reject;
            cutoutImg.src = cutoutB64;
          });
          cutoutLoaded = true;
        }
      } catch (srvErr) {
        console.warn('Server segment_subject failed or timed out, trying on-device AI:', srvErr);
      }

      // 2. On-Device Fallback (MediaPipe Neural Network or Saliency Silhouette)
      if (!cutoutLoaded) {
        const w = baseCanvas.width;
        const h = baseCanvas.height;
        let maskBitmapOrCanvas = null;

        try {
          const segmenter = await getOfflineSegmenter();
          if (segmenter) {
            const maxDim = 1024;
            let sendCanvas = baseCanvas;
            if (Math.max(w, h) > maxDim) {
              const scaleDown = maxDim / Math.max(w, h);
              sendCanvas = document.createElement('canvas');
              sendCanvas.width = Math.round(w * scaleDown);
              sendCanvas.height = Math.round(h * scaleDown);
              sendCanvas.getContext('2d').drawImage(baseCanvas, 0, 0, sendCanvas.width, sendCanvas.height);
            }

            maskBitmapOrCanvas = await new Promise((resolve) => {
              let resolved = false;
              const timeout = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  console.warn('MediaPipe segmentation timeout, using saliency.');
                  resolve(null);
                }
              }, 4500);

              segmenter.onResults((results) => {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);
                if (results && results.segmentationMask) {
                  resolve(results.segmentationMask);
                } else {
                  resolve(null);
                }
              });

              segmenter.send({ image: sendCanvas }).catch(err => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  resolve(null);
                }
              });
            });
          }
        } catch (mpErr) {
          console.warn('MediaPipe segmenter error:', mpErr);
        }

        const maskC = document.createElement('canvas');
        maskC.width = w;
        maskC.height = h;
        const mCtx = maskC.getContext('2d');

        if (maskBitmapOrCanvas) {
          mCtx.drawImage(maskBitmapOrCanvas, 0, 0, w, h);
        } else {
          generateSaliencySubjectMask(baseCanvas, maskC);
        }

        const cutoutC = document.createElement('canvas');
        cutoutC.width = w;
        cutoutC.height = h;
        const cCtx = cutoutC.getContext('2d');
        cCtx.drawImage(baseCanvas, 0, 0);
        cCtx.globalCompositeOperation = 'destination-in';
        cCtx.drawImage(maskC, 0, 0);

        const cutoutImg = new Image();
        await new Promise(res => {
          cutoutImg.onload = res;
          cutoutImg.src = cutoutC.toDataURL('image/png');
        });
        cachedSubjectCutout = cutoutImg;
      }

      showProgress(false);
    } catch (err) {
      console.error('Mask extraction error:', err);
      showProgress(false);
    } finally {
      isExtractingMask = false;
    }
  }

  function renderLiveBokeh() {
    if (!currentWorkingImage || !cachedSubjectCutout) return;

    const blurPx = parseInt(bgBlurDensityInput.value, 10);
    const featherPx = bgBlurFeatherInput ? parseInt(bgBlurFeatherInput.value, 10) : 2;

    const w = baseCanvas.width;
    const h = baseCanvas.height;

    // 1. Offscreen blurred background
    const offBg = document.createElement('canvas');
    offBg.width = w;
    offBg.height = h;
    const bgCtx = offBg.getContext('2d');
    bgCtx.filter = `blur(${blurPx}px)`;
    bgCtx.drawImage(currentWorkingImage, 0, 0);

    // 2. Extract pure white silhouette mask from cutout
    // Strips away any dark/black premultiplied RGB border from rembg
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mCtx = maskCanvas.getContext('2d');
    mCtx.drawImage(cachedSubjectCutout, 0, 0, w, h);
    mCtx.globalCompositeOperation = 'source-in';
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, w, h);
    mCtx.globalCompositeOperation = 'source-over';

    // 3. Create the precise feathered subject using original photo's genuine colors (ZERO black border!)
    const subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = w;
    subjectCanvas.height = h;
    const sCtx = subjectCanvas.getContext('2d');

    if (featherPx > 0) {
      sCtx.filter = `blur(${featherPx}px)`;
    }
    sCtx.drawImage(maskCanvas, 0, 0);
    sCtx.filter = 'none';

    // Stamp original photo's true colors
    sCtx.globalCompositeOperation = 'source-in';
    sCtx.drawImage(currentWorkingImage, 0, 0);

    // 4. Composite: Blurred background + Soft-feathered natural subject
    baseCtx.clearRect(0, 0, w, h);
    baseCtx.drawImage(offBg, 0, 0);
    baseCtx.drawImage(subjectCanvas, 0, 0);
  }

  bgBlurDensityInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    let desc = 'Medium Bokeh';
    if (val <= 10) desc = 'Soft Bokeh';
    else if (val >= 35) desc = 'Dreamy Bokeh';
    bgBlurDensityVal.textContent = `${val}px (${desc})`;

    renderLiveBokeh();
  });

  if (bgBlurFeatherInput) {
    bgBlurFeatherInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      let desc = 'Crisp & Precise';
      if (val === 0) desc = 'Razor Sharp';
      else if (val <= 2) desc = 'Crisp & Precise';
      else if (val <= 6) desc = 'Soft Portrait';
      else desc = 'Silky';
      bgBlurFeatherVal.textContent = `${val}px (${desc})`;

      renderLiveBokeh();
    });
  }

  btnApplyBgBlur.addEventListener('click', () => {
    if (!currentWorkingImage) return;

    saveImageState();

    // Commit baseCanvas into working image
    const baked = document.createElement('canvas');
    baked.width = baseCanvas.width;
    baked.height = baseCanvas.height;
    baked.getContext('2d').drawImage(baseCanvas, 0, 0);
    currentWorkingImage = baked;

    cachedSubjectCutout = null;
    cachedSubjectMask = null;
    blurSourceCanvas = null;
    smoothSourceCanvas = null;

    updateUndoState();
    alert('✓ Background blur applied successfully!');
  });

  btnCancelBgBlur.addEventListener('click', () => {
    if (currentWorkingImage) {
      baseCtx.drawImage(currentWorkingImage, 0, 0);
      bgBlurDensityInput.value = 16;
      bgBlurDensityVal.textContent = '16px (Medium Bokeh)';
      if (bgBlurFeatherInput) {
        bgBlurFeatherInput.value = 2;
        bgBlurFeatherVal.textContent = '2px (Crisp)';
      }
    }
  });

  // ==========================================
  // 6. Tool 4: Skin Smooth Drawing (Wrinkles & Cellulite Softener)
  // ==========================================
  function prepareSmoothSource() {
    if (!currentWorkingImage) return;
    const w = baseCanvas.width;
    const h = baseCanvas.height;

    smoothSourceCanvas = document.createElement('canvas');
    smoothSourceCanvas.width = w;
    smoothSourceCanvas.height = h;
    const sCtx = smoothSourceCanvas.getContext('2d');

    // Hardware-accelerated dual-stage skin smoothing with authentic pore & texture preservation:
    const blurRadius = Math.max(2, Math.round(skinSmoothStrength * 0.75));
    sCtx.save();
    sCtx.filter = `blur(${blurRadius}px)`;
    sCtx.drawImage(currentWorkingImage, 0, 0);

    // Retain 22% natural fine grain & skin pores so skin looks authentic, not plastic
    sCtx.filter = 'none';
    sCtx.globalAlpha = 0.22;
    sCtx.drawImage(currentWorkingImage, 0, 0);
    sCtx.restore();
  }

  function drawSkinSmoothDab(x, y) {
    if (!smoothSourceCanvas) return;
    const sf = getScaleFactor();
    const R = Math.max(3, skinSmoothRadius * sf);
    const D = Math.ceil(R * 2);
    if (D < 2) return;

    if (dabCanvas.width !== D || dabCanvas.height !== D) {
      dabCanvas.width = D;
      dabCanvas.height = D;
    } else {
      dabCtx.clearRect(0, 0, D, D);
    }

    // 1. Draw ONLY the tiny D x D slice from smoothSourceCanvas (100x faster than full canvas draw)
    const srcX = Math.max(0, Math.min(smoothSourceCanvas.width - 1, Math.round(x - R)));
    const srcY = Math.max(0, Math.min(smoothSourceCanvas.height - 1, Math.round(y - R)));
    const srcW = Math.min(D, smoothSourceCanvas.width - srcX);
    const srcH = Math.min(D, smoothSourceCanvas.height - srcY);
    if (srcW > 0 && srcH > 0) {
      const dstX = Math.round(srcX - (x - R));
      const dstY = Math.round(srcY - (y - R));
      dabCtx.drawImage(smoothSourceCanvas, srcX, srcY, srcW, srcH, dstX, dstY, srcW, srcH);
    }

    // 2. Feather mask using radial gradient (destination-in)
    dabCtx.globalCompositeOperation = 'destination-in';
    const innerRadius = Math.max(0, R * (1.0 - skinSmoothFeather / 100.0));
    const grad = dabCtx.createRadialGradient(R, R, innerRadius, R, R, R);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    dabCtx.fillStyle = grad;
    dabCtx.fillRect(0, 0, D, D);
    dabCtx.globalCompositeOperation = 'source-over';

    // 3. Composite feathered dab onto base canvas with responsive smooth flow
    baseCtx.save();
    baseCtx.globalAlpha = 0.50; // Responsive buildable flow for flawless skin blending
    baseCtx.drawImage(dabCanvas, Math.round(x - R), Math.round(y - R));
    baseCtx.restore();
  }

  function drawSkinSmoothStroke(x1, y1, x2, y2) {
    const sf = getScaleFactor();
    const R = Math.max(3, skinSmoothRadius * sf);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(2, R * 0.28);
    const steps = Math.ceil(dist / step);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const curX = x1 + (x2 - x1) * t;
      const curY = y1 + (y2 - y1) * t;
      drawSkinSmoothDab(curX, curY);
    }
  }

  skinSmoothBrushSizeInput.addEventListener('input', (e) => {
    skinSmoothRadius = parseInt(e.target.value, 10);
    skinSmoothBrushSizeVal.textContent = `${skinSmoothRadius}px`;
    previewBrush(skinSmoothRadius);
  });

  skinSmoothStrengthInput.addEventListener('input', (e) => {
    skinSmoothStrength = parseInt(e.target.value, 10);
    let desc = 'Silk';
    if (skinSmoothStrength <= 8) desc = 'Light';
    else if (skinSmoothStrength >= 20) desc = 'Ultra Smooth';
    skinSmoothStrengthVal.textContent = `${skinSmoothStrength}px (${desc})`;
    prepareSmoothSource();
    previewBrush(skinSmoothRadius);
  });

  skinSmoothFeatherInput.addEventListener('input', (e) => {
    skinSmoothFeather = parseInt(e.target.value, 10);
    let desc = 'Natural';
    if (skinSmoothFeather <= 40) desc = 'Crisp';
    else if (skinSmoothFeather >= 85) desc = 'Ultra Soft';
    skinSmoothFeatherVal.textContent = `${skinSmoothFeather}% (${desc})`;
    previewBrush(skinSmoothRadius);
  });

  btnUndoSkinSmooth.addEventListener('click', () => {
    if (imageHistory.length > 0) {
      const prevState = imageHistory.pop();
      currentWorkingImage = prevState;
      baseCtx.drawImage(prevState, 0, 0);
      prepareSmoothSource();
      cachedSubjectCutout = null;
      updateUndoState();
    }
  });

  btnRevertSkinSmooth.addEventListener('click', () => {
    if (pristineOriginalImage) {
      saveImageState();
      currentWorkingImage = pristineOriginalImage;
      baseCtx.drawImage(pristineOriginalImage, 0, 0);
      prepareSmoothSource();
      cachedSubjectCutout = null;
      updateUndoState();
    }
  });

  btnSaveImageSmooth.addEventListener('click', exportImage);

  // ==========================================
  // 6. Tool 5: Color Adjustment (Lighting, Contrast, Saturation, Warmth)
  // ==========================================
  function buildAdjustFilterString() {
    // Studio Photographic Exposure: Lifts midtones smoothly while protecting highlights from blowing out
    const b = 100 + adjustBrightness * 0.35;
    const highlightProtect = adjustBrightness > 0 ? adjustBrightness * 0.15 : 0;
    const c = Math.max(20, 100 + adjustContrast - highlightProtect);
    const s = Math.max(0, 100 + adjustSaturation);
    let warmthPart = '';

    if (adjustWarmth > 0) {
      // Warm golden sun-kissed tone
      warmthPart = ` sepia(${adjustWarmth * 0.40}%) saturate(${100 + adjustWarmth * 0.15}%)`;
    } else if (adjustWarmth < 0) {
      // Cool oceanic / twilight tone
      warmthPart = ` hue-rotate(${adjustWarmth * 0.30}deg)`;
    }

    return `brightness(${b}%) contrast(${c}%) saturate(${s}%)${warmthPart}`;
  }

  function renderLiveAdjust() {
    if (!currentWorkingImage) return;
    baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.save();
    baseCtx.filter = buildAdjustFilterString();
    baseCtx.drawImage(currentWorkingImage, 0, 0);
    baseCtx.restore();
  }

  function resetAdjustSliders() {
    adjustBrightness = 0;
    adjustContrast = 0;
    adjustSaturation = 0;
    adjustWarmth = 0;
    if (adjBrightnessInput) adjBrightnessInput.value = 0;
    if (adjContrastInput) adjContrastInput.value = 0;
    if (adjSaturationInput) adjSaturationInput.value = 0;
    if (adjWarmthInput) adjWarmthInput.value = 0;
    if (adjBrightnessVal) adjBrightnessVal.textContent = '0%';
    if (adjContrastVal) adjContrastVal.textContent = '0%';
    if (adjSaturationVal) adjSaturationVal.textContent = '0%';
    if (adjWarmthVal) adjWarmthVal.textContent = '0';
    if (currentWorkingImage) {
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(currentWorkingImage, 0, 0);
    }
  }

  if (adjBrightnessInput) {
    adjBrightnessInput.addEventListener('input', (e) => {
      adjustBrightness = parseInt(e.target.value, 10);
      const sign = adjustBrightness > 0 ? '+' : '';
      adjBrightnessVal.textContent = `${sign}${adjustBrightness}%`;
      renderLiveAdjust();
    });
  }

  if (adjContrastInput) {
    adjContrastInput.addEventListener('input', (e) => {
      adjustContrast = parseInt(e.target.value, 10);
      const sign = adjustContrast > 0 ? '+' : '';
      adjContrastVal.textContent = `${sign}${adjustContrast}%`;
      renderLiveAdjust();
    });
  }

  if (adjSaturationInput) {
    adjSaturationInput.addEventListener('input', (e) => {
      adjustSaturation = parseInt(e.target.value, 10);
      const sign = adjustSaturation > 0 ? '+' : '';
      adjSaturationVal.textContent = `${sign}${adjustSaturation}%`;
      renderLiveAdjust();
    });
  }

  if (adjWarmthInput) {
    adjWarmthInput.addEventListener('input', (e) => {
      adjustWarmth = parseInt(e.target.value, 10);
      const sign = adjustWarmth > 0 ? '+' : '';
      adjWarmthVal.textContent = `${sign}${adjustWarmth}`;
      renderLiveAdjust();
    });
  }

  if (btnResetAdjust) {
    btnResetAdjust.addEventListener('click', resetAdjustSliders);
  }

  if (btnApplyAdjust) {
    btnApplyAdjust.addEventListener('click', () => {
      if (!currentWorkingImage) return;

      saveImageState();

      // Commit baked color filter into currentWorkingImage
      const baked = document.createElement('canvas');
      baked.width = baseCanvas.width;
      baked.height = baseCanvas.height;
      const bCtx = baked.getContext('2d');
      bCtx.filter = buildAdjustFilterString();
      bCtx.drawImage(currentWorkingImage, 0, 0);
      currentWorkingImage = baked;

      // Invalidate caches
      cachedSubjectCutout = null;
      cachedSubjectMask = null;
      prepareBlurSource();
      prepareSmoothSource();

      // Reset sliders to 0 for next edits
      adjustBrightness = 0;
      adjustContrast = 0;
      adjustSaturation = 0;
      adjustWarmth = 0;
      if (adjBrightnessInput) adjBrightnessInput.value = 0;
      if (adjContrastInput) adjContrastInput.value = 0;
      if (adjSaturationInput) adjSaturationInput.value = 0;
      if (adjWarmthInput) adjWarmthInput.value = 0;
      if (adjBrightnessVal) adjBrightnessVal.textContent = '0%';
      if (adjContrastVal) adjContrastVal.textContent = '0%';
      if (adjSaturationVal) adjSaturationVal.textContent = '0%';
      if (adjWarmthVal) adjWarmthVal.textContent = '0';

      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(currentWorkingImage, 0, 0);

      updateUndoState();
      alert('✓ Color adjustments applied successfully!');
    });
  }

  if (btnSaveImageAdjust) {
    btnSaveImageAdjust.addEventListener('click', exportImage);
  }

  // ==========================================
  // 6. Tool 6: Text Studio (Google Fonts, Typography, Styles, Drag & Bake)
  // ==========================================
  function updateTextPreview() {
    if (!textBoxElement || !textContentDisplay) return;

    // Update Text Content
    textContentDisplay.textContent = textString || ' ';

    // Typography styling
    textBoxElement.style.fontFamily = textFont;
    textBoxElement.style.fontSize = `${textSize}px`;
    textBoxElement.style.fontWeight = textBold ? '800' : '600';
    textBoxElement.style.fontStyle = textItalic ? 'italic' : 'normal';
    textContentDisplay.style.textDecoration = textUnderline ? 'underline' : 'none';
    textBoxElement.style.textAlign = textAlign;

    // Independent Text Fill Color & Fill Opacity (Does NOT affect outline, shadow, glow, or box)
    textContentDisplay.style.color = hexToRgba(textColor, textOpacity);
    textBoxElement.style.opacity = '1';

    // Toggle Effect Detail Subpanels
    if (panelOutlineSettings) panelOutlineSettings.classList.toggle('hidden', textEffect !== 'border');
    if (panelShadowSettings) panelShadowSettings.classList.toggle('hidden', textEffect !== 'shadow');
    if (panelGlowSettings) panelGlowSettings.classList.toggle('hidden', textEffect !== 'glow');
    if (panelBoxSettings) panelBoxSettings.classList.toggle('hidden', textEffect !== 'box');

    // Reset base styles
    textContentDisplay.style.webkitTextStroke = '0px transparent';
    textContentDisplay.style.textShadow = 'none';
    textBoxElement.style.backgroundColor = 'transparent';
    textBoxElement.style.padding = '4px 8px';
    textBoxElement.style.borderRadius = '0px';

    // Apply specific effect styles independently
    if (textEffect === 'border') {
      const strokeRgba = hexToRgba(outlineColor, outlineOpacity);
      textContentDisplay.style.webkitTextStroke = `${outlineWidth}px ${strokeRgba}`;
    } else if (textEffect === 'shadow') {
      const shadowRgba = hexToRgba(shadowColor, shadowOpacity);
      textContentDisplay.style.textShadow = `0px ${shadowDist}px ${shadowBlur}px ${shadowRgba}`;
    } else if (textEffect === 'glow') {
      const glowRgba = hexToRgba(glowColor, glowOpacity);
      textContentDisplay.style.textShadow = `0px 0px ${glowRadius}px ${glowRgba}, 0px 0px ${Math.round(glowRadius * 1.5)}px ${glowRgba}`;
    } else if (textEffect === 'box') {
      const boxRgba = hexToRgba(boxColor, boxOpacity);
      textBoxElement.style.backgroundColor = boxRgba;
      textBoxElement.style.padding = '10px 18px';
      textBoxElement.style.borderRadius = '12px';
    }

    // Effect Classes for any auxiliary CSS
    textBoxElement.classList.toggle('effect-border', textEffect === 'border');
    textBoxElement.classList.toggle('effect-shadow', textEffect === 'shadow');
    textBoxElement.classList.toggle('effect-glow', textEffect === 'glow');
    textBoxElement.classList.toggle('effect-box', textEffect === 'box');

    // Canvas Position (centered around textDisplayX, textDisplayY)
    textBoxElement.style.left = `${textDisplayX}px`;
    textBoxElement.style.top = `${textDisplayY}px`;
  }

  // Pointer & Touch Dragging for Text on Canvas
  function handleTextDragStart(e) {
    if (activeTool !== 'text') return;
    isTextDragging = true;
    textBoxElement.classList.add('dragging');
    const pt = e.touches ? e.touches[0] : e;
    dragStartPointerX = pt.clientX;
    dragStartPointerY = pt.clientY;
    dragStartTextX = textDisplayX;
    dragStartTextY = textDisplayY;
    e.stopPropagation();
  }

  function handleTextDragMove(e) {
    if (!isTextDragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = (pt.clientX - dragStartPointerX) / scale;
    const dy = (pt.clientY - dragStartPointerY) / scale;

    // Allow dragging freely without artificial squishing or premature wrapping
    const boundMargin = 300;
    const clampW = displayWidth || 400;
    const clampH = displayHeight || 400;
    textDisplayX = Math.max(-boundMargin, Math.min(clampW + boundMargin, dragStartTextX + dx));
    textDisplayY = Math.max(-boundMargin, Math.min(clampH + boundMargin, dragStartTextY + dy));

    textBoxElement.style.left = `${textDisplayX}px`;
    textBoxElement.style.top = `${textDisplayY}px`;
    e.preventDefault();
  }

  function handleTextDragEnd() {
    if (isTextDragging) {
      isTextDragging = false;
      textBoxElement.classList.remove('dragging');
    }
  }

  if (textBoxElement) {
    textBoxElement.addEventListener('mousedown', handleTextDragStart);
    textBoxElement.addEventListener('touchstart', handleTextDragStart, { passive: false });
  }
  if (btnDragText) {
    btnDragText.addEventListener('mousedown', handleTextDragStart);
    btnDragText.addEventListener('touchstart', handleTextDragStart, { passive: false });
  }
  window.addEventListener('mousemove', handleTextDragMove);
  window.addEventListener('touchmove', handleTextDragMove, { passive: false });
  window.addEventListener('mouseup', handleTextDragEnd);
  window.addEventListener('touchend', handleTextDragEnd);

  // Text Input field
  if (textStudioInput) {
    textStudioInput.addEventListener('input', (e) => {
      textString = e.target.value;
      updateTextPreview();
    });
  }

  if (btnClearTextInput) {
    btnClearTextInput.addEventListener('click', () => {
      textString = '';
      if (textStudioInput) textStudioInput.value = '';
      updateTextPreview();
    });
  }

  if (btnDeleteText) {
    btnDeleteText.addEventListener('click', (e) => {
      e.stopPropagation();
      textString = '';
      if (textStudioInput) textStudioInput.value = '';
      updateTextPreview();
    });
  }

  // Font Selection Carousel Chips (Offline Google Fonts)
  if (fontChipsScroll) {
    fontChipsScroll.querySelectorAll('.font-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        fontChipsScroll.querySelectorAll('.font-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        textFont = chip.dataset.font;
        if (activeFontTag) activeFontTag.textContent = chip.textContent;
        updateTextPreview();
      });
    });
  }

  // Formatting (Bold, Italic, Underline)
  if (btnTextBold) {
    btnTextBold.addEventListener('click', () => {
      textBold = !textBold;
      btnTextBold.classList.toggle('active', textBold);
      updateTextPreview();
    });
  }

  if (btnTextItalic) {
    btnTextItalic.addEventListener('click', () => {
      textItalic = !textItalic;
      btnTextItalic.classList.toggle('active', textItalic);
      updateTextPreview();
    });
  }

  if (btnTextUnderline) {
    btnTextUnderline.addEventListener('click', () => {
      textUnderline = !textUnderline;
      btnTextUnderline.classList.toggle('active', textUnderline);
      updateTextPreview();
    });
  }

  // Text Alignment
  const alignBtns = [btnTextAlignCenter, btnTextAlignLeft, btnTextAlignRight];
  function setTextAlign(align, activeBtn) {
    textAlign = align;
    alignBtns.forEach(btn => { if (btn) btn.classList.remove('active'); });
    if (activeBtn) activeBtn.classList.add('active');
    updateTextPreview();
  }
  if (btnTextAlignCenter) btnTextAlignCenter.addEventListener('click', () => setTextAlign('center', btnTextAlignCenter));
  if (btnTextAlignLeft) btnTextAlignLeft.addEventListener('click', () => setTextAlign('left', btnTextAlignLeft));
  if (btnTextAlignRight) btnTextAlignRight.addEventListener('click', () => setTextAlign('right', btnTextAlignRight));

  // Style / Effect Pills
  const effectPills = panelText ? panelText.querySelectorAll('.effect-pill') : [];
  effectPills.forEach(pill => {
    pill.addEventListener('click', () => {
      effectPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      textEffect = pill.dataset.effect || 'none';
      updateTextPreview();
    });
  });

  // Main Text Color Swatches & Native Color Picker
  const colorSwatches = panelText ? panelText.querySelectorAll('.color-swatch:not(.outline-color-swatch):not(.shadow-color-swatch):not(.glow-color-swatch):not(.box-color-swatch)') : [];
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      textColor = swatch.dataset.color;
      if (activeColorTag) activeColorTag.textContent = textColor.toUpperCase();
      if (textColorPicker) textColorPicker.value = textColor;
      updateTextPreview();
    });
  });

  if (textColorPicker) {
    textColorPicker.addEventListener('input', (e) => {
      textColor = e.target.value;
      colorSwatches.forEach(s => s.classList.remove('active'));
      if (activeColorTag) activeColorTag.textContent = textColor.toUpperCase();
      updateTextPreview();
    });
  }

  // Size & Fill Opacity Sliders
  if (textSizeSlider) {
    textSizeSlider.addEventListener('input', (e) => {
      textSize = parseInt(e.target.value, 10);
      if (textSizeVal) textSizeVal.textContent = `${textSize}px`;
      updateTextPreview();
    });
  }

  if (textOpacitySlider) {
    textOpacitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      textOpacity = val / 100;
      if (textOpacityVal) textOpacityVal.textContent = `${val}%`;
      updateTextPreview();
    });
  }

  // Outline (Stroke) Controls
  if (outlineWidthSlider) {
    outlineWidthSlider.addEventListener('input', (e) => {
      outlineWidth = parseInt(e.target.value, 10);
      if (outlineWidthVal) outlineWidthVal.textContent = `${outlineWidth}px`;
      updateTextPreview();
    });
  }
  if (outlineOpacitySlider) {
    outlineOpacitySlider.addEventListener('input', (e) => {
      outlineOpacity = parseInt(e.target.value, 10) / 100;
      if (outlineOpacityVal) outlineOpacityVal.textContent = `${e.target.value}%`;
      updateTextPreview();
    });
  }
  const outlineSwatches = panelText ? panelText.querySelectorAll('.outline-color-swatch') : [];
  outlineSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      outlineSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      outlineColor = swatch.dataset.color;
      if (activeOutlineTag) activeOutlineTag.textContent = outlineColor.toUpperCase();
      if (outlineColorPicker) outlineColorPicker.value = outlineColor;
      updateTextPreview();
    });
  });
  if (outlineColorPicker) {
    outlineColorPicker.addEventListener('input', (e) => {
      outlineColor = e.target.value;
      outlineSwatches.forEach(s => s.classList.remove('active'));
      if (activeOutlineTag) activeOutlineTag.textContent = outlineColor.toUpperCase();
      updateTextPreview();
    });
  }

  // Shadow Controls
  if (shadowBlurSlider) {
    shadowBlurSlider.addEventListener('input', (e) => {
      shadowBlur = parseInt(e.target.value, 10);
      if (shadowBlurVal) shadowBlurVal.textContent = `${shadowBlur}px`;
      updateTextPreview();
    });
  }
  if (shadowDistSlider) {
    shadowDistSlider.addEventListener('input', (e) => {
      shadowDist = parseInt(e.target.value, 10);
      if (shadowDistVal) shadowDistVal.textContent = `${shadowDist}px`;
      updateTextPreview();
    });
  }
  if (shadowOpacitySlider) {
    shadowOpacitySlider.addEventListener('input', (e) => {
      shadowOpacity = parseInt(e.target.value, 10) / 100;
      if (shadowOpacityVal) shadowOpacityVal.textContent = `${e.target.value}%`;
      updateTextPreview();
    });
  }
  const shadowSwatches = panelText ? panelText.querySelectorAll('.shadow-color-swatch') : [];
  shadowSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      shadowSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      shadowColor = swatch.dataset.color;
      if (activeShadowTag) activeShadowTag.textContent = shadowColor.toUpperCase();
      if (shadowColorPicker) shadowColorPicker.value = shadowColor;
      updateTextPreview();
    });
  });
  if (shadowColorPicker) {
    shadowColorPicker.addEventListener('input', (e) => {
      shadowColor = e.target.value;
      shadowSwatches.forEach(s => s.classList.remove('active'));
      if (activeShadowTag) activeShadowTag.textContent = shadowColor.toUpperCase();
      updateTextPreview();
    });
  }

  // Glow Controls
  if (glowRadiusSlider) {
    glowRadiusSlider.addEventListener('input', (e) => {
      glowRadius = parseInt(e.target.value, 10);
      if (glowRadiusVal) glowRadiusVal.textContent = `${glowRadius}px`;
      updateTextPreview();
    });
  }
  if (glowOpacitySlider) {
    glowOpacitySlider.addEventListener('input', (e) => {
      glowOpacity = parseInt(e.target.value, 10) / 100;
      if (glowOpacityVal) glowOpacityVal.textContent = `${e.target.value}%`;
      updateTextPreview();
    });
  }
  const glowSwatches = panelText ? panelText.querySelectorAll('.glow-color-swatch') : [];
  glowSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      glowSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      glowColor = swatch.dataset.color;
      if (activeGlowTag) activeGlowTag.textContent = glowColor.toUpperCase();
      if (glowColorPicker) glowColorPicker.value = glowColor;
      updateTextPreview();
    });
  });
  if (glowColorPicker) {
    glowColorPicker.addEventListener('input', (e) => {
      glowColor = e.target.value;
      glowSwatches.forEach(s => s.classList.remove('active'));
      if (activeGlowTag) activeGlowTag.textContent = glowColor.toUpperCase();
      updateTextPreview();
    });
  }

  // Box Controls
  if (boxOpacitySlider) {
    boxOpacitySlider.addEventListener('input', (e) => {
      boxOpacity = parseInt(e.target.value, 10) / 100;
      if (boxOpacityVal) boxOpacityVal.textContent = `${e.target.value}%`;
      updateTextPreview();
    });
  }
  const boxSwatches = panelText ? panelText.querySelectorAll('.box-color-swatch') : [];
  boxSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      boxSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      boxColor = swatch.dataset.color;
      if (activeBoxTag) activeBoxTag.textContent = boxColor.toUpperCase();
      if (boxColorPicker) boxColorPicker.value = boxColor;
      updateTextPreview();
    });
  });
  if (boxColorPicker) {
    boxColorPicker.addEventListener('input', (e) => {
      boxColor = e.target.value;
      boxSwatches.forEach(s => s.classList.remove('active'));
      if (activeBoxTag) activeBoxTag.textContent = boxColor.toUpperCase();
      updateTextPreview();
    });
  }

  // Reset Text Settings
  function resetTextSettings() {
    textString = 'MayaTheDiva.com';
    if (textStudioInput) textStudioInput.value = textString;
    textFont = 'Inter';
    textSize = 8;
    textOpacity = 0.5;
    textColor = '#ffffff';
    textBold = false;
    textItalic = false;
    textUnderline = false;
    textAlign = 'center';
    textEffect = 'none';

    outlineColor = '#000000';
    outlineWidth = 4;
    outlineOpacity = 1.0;
    shadowColor = '#000000';
    shadowBlur = 12;
    shadowDist = 4;
    shadowOpacity = 0.9;
    glowColor = '#38bdf8';
    glowRadius = 18;
    glowOpacity = 1.0;
    boxColor = '#000000';
    boxOpacity = 0.72;

    if (activeFontTag) activeFontTag.textContent = 'Inter';
    if (activeColorTag) activeColorTag.textContent = '#FFFFFF';
    if (activeOutlineTag) activeOutlineTag.textContent = '#000000';
    if (activeShadowTag) activeShadowTag.textContent = '#000000';
    if (activeGlowTag) activeGlowTag.textContent = '#38BDF8';
    if (activeBoxTag) activeBoxTag.textContent = '#000000';

    if (textSizeSlider) textSizeSlider.value = 8;
    if (textSizeVal) textSizeVal.textContent = '8px';
    if (textOpacitySlider) textOpacitySlider.value = 50;
    if (textOpacityVal) textOpacityVal.textContent = '50%';

    if (outlineWidthSlider) outlineWidthSlider.value = 4;
    if (outlineWidthVal) outlineWidthVal.textContent = '4px';
    if (outlineOpacitySlider) outlineOpacitySlider.value = 100;
    if (outlineOpacityVal) outlineOpacityVal.textContent = '100%';

    if (shadowBlurSlider) shadowBlurSlider.value = 12;
    if (shadowBlurVal) shadowBlurVal.textContent = '12px';
    if (shadowDistSlider) shadowDistSlider.value = 4;
    if (shadowDistVal) shadowDistVal.textContent = '4px';
    if (shadowOpacitySlider) shadowOpacitySlider.value = 90;
    if (shadowOpacityVal) shadowOpacityVal.textContent = '90%';

    if (glowRadiusSlider) glowRadiusSlider.value = 18;
    if (glowRadiusVal) glowRadiusVal.textContent = '18px';
    if (glowOpacitySlider) glowOpacitySlider.value = 100;
    if (glowOpacityVal) glowOpacityVal.textContent = '100%';

    if (boxOpacitySlider) boxOpacitySlider.value = 72;
    if (boxOpacityVal) boxOpacityVal.textContent = '72%';

    if (btnTextBold) btnTextBold.classList.remove('active');
    if (btnTextItalic) btnTextItalic.classList.remove('active');
    if (btnTextUnderline) btnTextUnderline.classList.remove('active');
    setTextAlign('center', btnTextAlignCenter);

    if (fontChipsScroll) {
      fontChipsScroll.querySelectorAll('.font-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.font === 'Inter');
      });
    }
    effectPills.forEach(p => p.classList.toggle('active', p.dataset.effect === 'none'));
    colorSwatches.forEach(s => s.classList.toggle('active', s.dataset.color === '#ffffff'));

    textDisplayX = Math.round((displayWidth || 400) * 0.5);
    textDisplayY = Math.round((displayHeight || 400) * 0.5);
    updateTextPreview();
  }

  if (btnResetText) {
    btnResetText.addEventListener('click', resetTextSettings);
  }

  // High-Resolution Vector Baking onto Canvas
  function bakeTextToCanvas() {
    if (!currentWorkingImage || !textString.trim()) {
      alert('Please enter some text first!');
      return;
    }

    saveImageState();

    const w = currentWorkingImage.width;
    const h = currentWorkingImage.height;
    const ratio = w / (displayWidth || w);

    const bakedCanvas = document.createElement('canvas');
    bakedCanvas.width = w;
    bakedCanvas.height = h;
    const bCtx = bakedCanvas.getContext('2d');

    // 1. Draw base photo
    bCtx.drawImage(currentWorkingImage, 0, 0);

    // 2. Compute high-resolution vector text parameters
    const realFontSize = Math.round(textSize * ratio);
    const realX = textDisplayX * ratio;
    const realY = textDisplayY * ratio;

    bCtx.save();

    const fontStylePart = textItalic ? 'italic ' : '';
    const fontWeightPart = textBold ? '800 ' : '600 ';
    const cleanFont = textFont.includes(',') ? textFont : `"${textFont}"`;
    bCtx.font = `${fontStylePart}${fontWeightPart}${realFontSize}px ${cleanFont}, sans-serif`;
    bCtx.textAlign = textAlign;
    bCtx.textBaseline = 'middle';

    const textLines = textString.split('\n');
    const lineHeight = realFontSize * 1.25;
    const totalBlockHeight = textLines.length * lineHeight;
    const startY = realY - (totalBlockHeight / 2) + (lineHeight / 2);

    // Badge / Box background effect (Uses independent boxColor and boxOpacity)
    if (textEffect === 'box') {
      let maxLineWidth = 0;
      textLines.forEach(line => {
        const lw = bCtx.measureText(line).width;
        if (lw > maxLineWidth) maxLineWidth = lw;
      });
      const padX = 22 * ratio;
      const padY = 14 * ratio;
      const boxW = maxLineWidth + (padX * 2);
      const boxH = totalBlockHeight + (padY * 2);
      let boxX = realX - (boxW / 2);
      if (textAlign === 'left') boxX = realX - padX;
      else if (textAlign === 'right') boxX = realX - maxLineWidth - padX;
      const boxY = realY - (boxH / 2);

      bCtx.fillStyle = hexToRgba(boxColor, boxOpacity);
      bCtx.beginPath();
      if (bCtx.roundRect) {
        bCtx.roundRect(boxX, boxY, boxW, boxH, 14 * ratio);
      } else {
        bCtx.rect(boxX, boxY, boxW, boxH);
      }
      bCtx.fill();
    }

    // Effect styling: Outline or Shadows or Glow (Isolated properties)
    if (textEffect === 'border') {
      bCtx.strokeStyle = hexToRgba(outlineColor, outlineOpacity);
      bCtx.lineWidth = Math.max(1, Math.round(outlineWidth * ratio));
      bCtx.lineJoin = 'round';
      bCtx.miterLimit = 2;
      textLines.forEach((line, idx) => {
        const lineY = startY + (idx * lineHeight);
        bCtx.strokeText(line, realX, lineY);
      });
    } else if (textEffect === 'shadow') {
      bCtx.shadowColor = hexToRgba(shadowColor, shadowOpacity);
      bCtx.shadowBlur = Math.round(shadowBlur * ratio);
      bCtx.shadowOffsetX = 0;
      bCtx.shadowOffsetY = Math.round(shadowDist * ratio);
    } else if (textEffect === 'glow') {
      bCtx.shadowColor = hexToRgba(glowColor, glowOpacity);
      bCtx.shadowBlur = Math.round(glowRadius * ratio);
    }

    // Draw text fill with independent fill color and fill opacity
    bCtx.fillStyle = hexToRgba(textColor, textOpacity);
    textLines.forEach((line, idx) => {
      const lineY = startY + (idx * lineHeight);
      bCtx.fillText(line, realX, lineY);
    });

    // Clear shadow before drawing underline so underline doesn't cast duplicate shadow
    bCtx.shadowColor = 'transparent';
    bCtx.shadowBlur = 0;
    bCtx.shadowOffsetX = 0;
    bCtx.shadowOffsetY = 0;

    // Underline
    if (textUnderline) {
      bCtx.strokeStyle = hexToRgba(textColor, textOpacity);
      bCtx.lineWidth = Math.max(2, Math.round(2.5 * ratio));
      textLines.forEach((line, idx) => {
        const lineY = startY + (idx * lineHeight);
        const textMetric = bCtx.measureText(line);
        let ulX = realX - (textMetric.width / 2);
        if (textAlign === 'left') ulX = realX;
        else if (textAlign === 'right') ulX = realX - textMetric.width;
        bCtx.beginPath();
        bCtx.moveTo(ulX, lineY + (realFontSize * 0.45));
        bCtx.lineTo(ulX + textMetric.width, lineY + (realFontSize * 0.45));
        bCtx.stroke();
      });
    }

    bCtx.restore();

    // Commit to current working image
    currentWorkingImage = bakedCanvas;
    baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.drawImage(currentWorkingImage, 0, 0);

    // Invalidate caches
    cachedSubjectCutout = null;
    cachedSubjectMask = null;
    prepareBlurSource();
    prepareSmoothSource();

    updateUndoState();
    alert('✓ Text baked into photo at full resolution!');
  }

  if (btnApplyText) {
    btnApplyText.addEventListener('click', bakeTextToCanvas);
  }

  if (btnSaveImageText) {
    btnSaveImageText.addEventListener('click', exportImage);
  }

  // ==========================================
  // 7. Undo State Management
  // ==========================================
  function saveImageState() {
    if (!currentWorkingImage) return;
    const state = document.createElement('canvas');
    state.width = baseCanvas.width;
    state.height = baseCanvas.height;
    state.getContext('2d').drawImage(baseCanvas, 0, 0);

    imageHistory.push(state);
    if (imageHistory.length > MAX_HISTORY) imageHistory.shift();
    updateUndoState();
  }

  btnUndo.addEventListener('click', () => {
    if (maskStrokeHistory.length > 0) {
      const lastStroke = maskStrokeHistory.pop();
      maskCtx.putImageData(lastStroke, 0, 0);
      updateUndoState();
      return;
    }

    if (imageHistory.length > 0) {
      const prevImageState = imageHistory.pop();
      currentWorkingImage = prevImageState;
      baseCtx.drawImage(prevImageState, 0, 0);
      clearMask();
      cachedSubjectMask = null;
      cachedSubjectCutout = null;
      blurSourceCanvas = null;
      smoothSourceCanvas = null;
      updateUndoState();
    }
  });

  function updateUndoState() {
    const hasImageUndo = imageHistory.length > 0;
    const hasMaskUndo = maskStrokeHistory.length > 0;

    btnUndo.disabled = !(hasImageUndo || hasMaskUndo);
    if (btnUndoBlurBrush) btnUndoBlurBrush.disabled = !hasImageUndo;
  }

  // ==========================================
  // 7. Ultra-Realistic On-Device Skin Inpainting Engine (Instant Fallback)
  // ==========================================
  function runOnDeviceSkinInpaint(cropX1, cropY1, cropW, cropH) {
    const baseDataObj = baseCtx.getImageData(cropX1, cropY1, cropW, cropH);
    const maskData = maskCtx.getImageData(cropX1, cropY1, cropW, cropH).data;
    const d = baseDataObj.data;
    const W = cropW;
    const H = cropH;
    const total = W * H;

    // 1. Identify masked pixels
    const isMask = new Uint8Array(total);
    const maskedIndices = [];
    for (let i = 0; i < total; i++) {
      if (maskData[i * 4 + 3] > 20) {
        isMask[i] = 1;
        maskedIndices.push(i);
      }
    }
    const numMasked = maskedIndices.length;
    if (numMasked === 0) return;

    // 2. Sample surrounding clean skin (skipping dark tattoo ink edges)
    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];

    const bufR = new Float32Array(total);
    const bufG = new Float32Array(total);
    const bufB = new Float32Array(total);

    for (let i = 0; i < total; i++) {
      const p = i * 4;
      bufR[i] = d[p];
      bufG[i] = d[p + 1];
      bufB[i] = d[p + 2];
    }

    const skinSamplesR = [];
    const skinSamplesG = [];
    const skinSamplesB = [];

    // Ray march in 8 directions to initialize harmonic field
    const maxRay = Math.max(60, Math.ceil(Math.hypot(W, H) * 0.6));
    for (let k = 0; k < numMasked; k++) {
      const idx = maskedIndices[k];
      const px = idx % W;
      const py = Math.floor(idx / W);

      let wSum = 0, rSum = 0, gSum = 0, bSum = 0;
      for (let dIdx = 0; dIdx < 8; dIdx++) {
        const dx = dirs[dIdx][0];
        const dy = dirs[dIdx][1];
        let step = 1;
        while (step < maxRay) {
          const nx = px + dx * step;
          const ny = py + dy * step;
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) break;
          const nIdx = ny * W + nx;
          if (!isMask[nIdx]) {
            // Step 2-4px further into healthy skin to avoid dark tattoo ink edges
            const safeStep = step + 3;
            let safeX = px + dx * safeStep;
            let safeY = py + dy * safeStep;
            if (safeX < 0 || safeX >= W || safeY < 0 || safeY >= H) {
              safeX = nx;
              safeY = ny;
            }
            const sIdx = (safeY * W + safeX) * 4;
            const dist = Math.hypot(safeX - px, safeY - py) || 1;
            const weight = 1.0 / (dist * dist);

            const r = d[sIdx];
            const g = d[sIdx + 1];
            const b = d[sIdx + 2];

            rSum += r * weight;
            gSum += g * weight;
            bSum += b * weight;
            wSum += weight;

            if (skinSamplesR.length < 500) {
              skinSamplesR.push(r);
              skinSamplesG.push(g);
              skinSamplesB.push(b);
            }
            break;
          }
          step++;
        }
      }

      if (wSum > 0) {
        bufR[idx] = rSum / wSum;
        bufG[idx] = gSum / wSum;
        bufB[idx] = bSum / wSum;
      }
    }

    // 3. Multi-pass Laplacian PDE smoothing
    const nextR = new Float32Array(bufR);
    const nextG = new Float32Array(bufG);
    const nextB = new Float32Array(bufB);
    const passes = Math.min(45, Math.max(25, Math.round(Math.sqrt(numMasked) * 0.4)));

    for (let it = 0; it < passes; it++) {
      for (let k = 0; k < numMasked; k++) {
        const idx = maskedIndices[k];
        const x = idx % W;
        const y = Math.floor(idx / W);
        if (x <= 0 || x >= W - 1 || y <= 0 || y >= H - 1) continue;

        const up = idx - W;
        const down = idx + W;
        const left = idx - 1;
        const right = idx + 1;

        nextR[idx] = 0.25 * (bufR[up] + bufR[down] + bufR[left] + bufR[right]);
        nextG[idx] = 0.25 * (bufG[up] + bufG[down] + bufG[left] + bufG[right]);
        nextB[idx] = 0.25 * (bufB[up] + bufB[down] + bufB[left] + bufB[right]);
      }
      for (let k = 0; k < numMasked; k++) {
        const idx = maskedIndices[k];
        bufR[idx] = nextR[idx];
        bufG[idx] = nextG[idx];
        bufB[idx] = nextB[idx];
      }
    }

    // 4. Sample skin texture standard deviation (pores & sensor grain)
    let skinNoiseStd = 4.5;
    if (skinSamplesR.length > 10) {
      let lumSum = 0;
      const count = skinSamplesR.length;
      for (let i = 0; i < count; i++) {
        lumSum += 0.299 * skinSamplesR[i] + 0.587 * skinSamplesG[i] + 0.114 * skinSamplesB[i];
      }
      const meanLum = lumSum / count;
      let varSum = 0;
      for (let i = 0; i < count; i++) {
        const lum = 0.299 * skinSamplesR[i] + 0.587 * skinSamplesG[i] + 0.114 * skinSamplesB[i];
        varSum += (lum - meanLum) * (lum - meanLum);
      }
      skinNoiseStd = Math.min(9.0, Math.max(2.5, Math.sqrt(varSum / count)));
    }

    // 5. Multi-pass Feathered Alpha Map for Seamless Blending
    const alphaMap = new Float32Array(total);
    for (let k = 0; k < numMasked; k++) {
      alphaMap[maskedIndices[k]] = 1.0;
    }
    const tempAlpha = new Float32Array(total);
    for (let p = 0; p < 3; p++) {
      for (let y = 1; y < H - 1; y++) {
        const yOffset = y * W;
        for (let x = 1; x < W - 1; x++) {
          const idx = yOffset + x;
          tempAlpha[idx] = (
            alphaMap[idx - W - 1] + alphaMap[idx - W] + alphaMap[idx - W + 1] +
            alphaMap[idx - 1]     + alphaMap[idx]     + alphaMap[idx + 1] +
            alphaMap[idx + W - 1] + alphaMap[idx + W] + alphaMap[idx + W + 1]
          ) / 9.0;
        }
      }
      alphaMap.set(tempAlpha);
    }

    // 6. Write Synthesized Skin with Hermite feathering and Organic Micro-Pore Grain
    for (let y = 0; y < H; y++) {
      const yOffset = y * W;
      for (let x = 0; x < W; x++) {
        const idx = yOffset + x;
        const rawA = alphaMap[idx];
        if (rawA > 0.005) {
          // Smooth Hermite S-curve blending (zero visible seam)
          const a = rawA * rawA * (3.0 - 2.0 * rawA);
          const p = idx * 4;

          const u1 = Math.max(0.0001, Math.random());
          const u2 = Math.random();
          const noise = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * skinNoiseStd * 0.55;

          const synR = Math.max(0, Math.min(255, bufR[idx] + noise));
          const synG = Math.max(0, Math.min(255, bufG[idx] + noise * 0.92));
          const synB = Math.max(0, Math.min(255, bufB[idx] + noise * 0.85));

          d[p] = Math.round(d[p] * (1.0 - a) + synR * a);
          d[p + 1] = Math.round(d[p + 1] * (1.0 - a) + synG * a);
          d[p + 2] = Math.round(d[p + 2] * (1.0 - a) + synB * a);
        }
      }
    }

    baseCtx.putImageData(baseDataObj, cropX1, cropY1);
  }

  // ==========================================
  // 7. Fast Neural Inpainting (Tattoo Erase)
  // ==========================================
  btnEraseTattoo.addEventListener('click', async () => {
    if (!currentWorkingImage) return;

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    let minX = maskCanvas.width, minY = maskCanvas.height, maxX = 0, maxY = 0;
    let hasMask = false;

    for (let y = 0; y < maskCanvas.height; y += 2) {
      for (let x = 0; x < maskCanvas.width; x += 2) {
        const idx = (y * maskCanvas.width + x) * 4;
        if (maskData[idx + 3] > 20) {
          hasMask = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasMask) {
      alert('Please use the brush to highlight the tattoo spots you want to remove.');
      return;
    }

    showProgress(true, 'Erasing Tattoos...', 'Synthesizing clean skin with Studio AI...', 35);

    // Adaptive crop region around painted tattoo for fallback synthesis
    const pad = Math.max(30, Math.round(Math.max(maxX - minX, maxY - minY) * 0.35));
    const cropX1 = Math.max(0, minX - pad);
    const cropY1 = Math.max(0, minY - pad);
    const cropX2 = Math.min(baseCanvas.width, maxX + pad);
    const cropY2 = Math.min(baseCanvas.height, maxY + pad);
    const cropW = cropX2 - cropX1;
    const cropH = cropY2 - cropY1;

    saveImageState();

    let serverSuccess = false;

    try {
      // Base image JPEG
      const imageBase64 = baseCanvas.toDataURL('image/jpeg', 0.96);

      // Binary mask PNG
      const binaryMaskCanvas = document.createElement('canvas');
      binaryMaskCanvas.width = maskCanvas.width;
      binaryMaskCanvas.height = maskCanvas.height;
      const bmCtx = binaryMaskCanvas.getContext('2d');
      bmCtx.fillStyle = '#000000';
      bmCtx.fillRect(0, 0, binaryMaskCanvas.width, binaryMaskCanvas.height);

      const mImgData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      const bImgData = bmCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      const srcD = mImgData.data;
      const dstD = bImgData.data;

      for (let i = 0; i < srcD.length; i += 4) {
        if (srcD[i + 3] > 20) {
          dstD[i] = 255;
          dstD[i + 1] = 255;
          dstD[i + 2] = 255;
          dstD[i + 3] = 255;
        }
      }
      bmCtx.putImageData(bImgData, 0, 0);
      const maskBase64 = binaryMaskCanvas.toDataURL('image/png');

      progressFill.style.width = '70%';

      const inpaintResult = await callCloudAi('inpaint', [imageBase64, maskBase64], '/api/inpaint', { image: imageBase64, mask: maskBase64 }, 30000);

      if (inpaintResult && !inpaintResult.startsWith('ERROR:')) {
        progressFill.style.width = '95%';
        await new Promise((resolve, reject) => {
          const cleanImg = new Image();
          cleanImg.onload = () => {
            baseCtx.drawImage(cleanImg, 0, 0);
            currentWorkingImage = cleanImg;
            cachedSubjectMask = null;
            cachedSubjectCutout = null;
            clearMask();
            updateUndoState();
            showProgress(false);
            resolve();
          };
          cleanImg.onerror = reject;
          cleanImg.src = inpaintResult;
        });
        serverSuccess = true;
      }
    } catch (srvErr) {
      console.warn('[InkErase] Server inpaint failed or timed out, executing On-Device Skin Inpaint fallback:', srvErr);
    }

    // Seamless Fallback: if server was down or timed out, synthesize skin directly on-device!
    if (!serverSuccess) {
      try {
        showProgress(true, 'Synthesizing Skin...', 'Reconstructing skin pores & tone on-device...', 80);
        await new Promise(r => setTimeout(r, 30));
        runOnDeviceSkinInpaint(cropX1, cropY1, cropW, cropH);

        const baked = document.createElement('canvas');
        baked.width = baseCanvas.width;
        baked.height = baseCanvas.height;
        baked.getContext('2d').drawImage(baseCanvas, 0, 0);
        currentWorkingImage = baked;

        cachedSubjectMask = null;
        cachedSubjectCutout = null;
        clearMask();
        updateUndoState();
        showProgress(false);
      } catch (fbErr) {
        console.error('[InkErase] On-device inpaint fallback error:', fbErr);
        showProgress(false);
        alert('Tattoo removal error: ' + fbErr.message);
      }
    }
  });

  function showProgress(show, title = '', sub = '', pct = 0) {
    if (show) {
      processStatusTitle.textContent = title;
      processStatusSub.textContent = sub;
      progressFill.style.width = `${pct}%`;
      processingOverlay.classList.remove('hidden');
    } else {
      processingOverlay.classList.add('hidden');
    }
  }

  // ==========================================
  // 7. Tool 7: Canva Frame (Aspect Ratios + InShot Blur/Color BG)
  // ==========================================
  const canvasRatioRow = document.getElementById('canvasRatioRow');
  const btnCanvasBgBlur = document.getElementById('btnCanvasBgBlur');
  const btnCanvasBgColor = document.getElementById('btnCanvasBgColor');
  const canvasBlurControls = document.getElementById('canvasBlurControls');
  const canvasColorControls = document.getElementById('canvasColorControls');
  const canvasBlurSlider = document.getElementById('canvasBlurSlider');
  const canvasBlurVal = document.getElementById('canvasBlurVal');
  const canvasFitScaleSlider = document.getElementById('canvasFitScaleSlider');
  const canvasFitScaleVal = document.getElementById('canvasFitScaleVal');
  const canvasCustomColorInput = document.getElementById('canvasCustomColorInput');
  const btnApplyCanvas = document.getElementById('btnApplyCanvas');
  const btnCancelCanvas = document.getElementById('btnCancelCanvas');
  const btnSaveImageCanvas = document.getElementById('btnSaveImageCanvas');

  function getTargetAspectRatio(ratioStr, imgW, imgH) {
    if (ratioStr === '1:1') return 1.0;
    if (ratioStr === '4:5') return 4 / 5;
    if (ratioStr === '9:16') return 9 / 16;
    if (ratioStr === '16:9') return 16 / 9;
    if (ratioStr === '3:4') return 3 / 4;
    if (ratioStr === '4:3') return 4 / 3;
    if (ratioStr === '2:3') return 2 / 3;
    return imgW / imgH; // 'orig'
  }

  function renderLiveCanvasFrame() {
    if (!currentWorkingImage) return;

    const imgW = currentWorkingImage.width;
    const imgH = currentWorkingImage.height;
    const imgAspect = imgW / imgH;
    const targetAspect = getTargetAspectRatio(canvasRatio, imgW, imgH);

    // Compute frame canvas size preserving maximum source resolution
    let frameW, frameH;
    if (imgAspect > targetAspect) {
      frameW = imgW;
      frameH = Math.round(imgW / targetAspect);
    } else {
      frameH = imgH;
      frameW = Math.round(imgH * targetAspect);
    }

    if (baseCanvas.width !== frameW || baseCanvas.height !== frameH) {
      baseCanvas.width = frameW;
      baseCanvas.height = frameH;
      fitCanvasToCurrentViewport();
    }

    baseCtx.clearRect(0, 0, frameW, frameH);

    // 1. Draw Background: Photo Blur or Solid Color
    if (canvasBgType === 'blur') {
      baseCtx.save();
      // Calculate cover dimensions for background blur
      let bgDrawW, bgDrawH;
      if (imgAspect > targetAspect) {
        bgDrawH = frameH * 1.08;
        bgDrawW = bgDrawH * imgAspect;
      } else {
        bgDrawW = frameW * 1.08;
        bgDrawH = bgDrawW / imgAspect;
      }
      const bgX = (frameW - bgDrawW) / 2;
      const bgY = (frameH - bgDrawH) / 2;

      baseCtx.filter = `blur(${canvasBlurIntensity}px)`;
      baseCtx.drawImage(currentWorkingImage, bgX, bgY, bgDrawW, bgDrawH);
      baseCtx.filter = 'none';

      // Subtle rich contrast vignette overlay
      baseCtx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      baseCtx.fillRect(0, 0, frameW, frameH);
      baseCtx.restore();
    } else {
      baseCtx.save();
      baseCtx.fillStyle = canvasSolidColor;
      baseCtx.fillRect(0, 0, frameW, frameH);
      baseCtx.restore();
    }

    // 2. Draw Framed Photo at user-defined scale and interactive shift offset
    const baseFitScale = Math.min(frameW / imgW, frameH / imgH) * canvasFitScale;
    const fgW = Math.round(imgW * baseFitScale);
    const fgH = Math.round(imgH * baseFitScale);
    const fgX = Math.round((frameW - fgW) / 2 + canvasOffsetX);
    const fgY = Math.round((frameH - fgH) / 2 + canvasOffsetY);

    baseCtx.save();
    // Elegant soft studio shadow under the framed photo
    baseCtx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    baseCtx.shadowBlur = Math.round(24 * (frameW / 1200));
    baseCtx.shadowOffsetY = Math.round(8 * (frameH / 1200));
    baseCtx.drawImage(currentWorkingImage, fgX, fgY, fgW, fgH);
    baseCtx.restore();
  }

  if (canvasRatioRow) {
    canvasRatioRow.addEventListener('click', (e) => {
      const chip = e.target.closest('.preset-chip');
      if (!chip) return;
      canvasRatioRow.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      canvasRatio = chip.dataset.canvasRatio;
      canvasOffsetX = 0;
      canvasOffsetY = 0;
      renderLiveCanvasFrame();
    });
  }

  if (btnCanvasBgBlur && btnCanvasBgColor) {
    btnCanvasBgBlur.addEventListener('click', () => {
      canvasBgType = 'blur';
      btnCanvasBgBlur.classList.add('active');
      btnCanvasBgColor.classList.remove('active');
      if (canvasBlurControls) canvasBlurControls.classList.remove('hidden');
      if (canvasColorControls) canvasColorControls.classList.add('hidden');
      renderLiveCanvasFrame();
    });

    btnCanvasBgColor.addEventListener('click', () => {
      canvasBgType = 'color';
      btnCanvasBgColor.classList.add('active');
      btnCanvasBgBlur.classList.remove('active');
      if (canvasColorControls) canvasColorControls.classList.remove('hidden');
      if (canvasBlurControls) canvasBlurControls.classList.add('hidden');
      renderLiveCanvasFrame();
    });
  }

  if (canvasBlurSlider) {
    canvasBlurSlider.addEventListener('input', (e) => {
      canvasBlurIntensity = parseInt(e.target.value, 10);
      let desc = 'Medium';
      if (canvasBlurIntensity <= 15) desc = 'Soft';
      else if (canvasBlurIntensity >= 45) desc = 'Deep Bokeh';
      if (canvasBlurVal) canvasBlurVal.textContent = `${canvasBlurIntensity}px (${desc})`;
      renderLiveCanvasFrame();
    });
  }

  if (canvasFitScaleSlider) {
    canvasFitScaleSlider.addEventListener('input', (e) => {
      canvasFitScale = parseInt(e.target.value, 10) / 100.0;
      const pct = Math.round(canvasFitScale * 100);
      if (canvasFitScaleVal) canvasFitScaleVal.textContent = pct === 100 ? '100% (Full Fit)' : `${pct}% (Framed)`;
      renderLiveCanvasFrame();
    });
  }

  const canvasPaletteChips = document.querySelectorAll('#canvasColorControls .color-swatch-chip');
  canvasPaletteChips.forEach(chip => {
    chip.addEventListener('click', () => {
      canvasPaletteChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      canvasSolidColor = chip.dataset.color;
      renderLiveCanvasFrame();
    });
  });

  if (canvasCustomColorInput) {
    canvasCustomColorInput.addEventListener('input', (e) => {
      canvasPaletteChips.forEach(c => c.classList.remove('active'));
      canvasSolidColor = e.target.value;
      renderLiveCanvasFrame();
    });
  }

  if (btnApplyCanvas) {
    btnApplyCanvas.addEventListener('click', () => {
      if (!currentWorkingImage) return;
      saveImageState();

      const baked = document.createElement('canvas');
      baked.width = baseCanvas.width;
      baked.height = baseCanvas.height;
      baked.getContext('2d').drawImage(baseCanvas, 0, 0);
      currentWorkingImage = baked;

      cachedSubjectCutout = null;
      updateUndoState();
      switchStudioTool('erase');
      alert('✓ Canvas frame applied successfully!');
    });
  }

  if (btnCancelCanvas) {
    btnCancelCanvas.addEventListener('click', () => {
      if (currentWorkingImage) {
        baseCanvas.width = currentWorkingImage.width;
        baseCanvas.height = currentWorkingImage.height;
        baseCtx.drawImage(currentWorkingImage, 0, 0);
        fitCanvasToCurrentViewport();
      }
      switchStudioTool('erase');
    });
  }

  if (btnSaveImageCanvas) btnSaveImageCanvas.addEventListener('click', exportImage);

  // ==========================================
  // 8. Tool 8: Crop & Straighten
  // ==========================================
  const cropRatioRow = document.getElementById('cropRatioRow');
  const cropBox = document.getElementById('cropBox');
  const cropBdTop = document.getElementById('cropBdTop');
  const cropBdBottom = document.getElementById('cropBdBottom');
  const cropBdLeft = document.getElementById('cropBdLeft');
  const cropBdRight = document.getElementById('cropBdRight');
  const btnCropRotateLeft = document.getElementById('btnCropRotateLeft');
  const btnCropRotateRight = document.getElementById('btnCropRotateRight');
  const btnCropFlipH = document.getElementById('btnCropFlipH');
  const btnApplyCrop = document.getElementById('btnApplyCrop');
  const btnCancelCrop = document.getElementById('btnCancelCrop');
  const btnSaveImageCrop = document.getElementById('btnSaveImageCrop');

  function initCropOverlay() {
    if (!currentWorkingImage || !cropOverlayLayer) return;
    cropOverlayLayer.classList.remove('hidden');

    cropOverlayLayer.style.width = `${displayWidth}px`;
    cropOverlayLayer.style.height = `${displayHeight}px`;

    // Initialize crop box to centered rectangle based on current ratio
    applyCropRatioConstraint(cropRatio);
  }

  function applyCropRatioConstraint(ratioKey) {
    cropRatio = ratioKey;
    let targetW, targetH;

    if (ratioKey === 'free') {
      targetW = Math.round(displayWidth * 0.90);
      targetH = Math.round(displayHeight * 0.90);
    } else {
      let r = 1.0;
      if (ratioKey === 'orig') r = displayWidth / displayHeight;
      else if (ratioKey === '1:1') r = 1.0;
      else if (ratioKey === '4:5') r = 4 / 5;
      else if (ratioKey === '9:16') r = 9 / 16;
      else if (ratioKey === '16:9') r = 16 / 9;
      else if (ratioKey === '3:4') r = 3 / 4;
      else if (ratioKey === '4:3') r = 4 / 3;

      const maxW = displayWidth * 0.92;
      const maxH = displayHeight * 0.92;

      if (maxW / maxH > r) {
        targetH = maxH;
        targetW = targetH * r;
      } else {
        targetW = maxW;
        targetH = targetW / r;
      }
    }

    targetW = Math.max(40, Math.min(displayWidth, Math.round(targetW)));
    targetH = Math.max(40, Math.min(displayHeight, Math.round(targetH)));

    cropRect = {
      x: Math.round((displayWidth - targetW) / 2),
      y: Math.round((displayHeight - targetH) / 2),
      w: targetW,
      h: targetH
    };

    updateCropOverlayUI();
  }

  function updateCropOverlayUI() {
    if (!cropBox) return;

    // Clamp cropRect within viewport
    cropRect.x = Math.max(0, Math.min(displayWidth - cropRect.w, cropRect.x));
    cropRect.y = Math.max(0, Math.min(displayHeight - cropRect.h, cropRect.y));
    cropRect.w = Math.max(40, Math.min(displayWidth, cropRect.w));
    cropRect.h = Math.max(40, Math.min(displayHeight, cropRect.h));

    cropBox.style.left = `${cropRect.x}px`;
    cropBox.style.top = `${cropRect.y}px`;
    cropBox.style.width = `${cropRect.w}px`;
    cropBox.style.height = `${cropRect.h}px`;

    // Update 4 backdrop panels
    if (cropBdTop) {
      cropBdTop.style.top = '0px';
      cropBdTop.style.left = '0px';
      cropBdTop.style.width = `${displayWidth}px`;
      cropBdTop.style.height = `${cropRect.y}px`;
    }
    if (cropBdBottom) {
      cropBdBottom.style.top = `${cropRect.y + cropRect.h}px`;
      cropBdBottom.style.left = '0px';
      cropBdBottom.style.width = `${displayWidth}px`;
      cropBdBottom.style.height = `${Math.max(0, displayHeight - (cropRect.y + cropRect.h))}px`;
    }
    if (cropBdLeft) {
      cropBdLeft.style.top = `${cropRect.y}px`;
      cropBdLeft.style.left = '0px';
      cropBdLeft.style.width = `${cropRect.x}px`;
      cropBdLeft.style.height = `${cropRect.h}px`;
    }
    if (cropBdRight) {
      cropBdRight.style.top = `${cropRect.y}px`;
      cropBdRight.style.left = `${cropRect.x + cropRect.w}px`;
      cropBdRight.style.width = `${Math.max(0, displayWidth - (cropRect.x + cropRect.w))}px`;
      cropBdRight.style.height = `${cropRect.h}px`;
    }
  }

  if (cropRatioRow) {
    cropRatioRow.addEventListener('click', (e) => {
      const chip = e.target.closest('.preset-chip');
      if (!chip) return;
      cropRatioRow.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyCropRatioConstraint(chip.dataset.cropRatio);
    });
  }

  // Interactive Touch & Mouse Drag on Crop Box & Handles
  function handleCropDragStart(clientX, clientY, target) {
    const handleEl = target.closest('.crop-handle');
    if (handleEl) {
      activeCropHandle = handleEl.dataset.handle;
    } else if (target.closest('.crop-box')) {
      activeCropHandle = 'box';
    } else {
      return;
    }

    isDraggingCrop = true;
    cropDragStart = {
      mouseX: clientX,
      mouseY: clientY,
      startRect: { ...cropRect }
    };
  }

  function handleCropDragMove(clientX, clientY) {
    if (!isDraggingCrop || !cropDragStart.startRect) return;

    const dx = (clientX - cropDragStart.mouseX) / scale;
    const dy = (clientY - cropDragStart.mouseY) / scale;
    const s = cropDragStart.startRect;

    if (activeCropHandle === 'box') {
      cropRect.x = Math.max(0, Math.min(displayWidth - s.w, s.x + dx));
      cropRect.y = Math.max(0, Math.min(displayHeight - s.h, s.y + dy));
    } else {
      let newX = s.x;
      let newY = s.y;
      let newW = s.w;
      let newH = s.h;

      if (activeCropHandle.includes('r')) newW = Math.max(40, s.w + dx);
      if (activeCropHandle.includes('b')) newH = Math.max(40, s.h + dy);
      if (activeCropHandle.includes('l')) {
        const potentialW = Math.max(40, s.w - dx);
        newX = s.x + (s.w - potentialW);
        newW = potentialW;
      }
      if (activeCropHandle.includes('t')) {
        const potentialH = Math.max(40, s.h - dy);
        newY = s.y + (s.h - potentialH);
        newH = potentialH;
      }

      // If a fixed aspect ratio is selected, maintain it
      if (cropRatio !== 'free') {
        let r = 1.0;
        if (cropRatio === 'orig') r = displayWidth / displayHeight;
        else if (cropRatio === '1:1') r = 1.0;
        else if (cropRatio === '4:5') r = 4 / 5;
        else if (cropRatio === '9:16') r = 9 / 16;
        else if (cropRatio === '16:9') r = 16 / 9;
        else if (cropRatio === '3:4') r = 3 / 4;
        else if (cropRatio === '4:3') r = 4 / 3;

        if (activeCropHandle === 'l' || activeCropHandle === 'r') {
          newH = Math.round(newW / r);
        } else {
          newW = Math.round(newH * r);
        }
      }

      cropRect.x = Math.max(0, newX);
      cropRect.y = Math.max(0, newY);
      cropRect.w = Math.min(displayWidth - cropRect.x, newW);
      cropRect.h = Math.min(displayHeight - cropRect.y, newH);
    }

    updateCropOverlayUI();
  }

  function handleCropDragEnd() {
    isDraggingCrop = false;
    activeCropHandle = null;
  }

  if (cropOverlayLayer) {
    cropOverlayLayer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleCropDragStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingCrop && e.touches.length === 1) {
        e.preventDefault();
        handleCropDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (isDraggingCrop) handleCropDragEnd();
    });

    cropOverlayLayer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleCropDragStart(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingCrop) {
        handleCropDragMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingCrop) handleCropDragEnd();
    });
  }

  // Quick Rotate & Flip Helpers
  function transformWorkingImage(transformFn) {
    if (!currentWorkingImage) return;
    saveImageState();

    const canvas = document.createElement('canvas');
    transformFn(canvas);
    currentWorkingImage = canvas;

    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;
    baseCtx.drawImage(canvas, 0, 0);

    cachedSubjectCutout = null;
    fitCanvasToCurrentViewport();
    if (activeTool === 'crop') applyCropRatioConstraint(cropRatio);
    updateUndoState();
  }

  if (btnCropRotateLeft) {
    btnCropRotateLeft.addEventListener('click', () => {
      transformWorkingImage((c) => {
        c.width = currentWorkingImage.height;
        c.height = currentWorkingImage.width;
        const ctx = c.getContext('2d');
        ctx.translate(0, c.height);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(currentWorkingImage, 0, 0);
      });
    });
  }

  if (btnCropRotateRight) {
    btnCropRotateRight.addEventListener('click', () => {
      transformWorkingImage((c) => {
        c.width = currentWorkingImage.height;
        c.height = currentWorkingImage.width;
        const ctx = c.getContext('2d');
        ctx.translate(c.width, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(currentWorkingImage, 0, 0);
      });
    });
  }

  if (btnCropFlipH) {
    btnCropFlipH.addEventListener('click', () => {
      transformWorkingImage((c) => {
        c.width = currentWorkingImage.width;
        c.height = currentWorkingImage.height;
        const ctx = c.getContext('2d');
        ctx.translate(c.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(currentWorkingImage, 0, 0);
      });
    });
  }

  if (btnApplyCrop) {
    btnApplyCrop.addEventListener('click', () => {
      if (!currentWorkingImage || !cropRect.w || !cropRect.h) return;

      const scaleX = currentWorkingImage.width / displayWidth;
      const scaleY = currentWorkingImage.height / displayHeight;

      const cropX = Math.max(0, Math.round(cropRect.x * scaleX));
      const cropY = Math.max(0, Math.round(cropRect.y * scaleY));
      const cropW = Math.max(10, Math.min(currentWorkingImage.width - cropX, Math.round(cropRect.w * scaleX)));
      const cropH = Math.max(10, Math.min(currentWorkingImage.height - cropY, Math.round(cropRect.h * scaleY)));

      saveImageState();

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const ctx = croppedCanvas.getContext('2d');
      ctx.drawImage(currentWorkingImage, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      currentWorkingImage = croppedCanvas;
      baseCanvas.width = cropW;
      baseCanvas.height = cropH;
      baseCtx.drawImage(croppedCanvas, 0, 0);

      cachedSubjectCutout = null;
      if (cropOverlayLayer) cropOverlayLayer.classList.add('hidden');

      fitCanvasToCurrentViewport();
      updateUndoState();
      switchStudioTool('erase');
      alert('✓ Photo cropped successfully!');
    });
  }

  if (btnCancelCrop) {
    btnCancelCrop.addEventListener('click', () => {
      if (cropOverlayLayer) cropOverlayLayer.classList.add('hidden');
      switchStudioTool('erase');
    });
  }

  if (btnSaveImageCrop) btnSaveImageCrop.addEventListener('click', exportImage);

  // ==========================================
  // 9. Hold-to-Compare Original Photo
  // ==========================================
  function showOriginal() {
    if (!pristineOriginalImage) return;
    isComparing = true;
    baseCtx.drawImage(pristineOriginalImage, 0, 0);
    originalBadge.classList.remove('hidden');
  }

  function showEdited() {
    if (!currentWorkingImage) return;
    isComparing = false;
    baseCtx.drawImage(currentWorkingImage, 0, 0);
    originalBadge.classList.add('hidden');
  }

  btnCompare.addEventListener('mousedown', showOriginal);
  btnCompare.addEventListener('touchstart', (e) => { e.preventDefault(); showOriginal(); }, { passive: false });
  window.addEventListener('mouseup', () => { if (isComparing) showEdited(); });
  window.addEventListener('touchend', () => { if (isComparing) showEdited(); });

  // ==========================================
  // 10. Advanced Export Studio Modal Engine
  // ==========================================
  const exportQualityModal = document.getElementById('exportQualityModal');
  const btnCloseExportModal = document.getElementById('btnCloseExportModal');
  const btnCancelExport = document.getElementById('btnCancelExport');
  const btnConfirmExport = document.getElementById('btnConfirmExport');
  const btnConfirmExportText = document.getElementById('btnConfirmExportText');
  const exportQualitySlider = document.getElementById('exportQualitySlider');
  const exportQualityLabel = document.getElementById('exportQualityLabel');
  const exportEstSize = document.getElementById('exportEstSize');
  const exportResLabel = document.getElementById('exportResLabel');
  const exportQualityBadge = document.getElementById('exportQualityBadge');
  const exportResLockToggle = document.getElementById('exportResLockToggle');
  const exportResLockGroup = document.getElementById('exportResLockGroup');
  const exportResLockDesc = document.getElementById('exportResLockDesc');
  const btnFmtJpg = document.getElementById('btnFmtJpg');
  const btnFmtPng = document.getElementById('btnFmtPng');
  const presetCompact = document.getElementById('presetCompact');
  const presetOriginal = document.getElementById('presetOriginal');
  const presetUpscale = document.getElementById('presetUpscale');

  // Discrete stepped quality values requested by user:
  // Compression: 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%, 100% (Original)
  // Upscaling: 130%, 170%, 200%
  const EXPORT_STEPS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 130, 170, 200];
  let exportFormat = 'jpeg'; // 'jpeg' or 'png'

  function openExportModal() {
    if (!currentWorkingImage || !baseCanvas.width) return;
    if (exportQualityModal) {
      exportQualityModal.classList.remove('hidden');
      updateExportEstimate();
    }
  }

  function closeExportModal() {
    if (exportQualityModal) exportQualityModal.classList.add('hidden');
  }

  function updateExportEstimate() {
    if (!currentWorkingImage || !baseCanvas.width) return;
    const idx = parseInt(exportQualitySlider.value, 10);
    const stepPct = EXPORT_STEPS[idx] !== undefined ? EXPORT_STEPS[idx] : 100;
    const isUpscale = stepPct > 100;
    const isLocked = exportResLockToggle && exportResLockToggle.checked && !isUpscale;

    // Sync active preset highlight
    if (presetCompact) presetCompact.classList.toggle('active', idx === 2);
    if (presetOriginal) presetOriginal.classList.toggle('active', idx === 8);
    if (presetUpscale) presetUpscale.classList.toggle('active', idx === 11);

    // Target Dimensions
    let scaleRatio = 1.0;
    if (isUpscale) {
      scaleRatio = stepPct / 100.0;
    } else {
      scaleRatio = isLocked ? 1.0 : (stepPct / 100.0);
    }

    const outW = Math.round(baseCanvas.width * scaleRatio);
    const outH = Math.round(baseCanvas.height * scaleRatio);
    exportResLabel.textContent = `${outW} × ${outH}`;

    // Dynamic Label & Badge
    if (isUpscale) {
      exportQualityLabel.textContent = `${stepPct}% (Real-ESRGAN + GFPGAN AI)`;
      exportQualityBadge.textContent = '2x AI Super-Res';
      exportQualityBadge.className = 'stat-badge upscale';
      if (exportResLockGroup) exportResLockGroup.classList.add('disabled');
      if (exportResLockDesc) exportResLockDesc.textContent = `Neural super-resolution enlarged to ${outW} × ${outH} px`;
    } else if (stepPct === 100) {
      exportQualityLabel.textContent = '100% (Original HD)';
      exportQualityBadge.textContent = '100% Original';
      exportQualityBadge.className = 'stat-badge';
      if (exportResLockGroup) exportResLockGroup.classList.remove('disabled');
      if (exportResLockDesc) exportResLockDesc.textContent = `Full dimensions preserved (${outW} × ${outH} px)`;
    } else {
      exportQualityLabel.textContent = `${stepPct}% (Compact)`;
      exportQualityBadge.textContent = isLocked ? `${stepPct}% Quality` : `${stepPct}% Scale`;
      exportQualityBadge.className = 'stat-badge compress';
      if (exportResLockGroup) exportResLockGroup.classList.remove('disabled');
      if (exportResLockDesc) exportResLockDesc.textContent = isLocked 
        ? `Full dimensions preserved (${outW} × ${outH} px)` 
        : `Dimensions downscaled to ${outW} × ${outH} px`;
    }

    // Real-time File Size Calculation
    const totalPixels = outW * outH;
    let estBytes = 0;
    if (exportFormat === 'png') {
      estBytes = Math.round(totalPixels * 1.85);
    } else {
      const q = isUpscale ? 0.96 : (isLocked ? Math.max(0.12, stepPct / 100.0) : 0.86);
      const bpp = Math.max(0.035, 0.42 * Math.pow(q, 1.75));
      estBytes = Math.round(totalPixels * bpp);
    }

    let sizeStr = '';
    if (estBytes >= 1024 * 1024) {
      sizeStr = `~${(estBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      sizeStr = `~${Math.round(estBytes / 1024)} KB`;
    }
    exportEstSize.textContent = sizeStr;
    btnConfirmExportText.textContent = `Save Photo to Gallery (${sizeStr})`;
  }

  let lastExportedDataUrl = null;
  let lastExportedFilename = 'inkerase_photo.jpg';

  async function triggerDownload(url, filename) {
    lastExportedDataUrl = url;
    lastExportedFilename = filename;
    let savedToDevice = false;

    // 1. Direct Native Android Gallery Save via Capacitor Media Plugin (Saves to MediaStore / Pictures)
    if (window.Capacitor && window.Capacitor.Plugins) {
      const plugins = window.Capacitor.Plugins;
      if (plugins.Media && plugins.Media.savePhoto) {
        try {
          console.log('[InkErase] Saving photo directly to Android Gallery via Media plugin...');
          await plugins.Media.savePhoto({
            path: url,
            album: 'InkErase'
          });
          savedToDevice = true;
          console.log('[InkErase] ✓ Photo saved directly to Android Gallery!');
        } catch (mediaErr) {
          console.warn('[InkErase] Media.savePhoto error, trying Filesystem fallback:', mediaErr);
        }
      }

      // If Media plugin errored, fallback to Filesystem plugin
      if (!savedToDevice && plugins.Filesystem && plugins.Filesystem.writeFile) {
        try {
          const base64Data = url.split(',')[1];
          await plugins.Filesystem.writeFile({
            path: `Pictures/${filename}`,
            data: base64Data,
            directory: 'DOCUMENTS',
            recursive: true
          });
          savedToDevice = true;
          console.log('[InkErase] ✓ Photo written to device storage!');
        } catch (fsErr) {
          console.warn('[InkErase] Filesystem write error:', fsErr);
        }
      }
    }

    // 2. Mobile Web Share API fallback (Allows user to tap "Save to device / Photos" or send to WhatsApp/Instagram)
    if (!savedToDevice && navigator.canShare) {
      try {
        const parts = url.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const file = new File([blob], filename, { type: mime });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'InkErase Clean Photo',
            text: 'Edited with InkErase AI'
          });
          savedToDevice = true;
        }
      } catch (shareErr) {
        if (shareErr.name !== 'AbortError') {
          console.warn('[InkErase] Web Share fallback error:', shareErr);
        } else {
          savedToDevice = true;
        }
      }
    }

    // 3. Desktop Browser Link Download Fallback (<a download>)
    if (!savedToDevice) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async function performFinalExport() {
    if (!currentWorkingImage || !baseCanvas.width) return;
    const idx = parseInt(exportQualitySlider.value, 10);
    const stepPct = EXPORT_STEPS[idx] !== undefined ? EXPORT_STEPS[idx] : 100;
    const isUpscale = stepPct > 100;
    const isLocked = exportResLockToggle && exportResLockToggle.checked && !isUpscale;

    const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
    const ext = exportFormat === 'png' ? 'png' : 'jpg';

    if (isUpscale) {
      // True Neural Super-Resolution via Real-ESRGAN + GFPGAN
      try {
        if (processingOverlay) {
          processingOverlay.classList.remove('hidden');
          processStatusTitle.textContent = "AI Super-Resolution Active...";
          processStatusSub.textContent = "Enhancing textures & facial details with Real-ESRGAN + GFPGAN";
          if (progressFill) progressFill.style.width = "45%";
        }

        const baseB64 = baseCanvas.toDataURL('image/jpeg', 0.95);
        const upscaledB64 = await callCloudAi('upscale', [baseB64, 'true'], '/api/upscale', { image: baseB64, face_enhance: true }, 60000);

        if (upscaledB64 && !upscaledB64.startsWith('ERROR:')) {
          if (progressFill) progressFill.style.width = "100%";
          const upscaledImg = new Image();
          await new Promise((resolve) => {
            upscaledImg.onload = resolve;
            upscaledImg.src = upscaledB64;
          });

            const scaleRatio = stepPct / 100.0;
            const targetW = Math.round(baseCanvas.width * scaleRatio);
            const targetH = Math.round(baseCanvas.height * scaleRatio);

            const expCanvas = document.createElement('canvas');
            expCanvas.width = targetW;
            expCanvas.height = targetH;
            const expCtx = expCanvas.getContext('2d');
            expCtx.imageSmoothingEnabled = true;
            expCtx.imageSmoothingQuality = 'high';
            expCtx.drawImage(upscaledImg, 0, 0, targetW, targetH);

            const downloadUrl = expCanvas.toDataURL(mimeType, 0.98);
            await triggerDownload(downloadUrl, `inkerase_ai_upscale_${stepPct}pct_${Date.now()}.${ext}`);

            await autoSaveCurrentDraft();

            if (processingOverlay) processingOverlay.classList.add('hidden');
            closeExportModal();
            if (saveSuccessModal) saveSuccessModal.classList.remove('hidden');
            return;
          }
      } catch (err) {
        console.warn('[AI Upscale] Neural backend fallback to bicubic:', err);
      } finally {
        if (processingOverlay) processingOverlay.classList.add('hidden');
      }
    }

    // Standard High-Quality Export (<= 100% or offline fallback)
    let scaleRatio = 1.0;
    let jpegQuality = 0.95;

    if (isUpscale) {
      scaleRatio = stepPct / 100.0;
      jpegQuality = 0.96;
    } else {
      if (isLocked) {
        scaleRatio = 1.0;
        jpegQuality = Math.max(0.15, stepPct / 100.0);
      } else {
        scaleRatio = Math.max(0.2, stepPct / 100.0);
        jpegQuality = 0.88;
      }
    }

    const outW = Math.round(baseCanvas.width * scaleRatio);
    const outH = Math.round(baseCanvas.height * scaleRatio);

    const expCanvas = document.createElement('canvas');
    expCanvas.width = outW;
    expCanvas.height = outH;
    const expCtx = expCanvas.getContext('2d');
    expCtx.imageSmoothingEnabled = true;
    expCtx.imageSmoothingQuality = 'high';
    expCtx.drawImage(baseCanvas, 0, 0, outW, outH);

    const dataUrl = expCanvas.toDataURL(mimeType, jpegQuality);
    await triggerDownload(dataUrl, `inkerase_studio_${stepPct}pct_${Date.now()}.${ext}`);

    await autoSaveCurrentDraft();

    closeExportModal();
    if (saveSuccessModal) saveSuccessModal.classList.remove('hidden');
  }

  if (exportQualitySlider) exportQualitySlider.addEventListener('input', updateExportEstimate);
  if (exportResLockToggle) exportResLockToggle.addEventListener('change', updateExportEstimate);
  if (btnCloseExportModal) btnCloseExportModal.addEventListener('click', closeExportModal);
  if (btnCancelExport) btnCancelExport.addEventListener('click', closeExportModal);
  if (btnConfirmExport) btnConfirmExport.addEventListener('click', performFinalExport);

  if (presetCompact) {
    presetCompact.addEventListener('click', () => {
      exportQualitySlider.value = 2; // 40% Compact
      updateExportEstimate();
    });
  }
  if (presetOriginal) {
    presetOriginal.addEventListener('click', () => {
      exportQualitySlider.value = 8; // 100% Original HD
      updateExportEstimate();
    });
  }
  if (presetUpscale) {
    presetUpscale.addEventListener('click', () => {
      exportQualitySlider.value = 11; // 200% Ultra HD
      updateExportEstimate();
    });
  }

  if (btnFmtJpg && btnFmtPng) {
    btnFmtJpg.addEventListener('click', () => {
      exportFormat = 'jpeg';
      btnFmtJpg.classList.add('active');
      btnFmtPng.classList.remove('active');
      updateExportEstimate();
    });
    btnFmtPng.addEventListener('click', () => {
      exportFormat = 'png';
      btnFmtPng.classList.add('active');
      btnFmtJpg.classList.remove('active');
      updateExportEstimate();
    });
  }

  function exportImage() {
    openExportModal();
  }

  // Connect all Save triggers across the studio to the Export Studio Modal
  btnSaveImage.addEventListener('click', openExportModal);
  btnSaveImageBg.addEventListener('click', openExportModal);
  btnSaveImageBrush.addEventListener('click', openExportModal);
  if (btnSaveImageSmooth) btnSaveImageSmooth.addEventListener('click', openExportModal);
  if (btnSaveImageAdjust) btnSaveImageAdjust.addEventListener('click', openExportModal);
  if (btnSaveImageText) btnSaveImageText.addEventListener('click', openExportModal);
  if (btnSaveImageCanvas) btnSaveImageCanvas.addEventListener('click', openExportModal);
  if (btnSaveImageCrop) btnSaveImageCrop.addEventListener('click', openExportModal);

  // ==========================================
  // 11. IndexedDB Drafts & Project Storage Engine
  // ==========================================
  const DB_NAME = 'InkEraseDraftsDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'drafts';

  const homeDraftsSection = document.getElementById('homeDraftsSection');
  const homeDraftsList = document.getElementById('homeDraftsList');
  const homeDraftsCount = document.getElementById('homeDraftsCount');
  const btnOpenAllDrafts = document.getElementById('btnOpenAllDrafts');
  const btnHeaderDrafts = document.getElementById('btnHeaderDrafts');
  const headerDraftsCount = document.getElementById('headerDraftsCount');
  const draftsModal = document.getElementById('draftsModal');
  const btnCloseDraftsModal = document.getElementById('btnCloseDraftsModal');
  const draftsModalList = document.getElementById('draftsModalList');
  const draftsModalSub = document.getElementById('draftsModalSub');
  const btnModalViewDrafts = document.getElementById('btnModalViewDrafts');

  function openDraftsDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveDraftToDB(draftObj) {
    try {
      const db = await openDraftsDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(draftObj);
        tx.oncomplete = () => resolve(draftObj);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[Drafts] saveDraftToDB failed:', e);
    }
  }

  async function getAllDraftsFromDB() {
    try {
      const db = await openDraftsDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const drafts = (req.result || []).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          resolve(drafts);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[Drafts] getAllDraftsFromDB failed:', e);
      return [];
    }
  }

  async function deleteDraftFromDB(id) {
    try {
      const db = await openDraftsDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[Drafts] deleteDraftFromDB failed:', e);
    }
  }

  async function autoSaveCurrentDraft() {
    if (!currentWorkingImage || !baseCanvas.width) return;
    try {
      const now = new Date();
      const id = `draft_${now.getTime()}`;
      const dateStr = now.toLocaleDateString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });

      // 1. Create compact 240px thumbnail
      const thumbCanvas = document.createElement('canvas');
      const scale = Math.min(240 / baseCanvas.width, 240 / baseCanvas.height);
      thumbCanvas.width = Math.max(1, Math.round(baseCanvas.width * scale));
      thumbCanvas.height = Math.max(1, Math.round(baseCanvas.height * scale));
      const thumbCtx = thumbCanvas.getContext('2d');
      thumbCtx.drawImage(baseCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      const thumbB64 = thumbCanvas.toDataURL('image/jpeg', 0.85);

      // 2. Full Working Image & Pristine Original
      const workingData = baseCanvas.toDataURL('image/jpeg', 0.95);
      let originalData = workingData;
      if (pristineOriginalImage) {
        const origCanvas = document.createElement('canvas');
        origCanvas.width = pristineOriginalImage.width;
        origCanvas.height = pristineOriginalImage.height;
        const origCtx = origCanvas.getContext('2d');
        origCtx.drawImage(pristineOriginalImage, 0, 0);
        originalData = origCanvas.toDataURL('image/jpeg', 0.95);
      }

      const draft = {
        id,
        timestamp: now.getTime(),
        dateStr,
        width: baseCanvas.width,
        height: baseCanvas.height,
        thumbnail: thumbB64,
        workingImageData: workingData,
        originalImageData: originalData
      };

      await saveDraftToDB(draft);
      console.log('[Drafts] Auto-saved project draft:', id);
      renderAllDraftsUI();
    } catch (err) {
      console.warn('[Drafts] Auto-save error:', err);
    }
  }

  window.loadDraftById = async function(id) {
    const drafts = await getAllDraftsFromDB();
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;

    try {
      if (processingOverlay) {
        processingOverlay.classList.remove('hidden');
        processStatusTitle.textContent = "Loading Project Draft...";
        processStatusSub.textContent = `Restoring ${draft.width} × ${draft.height} photo`;
      }

      const workImg = new Image();
      await new Promise((resolve, reject) => {
        workImg.onload = resolve;
        workImg.onerror = reject;
        workImg.src = draft.workingImageData;
      });

      if (draft.originalImageData) {
        const origImg = new Image();
        await new Promise((resolve) => {
          origImg.onload = () => {
            pristineOriginalImage = origImg;
            resolve();
          };
          origImg.onerror = resolve;
          origImg.src = draft.originalImageData;
        });
      }

      currentWorkingImage = workImg;
      baseCanvas.width = workImg.width;
      baseCanvas.height = workImg.height;
      baseCtx.drawImage(workImg, 0, 0);

      maskCanvas.width = workImg.width;
      maskCanvas.height = workImg.height;
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      cursorCanvas.width = workImg.width;
      cursorCanvas.height = workImg.height;
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      undoStack = [];
      redoStack = [];
      saveImageState();

      emptyState.classList.add('hidden');
      editorView.classList.remove('hidden');
      bottomBar.classList.remove('hidden');
      btnNewImage.classList.remove('hidden');

      fitCanvasToCurrentViewport();
      switchStudioTool('erase');
      closeDraftsModal();
    } catch (err) {
      alert('Error opening draft: ' + err.message);
    } finally {
      if (processingOverlay) processingOverlay.classList.add('hidden');
    }
  };

  window.deleteDraftById = async function(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('Are you sure you want to delete this draft?')) return;
    await deleteDraftFromDB(id);
    renderAllDraftsUI();
  };

  function openDraftsModal() {
    if (draftsModal) {
      draftsModal.classList.remove('hidden');
      renderAllDraftsUI();
    }
  }

  function closeDraftsModal() {
    if (draftsModal) draftsModal.classList.add('hidden');
  }

  async function renderAllDraftsUI() {
    const drafts = await getAllDraftsFromDB();
    const count = drafts.length;

    // 1. Header Count Pill
    if (headerDraftsCount) {
      if (count > 0) {
        headerDraftsCount.textContent = count;
        headerDraftsCount.classList.remove('hidden');
      } else {
        headerDraftsCount.classList.add('hidden');
      }
    }

    // 2. Home Screen Section
    if (homeDraftsSection && homeDraftsList && homeDraftsCount) {
      if (count > 0) {
        homeDraftsCount.textContent = `${count} saved`;
        homeDraftsSection.classList.remove('hidden');
        homeDraftsList.innerHTML = drafts.slice(0, 8).map(d => `
          <div class="home-draft-card" onclick="loadDraftById('${d.id}')">
            <img src="${d.thumbnail}" alt="Draft thumbnail" class="home-draft-thumb">
            <div class="home-draft-info">
              <span class="home-draft-date">${d.dateStr}</span>
              <span class="home-draft-dim">${d.width} × ${d.height} px</span>
            </div>
          </div>
        `).join('');
      } else {
        homeDraftsSection.classList.add('hidden');
      }
    }

    // 3. Modal List
    if (draftsModalList) {
      if (draftsModalSub) {
        draftsModalSub.textContent = count > 0 
          ? `${count} saved photo project${count > 1 ? 's' : ''}` 
          : 'Open previous photos to continue editing';
      }

      if (count === 0) {
        draftsModalList.innerHTML = `
          <div class="drafts-empty-notice">
            <div class="drafts-empty-icon">📁</div>
            <h4>No Saved Drafts Yet</h4>
            <p>Whenever you edit and save a photo, your project draft will be stored here automatically so you can resume anytime!</p>
          </div>
        `;
      } else {
        draftsModalList.innerHTML = drafts.map(d => `
          <div class="draft-card" data-id="${d.id}">
            <div class="draft-thumb-wrapper" onclick="loadDraftById('${d.id}')">
              <img src="${d.thumbnail}" alt="Draft thumbnail" class="draft-thumb-img">
              <div class="draft-play-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                <span>Edit</span>
              </div>
            </div>
            <div class="draft-card-footer">
              <div class="draft-meta">
                <span class="draft-date">${d.dateStr}</span>
                <span class="draft-res">${d.width} × ${d.height} px</span>
              </div>
              <button type="button" class="btn-del-draft" title="Delete Draft" onclick="deleteDraftById('${d.id}', event)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Event Listeners for Drafts
  if (btnHeaderDrafts) btnHeaderDrafts.addEventListener('click', openDraftsModal);
  if (btnOpenAllDrafts) btnOpenAllDrafts.addEventListener('click', openDraftsModal);
  if (btnCloseDraftsModal) btnCloseDraftsModal.addEventListener('click', closeDraftsModal);
  if (btnModalViewDrafts) {
    btnModalViewDrafts.addEventListener('click', () => {
      if (saveSuccessModal) saveSuccessModal.classList.add('hidden');
      openDraftsModal();
    });
  }

  // Initial load of drafts from IndexedDB on app startup
  renderAllDraftsUI();

})();
