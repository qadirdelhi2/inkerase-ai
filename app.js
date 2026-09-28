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

  // Tool Panels
  const panelErase = document.getElementById('panelErase');
  const panelBgBlur = document.getElementById('panelBgBlur');
  const panelBrushBlur = document.getElementById('panelBrushBlur');
  const panelSkinSmooth = document.getElementById('panelSkinSmooth');
  const panelAdjust = document.getElementById('panelAdjust');

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

  // Canvas Contexts
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  const cursorCtx = cursorCanvas.getContext('2d');

  // State Management
  let activeTool = 'erase';         // 'erase' | 'bgblur' | 'brushblur' | 'skinsmooth' | 'adjust' | 'text'
  let pristineOriginalImage = null; // Unaltered original for compare
  let currentWorkingImage = null;   // Active baked image
  let imageHistory = [];            // Undo stack for image commits
  let maskStrokeHistory = [];       // Undo stack for red tattoo strokes
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
  let textString = 'Summer Vibes';
  let textFont = 'Inter';
  let textSize = 38;
  let textOpacity = 1.0;
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
  // Dynamic Endpoint Resolver for Web & APK compatibility
  let CLOUD_TUNNEL_URL = 'https://administered-volt-thoughts-submissions.trycloudflare.com';
  const GITHUB_ENDPOINT_URL = 'https://raw.githubusercontent.com/qadirdelhi2/inkerase-ai/master/endpoint.json';

  async function syncBackendEndpoint() {
    try {
      const res = await fetch(GITHUB_ENDPOINT_URL, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          CLOUD_TUNNEL_URL = data.url.replace(/\/+$/, '');
          console.log('[InkErase] Active AI backend synced from cloud:', CLOUD_TUNNEL_URL);
        }
      }
    } catch (e) {
      console.warn('[InkErase] Cloud sync fallback to active preset:', CLOUD_TUNNEL_URL);
    }
  }
  syncBackendEndpoint();

  function getApiEndpoint(path) {
    // In local desktop browser testing (http://127.0.0.1:8080 or http://localhost:8080)
    if ((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && window.location.port === '8080') {
      return path;
    }
    // If accessed through the cloud tunnel web page directly
    if (window.location.origin === CLOUD_TUNNEL_URL) {
      return path;
    }
    // In native Android APK (https://localhost, capacitor://, file://, etc.) or external network
    return `${CLOUD_TUNNEL_URL}${path}`;
  }

  gpuStatusText.textContent = '⚡ Studio AI Active';

  // ==========================================
  // 1. Tool Switching & Tab Navigation
  // ==========================================
  function switchStudioTool(tool) {
    if (activeTool === tool) return;

    // If leaving bgblur or adjust without applying, restore previous working image
    if ((activeTool === 'bgblur' || activeTool === 'adjust') && currentWorkingImage) {
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(currentWorkingImage, 0, 0);
      if (activeTool === 'adjust') resetAdjustSliders();
    }

    activeTool = tool;

    // Update Tab UI
    tabErase.classList.toggle('active', tool === 'erase');
    tabBgBlur.classList.toggle('active', tool === 'bgblur');
    tabBrushBlur.classList.toggle('active', tool === 'brushblur');
    tabSkinSmooth.classList.toggle('active', tool === 'skinsmooth');
    tabAdjust.classList.toggle('active', tool === 'adjust');
    if (tabText) tabText.classList.toggle('active', tool === 'text');

    // Update Panels
    panelErase.classList.toggle('hidden', tool !== 'erase');
    panelBgBlur.classList.toggle('hidden', tool !== 'bgblur');
    panelBrushBlur.classList.toggle('hidden', tool !== 'brushblur');
    panelSkinSmooth.classList.toggle('hidden', tool !== 'skinsmooth');
    panelAdjust.classList.toggle('hidden', tool !== 'adjust');
    if (panelText) panelText.classList.toggle('hidden', tool !== 'text');

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

  // ==========================================
  // 2. Navigation & New Photo Selection
  // ==========================================
  btnNewImage.addEventListener('click', () => imageInput.click());
  btnModalNewImage.addEventListener('click', () => {
    saveSuccessModal.classList.add('hidden');
    imageInput.click();
  });
  btnModalStay.addEventListener('click', () => saveSuccessModal.classList.add('hidden'));

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => initializeWorkspace(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    imageInput.value = '';
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
    cachedSubjectMask = null;
    blurSourceCanvas = null;

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

    const minPanX = vWidth - curW - 40;
    const maxPanX = 40;
    const minPanY = vHeight - curH - 40;
    const maxPanY = 40;

    if (curW > vWidth) {
      panX = Math.min(maxPanX, Math.max(minPanX, panX));
    } else {
      panX = (vWidth - curW) / 2;
    }

    if (curH > vHeight) {
      panY = Math.min(maxPanY, Math.max(minPanY, panY));
    } else {
      panY = (vHeight - curH) / 2;
    }
  }

  // Multi-Touch Pinch Zoom + Auto-Centering
  canvasViewport.addEventListener('touchstart', (e) => {
    const now = Date.now();
    if (e.touches.length === 1 && now - lastTapTime < 280) {
      resetTransform();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;

    if (e.touches.length === 2) {
      isDrawing = false;
      isPinching = true;
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      startPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      startScale = scale;
      startPanX = panX;
      startPanY = panY;
      pinchMidpoint = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    } else if (e.touches.length === 1 && !isPinching) {
      if (activeTool !== 'text') e.preventDefault();
      startInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  canvasViewport.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };

      if (startPinchDist > 0) {
        const factor = dist / startPinchDist;
        let newScale = startScale * factor;

        if (newScale <= 1.05) {
          scale = 1.0;
          panX = defaultPanX;
          panY = defaultPanY;
          updateTransform();
          return;
        }

        newScale = Math.min(8.0, newScale);
        panX = startPanX + (currentMid.x - pinchMidpoint.x);
        panY = startPanY + (currentMid.y - pinchMidpoint.y);
        scale = newScale;

        clampPan(canvasViewport.clientWidth, canvasViewport.clientHeight);
        updateTransform();
      }
    } else if (!isPinching && isDrawing && e.touches.length === 1) {
      e.preventDefault();
      moveInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  canvasViewport.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      isPinching = false;
      if (scale <= 1.08) {
        resetTransform();
      }
    }
    if (e.touches.length === 0) {
      stopInteraction();
    }
  });

  // Desktop Mouse Events
  canvasWrapper.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      startInteraction(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mousemove', (e) => {
    moveInteraction(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
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
  function startInteraction(clientX, clientY) {
    if (!currentWorkingImage || isComparing) return;
    if (activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'text') return;

    const coords = getCanvasCoords(clientX, clientY);
    lastX = coords.x;
    lastY = coords.y;
    isDrawing = true;

    let activeRadius = eraseBrushRadius;
    if (activeTool === 'brushblur') activeRadius = manualBrushRadius;
    else if (activeTool === 'skinsmooth') activeRadius = skinSmoothRadius;
    drawCursor(coords.x, coords.y, activeRadius);

    if (activeTool === 'erase') {
      saveMaskStroke();
      drawEraseStroke(lastX, lastY, lastX, lastY);
    } else if (activeTool === 'brushblur') {
      saveImageState();
      prepareBlurSource();
      drawManualBlurDab(lastX, lastY);
    } else if (activeTool === 'skinsmooth') {
      saveImageState();
      prepareSmoothSource();
      drawSkinSmoothDab(lastX, lastY);
    }
  }

  function moveInteraction(clientX, clientY) {
    if (activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'text') {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      return;
    }

    const coords = getCanvasCoords(clientX, clientY);

    // Update cursor circle
    let activeRadius = eraseBrushRadius;
    if (activeTool === 'brushblur') activeRadius = manualBrushRadius;
    else if (activeTool === 'skinsmooth') activeRadius = skinSmoothRadius;

    drawCursor(coords.x, coords.y, activeRadius);

    if (!isDrawing || !currentWorkingImage || isComparing) return;

    if (activeTool === 'erase') {
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
  }

  function stopInteraction() {
    if (!isDrawing) return;
    isDrawing = false;
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

  function drawCursor(x, y, radius) {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    if (activeTool === 'bgblur' || activeTool === 'adjust' || activeTool === 'text') return;

    const sf = getScaleFactor();
    const canvasR = radius * sf;

    cursorCtx.save();
    cursorCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    cursorCtx.shadowBlur = 6 * sf;

    // Outer boundary ring
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, canvasR, 0, Math.PI * 2);
    if (activeTool === 'skinsmooth') {
      cursorCtx.strokeStyle = 'rgba(251, 191, 36, 1.0)';
    } else if (activeTool === 'brushblur') {
      cursorCtx.strokeStyle = 'rgba(56, 189, 248, 1.0)';
    } else {
      cursorCtx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    }
    cursorCtx.lineWidth = Math.max(3 * sf, 3);
    cursorCtx.stroke();

    // Center precision dot
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, Math.max(2.5 * sf, 2.5), 0, Math.PI * 2);
    cursorCtx.fillStyle = cursorCtx.strokeStyle;
    cursorCtx.fill();

    // If blur brush or skin smooth, draw inner dotted circle showing feather core
    if (activeTool === 'brushblur' || activeTool === 'skinsmooth') {
      const featherVal = (activeTool === 'skinsmooth') ? skinSmoothFeather : manualBrushFeather;
      const innerRadius = Math.max(1, canvasR * (1.0 - featherVal / 100.0));
      cursorCtx.beginPath();
      cursorCtx.arc(x, y, innerRadius, 0, Math.PI * 2);
      cursorCtx.setLineDash([4 * sf, 4 * sf]);
      cursorCtx.strokeStyle = (activeTool === 'skinsmooth') ? 'rgba(251, 191, 36, 0.85)' : 'rgba(56, 189, 248, 0.85)';
      cursorCtx.lineWidth = Math.max(2 * sf, 2);
      cursorCtx.stroke();
      cursorCtx.setLineDash([]);
    }
    cursorCtx.restore();
  }

  // --- Tool 1: Tattoo Mask Drawing ---
  function drawEraseStroke(x1, y1, x2, y2) {
    const sf = getScaleFactor();
    maskCtx.strokeStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.fillStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.lineWidth = eraseBrushRadius * sf * 2;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    maskCtx.beginPath();
    maskCtx.moveTo(x1, y1);
    maskCtx.lineTo(x2, y2);
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
    const R = Math.max(4, manualBrushRadius * sf);
    const D = Math.ceil(R * 2);
    if (D < 2) return;

    if (dabCanvas.width !== D || dabCanvas.height !== D) {
      dabCanvas.width = D;
      dabCanvas.height = D;
    } else {
      dabCtx.clearRect(0, 0, D, D);
    }

    // 1. Draw blurred slice from blurSourceCanvas with translation
    dabCtx.save();
    dabCtx.translate(-(x - R), -(y - R));
    dabCtx.drawImage(blurSourceCanvas, 0, 0);
    dabCtx.restore();

    // 2. Feather mask using radial gradient (destination-in)
    dabCtx.globalCompositeOperation = 'destination-in';
    const innerRadius = Math.max(0, R * (1.0 - manualBrushFeather / 100.0));
    const grad = dabCtx.createRadialGradient(R, R, innerRadius, R, R, R);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    dabCtx.fillStyle = grad;
    dabCtx.fillRect(0, 0, D, D);
    dabCtx.globalCompositeOperation = 'source-over';

    // 3. Composite feathered dab onto base canvas with rich smooth flow
    baseCtx.save();
    baseCtx.globalAlpha = 0.50;
    baseCtx.drawImage(dabCanvas, x - R, y - R);
    baseCtx.restore();
  }

  function drawManualBlurStroke(x1, y1, x2, y2) {
    const sf = getScaleFactor();
    const R = Math.max(4, manualBrushRadius * sf);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(2, R * 0.18);
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

  async function extractSubjectMask() {
    if (isExtractingMask || !currentWorkingImage) return;
    isExtractingMask = true;

    showProgress(true, 'Detecting Subject...', 'AI isolating person for portrait depth-of-field...', 30);

    try {
      // High-speed optimization: Pre-scale image to max 1024px for quick ~200KB upload
      const maxDim = 1024;
      const w = baseCanvas.width;
      const h = baseCanvas.height;
      const s = Math.min(1.0, maxDim / Math.max(w, h));
      const fastCanvas = document.createElement('canvas');
      fastCanvas.width = Math.max(1, Math.round(w * s));
      fastCanvas.height = Math.max(1, Math.round(h * s));
      const fCtx = fastCanvas.getContext('2d');
      fCtx.drawImage(baseCanvas, 0, 0, fastCanvas.width, fastCanvas.height);
      const imgB64 = fastCanvas.toDataURL('image/jpeg', 0.88);

      progressFill.style.width = '65%';

      const res = await fetch(getApiEndpoint('/api/segment_subject'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgB64 })
      });

      if (!res.ok) throw new Error('Segmentation failed with status ' + res.status);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to detect subject');

      progressFill.style.width = '90%';

      // Load transparent cutout image
      await new Promise((resolve, reject) => {
        const cutoutImg = new Image();
        cutoutImg.onload = () => {
          cachedSubjectCutout = cutoutImg;
          resolve();
        };
        cutoutImg.onerror = reject;
        cutoutImg.src = data.cutout;
      });

      showProgress(false);
    } catch (err) {
      console.error('Mask extraction error:', err);
      showProgress(false);
      alert('Could not detect subject automatically: ' + err.message);
    } finally {
      isExtractingMask = false;
    }
  }

  function renderLiveBokeh() {
    if (!currentWorkingImage || !cachedSubjectCutout) return;

    const blurPx = parseInt(bgBlurDensityInput.value, 10);
    const featherPx = bgBlurFeatherInput ? parseInt(bgBlurFeatherInput.value, 10) : 8;

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

    // 3. Create the feathered subject using original photo's genuine colors
    const subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = w;
    subjectCanvas.height = h;
    const sCtx = subjectCanvas.getContext('2d');

    if (featherPx > 0) {
      // Gaussian blur the pure mask to create smooth feathered boundary
      sCtx.filter = `blur(${featherPx}px)`;
      sCtx.drawImage(maskCanvas, 0, 0);
      sCtx.filter = 'none';

      // Stamp original photo's true colors into the feathered silhouette (zero dark fringe!)
      sCtx.globalCompositeOperation = 'source-in';
      sCtx.drawImage(currentWorkingImage, 0, 0);
      sCtx.globalCompositeOperation = 'source-over';
    } else {
      // Crisp boundary without feather
      sCtx.drawImage(maskCanvas, 0, 0);
      sCtx.globalCompositeOperation = 'source-in';
      sCtx.drawImage(currentWorkingImage, 0, 0);
      sCtx.globalCompositeOperation = 'source-over';
    }

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
      let desc = 'Natural';
      if (val === 0) desc = 'Sharp';
      else if (val <= 4) desc = 'Crisp';
      else if (val <= 12) desc = 'Natural';
      else desc = 'Silky Soft';
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

    updateUndoState();
    alert('✓ Background blur applied successfully!');
  });

  btnCancelBgBlur.addEventListener('click', () => {
    if (currentWorkingImage) {
      baseCtx.drawImage(currentWorkingImage, 0, 0);
      bgBlurDensityInput.value = 16;
      bgBlurDensityVal.textContent = '16px (Medium Bokeh)';
      if (bgBlurFeatherInput) {
        bgBlurFeatherInput.value = 8;
        bgBlurFeatherVal.textContent = '8px (Natural)';
      }
    }
  });

  // ==========================================
  // 6. Tool 4: Skin Smooth Drawing (Wrinkles & Cellulite Softener)
  // ==========================================
  function prepareSmoothSource() {
    if (!currentWorkingImage) return;
    smoothSourceCanvas = document.createElement('canvas');
    smoothSourceCanvas.width = baseCanvas.width;
    smoothSourceCanvas.height = baseCanvas.height;
    const sCtx = smoothSourceCanvas.getContext('2d');
    sCtx.filter = `blur(${skinSmoothStrength}px)`;
    sCtx.drawImage(currentWorkingImage, 0, 0);
  }

  function drawSkinSmoothDab(x, y) {
    if (!smoothSourceCanvas) return;
    const sf = getScaleFactor();
    const R = Math.max(4, skinSmoothRadius * sf);
    const D = Math.ceil(R * 2);
    if (D < 2) return;

    if (dabCanvas.width !== D || dabCanvas.height !== D) {
      dabCanvas.width = D;
      dabCanvas.height = D;
    } else {
      dabCtx.clearRect(0, 0, D, D);
    }

    // 1. Draw smoothed slice from smoothSourceCanvas with translation
    dabCtx.save();
    dabCtx.translate(-(x - R), -(y - R));
    dabCtx.drawImage(smoothSourceCanvas, 0, 0);
    dabCtx.restore();

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
    baseCtx.drawImage(dabCanvas, x - R, y - R);
    baseCtx.restore();
  }

  function drawSkinSmoothStroke(x1, y1, x2, y2) {
    const sf = getScaleFactor();
    const R = Math.max(4, skinSmoothRadius * sf);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(2, R * 0.18);
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
    const b = 100 + adjustBrightness;
    const c = 100 + adjustContrast;
    const s = Math.max(0, 100 + adjustSaturation);
    let warmthPart = '';

    if (adjustWarmth > 0) {
      // Warm golden sun-kissed tone
      warmthPart = ` sepia(${adjustWarmth * 0.45}%) saturate(${100 + adjustWarmth * 0.2}%)`;
    } else if (adjustWarmth < 0) {
      // Cool oceanic / twilight tone
      warmthPart = ` hue-rotate(${adjustWarmth * 0.35}deg)`;
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
    textBoxElement.style.color = textColor;
    textBoxElement.style.opacity = textOpacity;

    // Effect Classes
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

    const clampW = displayWidth || 400;
    const clampH = displayHeight || 400;
    textDisplayX = Math.max(10, Math.min(clampW - 10, dragStartTextX + dx));
    textDisplayY = Math.max(10, Math.min(clampH - 10, dragStartTextY + dy));

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

  // Font Selection Carousel Chips
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

  // Color Swatches & Native Color Picker
  const colorSwatches = panelText ? panelText.querySelectorAll('.color-swatch') : [];
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

  // Size & Opacity Sliders
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

  // Reset Text Settings
  function resetTextSettings() {
    textString = 'Summer Vibes';
    if (textStudioInput) textStudioInput.value = textString;
    textFont = 'Inter';
    textSize = 38;
    textOpacity = 1.0;
    textColor = '#ffffff';
    textBold = false;
    textItalic = false;
    textUnderline = false;
    textAlign = 'center';
    textEffect = 'none';

    if (activeFontTag) activeFontTag.textContent = 'Inter';
    if (activeColorTag) activeColorTag.textContent = '#FFFFFF';
    if (textSizeSlider) textSizeSlider.value = 38;
    if (textSizeVal) textSizeVal.textContent = '38px';
    if (textOpacitySlider) textOpacitySlider.value = 100;
    if (textOpacityVal) textOpacityVal.textContent = '100%';
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
    bCtx.globalAlpha = textOpacity;

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

    // Badge / Box background effect
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

      bCtx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      bCtx.beginPath();
      if (bCtx.roundRect) {
        bCtx.roundRect(boxX, boxY, boxW, boxH, 14 * ratio);
      } else {
        bCtx.rect(boxX, boxY, boxW, boxH);
      }
      bCtx.fill();
    }

    // Effect styling: Outline or Shadows
    if (textEffect === 'border') {
      bCtx.strokeStyle = '#000000';
      bCtx.lineWidth = Math.max(3, Math.round(3.5 * ratio));
      bCtx.lineJoin = 'round';
      textLines.forEach((line, idx) => {
        const lineY = startY + (idx * lineHeight);
        bCtx.strokeText(line, realX, lineY);
      });
    } else if (textEffect === 'shadow') {
      bCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      bCtx.shadowBlur = Math.round(14 * ratio);
      bCtx.shadowOffsetX = 0;
      bCtx.shadowOffsetY = Math.round(4 * ratio);
    } else if (textEffect === 'glow') {
      bCtx.shadowColor = textColor;
      bCtx.shadowBlur = Math.round(22 * ratio);
    }

    // Draw text fill
    bCtx.fillStyle = textColor;
    textLines.forEach((line, idx) => {
      const lineY = startY + (idx * lineHeight);
      bCtx.fillText(line, realX, lineY);
    });

    // Underline
    if (textUnderline) {
      bCtx.strokeStyle = textColor;
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
  // 7. Fast Neural Inpainting (Tattoo Erase)
  // ==========================================
  btnEraseTattoo.addEventListener('click', async () => {
    if (!currentWorkingImage) return;

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    let hasMask = false;
    for (let i = 3; i < maskData.length; i += 16) {
      if (maskData[i] > 20) {
        hasMask = true;
        break;
      }
    }

    if (!hasMask) {
      alert('Please use the brush to highlight the tattoo spots you want to remove.');
      return;
    }

    showProgress(true, 'Erasing Tattoos...', 'Processing tattoo clusters with high-resolution skin synthesis...', 35);

    try {
      saveImageState();

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

      const response = await fetch(getApiEndpoint('/api/inpaint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, mask: maskBase64 })
      });

      if (!response.ok) throw new Error('Server error ' + response.status);
      const resJson = await response.json();
      if (!resJson.success) throw new Error(resJson.error || 'Inpainting failed');

      progressFill.style.width = '95%';

      const cleanImg = new Image();
      cleanImg.onload = () => {
        baseCtx.drawImage(cleanImg, 0, 0);
        currentWorkingImage = cleanImg;
        cachedSubjectMask = null; // Mask invalidated because tattoos removed
        clearMask();
        updateUndoState();
        showProgress(false);
      };
      cleanImg.src = resJson.result;

    } catch (err) {
      console.error('Inpainting error:', err);
      showProgress(false);
      alert('Error during tattoo removal: ' + err.message);
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
  // 8. Hold-to-Compare Original Photo
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
  // 9. Save Clean Image & Trigger Success Modal
  // ==========================================
  function exportImage() {
    if (!currentWorkingImage) return;
    const link = document.createElement('a');
    link.download = `inkerase_studio_${Date.now()}.jpg`;
    link.href = baseCanvas.toDataURL('image/jpeg', 0.98);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    saveSuccessModal.classList.remove('hidden');
  }

  btnSaveImage.addEventListener('click', exportImage);
  btnSaveImageBg.addEventListener('click', exportImage);
  btnSaveImageBrush.addEventListener('click', exportImage);

})();
