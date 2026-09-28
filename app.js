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

  // Tool Panels
  const panelErase = document.getElementById('panelErase');
  const panelBgBlur = document.getElementById('panelBgBlur');
  const panelBrushBlur = document.getElementById('panelBrushBlur');
  const panelSkinSmooth = document.getElementById('panelSkinSmooth');

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

  // Canvas Contexts
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  const cursorCtx = cursorCanvas.getContext('2d');

  // State Management
  let activeTool = 'erase';         // 'erase' | 'bgblur' | 'brushblur'
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
  let isComparing = false;

  gpuStatusText.textContent = '⚡ Studio AI Active';

  // ==========================================
  // 1. Tool Switching & Tab Navigation
  // ==========================================
  function switchStudioTool(tool) {
    if (activeTool === tool) return;

    // If leaving bgblur without applying, restore previous working image
    if (activeTool === 'bgblur' && currentWorkingImage) {
      baseCtx.drawImage(currentWorkingImage, 0, 0);
    }

    activeTool = tool;

    // Update Tab UI
    tabErase.classList.toggle('active', tool === 'erase');
    tabBgBlur.classList.toggle('active', tool === 'bgblur');
    tabBrushBlur.classList.toggle('active', tool === 'brushblur');
    tabSkinSmooth.classList.toggle('active', tool === 'skinsmooth');

    // Update Panels
    panelErase.classList.toggle('hidden', tool !== 'erase');
    panelBgBlur.classList.toggle('hidden', tool !== 'bgblur');
    panelBrushBlur.classList.toggle('hidden', tool !== 'brushblur');
    panelSkinSmooth.classList.toggle('hidden', tool !== 'skinsmooth');

    // Tool-specific initialization
    if (tool === 'erase') {
      maskCanvas.style.pointerEvents = 'none';
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateUndoState();
    } else if (tool === 'bgblur') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      initBackgroundBlur();
    } else if (tool === 'brushblur') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      prepareBlurSource();
      updateUndoState();
    } else if (tool === 'skinsmooth') {
      clearMask();
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      prepareSmoothSource();
      updateUndoState();
    }
  }

  tabErase.addEventListener('click', () => switchStudioTool('erase'));
  tabBgBlur.addEventListener('click', () => switchStudioTool('bgblur'));
  tabBrushBlur.addEventListener('click', () => switchStudioTool('brushblur'));
  tabSkinSmooth.addEventListener('click', () => switchStudioTool('skinsmooth'));

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
  function updateTransform() {
    canvasWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0px) scale(${scale})`;
  }

  function resetTransform() {
    scale = 1.0;
    const vWidth = canvasViewport.clientWidth;
    const vHeight = canvasViewport.clientHeight;
    defaultPanX = Math.round((vWidth - displayWidth) / 2);
    defaultPanY = Math.round((vHeight - displayHeight) / 2);
    panX = defaultPanX;
    panY = defaultPanY;
    updateTransform();
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
    if (activeTool === 'bgblur') return; // Background blur uses sliders, not drawing

    const coords = getCanvasCoords(clientX, clientY);
    lastX = coords.x;
    lastY = coords.y;
    isDrawing = true;

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
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

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

  function drawCursor(x, y, radius) {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    if (activeTool === 'bgblur') return;

    // Outer boundary
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, radius, 0, Math.PI * 2);
    if (activeTool === 'skinsmooth') {
      cursorCtx.strokeStyle = 'rgba(251, 191, 36, 0.95)'; // Amber gold glow for skin smoothing
    } else if (activeTool === 'brushblur') {
      cursorCtx.strokeStyle = 'rgba(56, 189, 248, 0.95)'; // Cyan for blur
    } else {
      cursorCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)'; // White for erase
    }
    cursorCtx.lineWidth = Math.max(1.5, radius * 0.05);
    cursorCtx.stroke();

    // If blur brush or skin smooth, draw inner dotted circle showing feather core
    if (activeTool === 'brushblur' || activeTool === 'skinsmooth') {
      const featherVal = (activeTool === 'skinsmooth') ? skinSmoothFeather : manualBrushFeather;
      const innerRadius = Math.max(1, radius * (1.0 - featherVal / 100.0));
      cursorCtx.beginPath();
      cursorCtx.arc(x, y, innerRadius, 0, Math.PI * 2);
      cursorCtx.setLineDash([3, 3]);
      cursorCtx.strokeStyle = (activeTool === 'skinsmooth') ? 'rgba(251, 191, 36, 0.65)' : 'rgba(56, 189, 248, 0.6)';
      cursorCtx.lineWidth = 1.2;
      cursorCtx.stroke();
      cursorCtx.setLineDash([]);
    }
  }

  // --- Tool 1: Tattoo Mask Drawing ---
  function drawEraseStroke(x1, y1, x2, y2) {
    maskCtx.strokeStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.fillStyle = 'rgba(255, 46, 99, 0.85)';
    maskCtx.lineWidth = eraseBrushRadius * 2;
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
    const R = manualBrushRadius;
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

    // 3. Composite feathered dab onto base canvas with progressive smooth flow
    baseCtx.save();
    baseCtx.globalAlpha = 0.28;
    baseCtx.drawImage(dabCanvas, x - R, y - R);
    baseCtx.restore();
  }

  function drawManualBlurStroke(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(2, manualBrushRadius * 0.18);
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
  });

  manualBlurDensityInput.addEventListener('input', (e) => {
    manualBlurDensity = parseInt(e.target.value, 10);
    let desc = 'Medium';
    if (manualBlurDensity <= 8) desc = 'Soft';
    else if (manualBlurDensity >= 30) desc = 'Heavy';
    manualBlurDensityVal.textContent = `${manualBlurDensity}px (${desc})`;
    prepareBlurSource();
  });

  if (manualBrushFeatherInput) {
    manualBrushFeatherInput.addEventListener('input', (e) => {
      manualBrushFeather = parseInt(e.target.value, 10);
      let desc = 'Medium';
      if (manualBrushFeather <= 30) desc = 'Crisp';
      else if (manualBrushFeather >= 70) desc = 'Soft';
      manualBrushFeatherVal.textContent = `${manualBrushFeather}% (${desc})`;
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

    showProgress(true, 'Detecting Subject...', 'AI isolating person for portrait depth-of-field...', 40);

    try {
      const imgB64 = currentWorkingImage.toDataURL('image/jpeg', 0.96);
      const res = await fetch('/api/segment_subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgB64 })
      });

      if (!res.ok) throw new Error('Segmentation failed with status ' + res.status);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to detect subject');

      progressFill.style.width = '85%';

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

    // 1. Offscreen blurred background
    const offBg = document.createElement('canvas');
    offBg.width = baseCanvas.width;
    offBg.height = baseCanvas.height;
    const bgCtx = offBg.getContext('2d');
    bgCtx.filter = `blur(${blurPx}px)`;
    bgCtx.drawImage(currentWorkingImage, 0, 0);

    // 2. Draw blurred background, then crisp subject cutout on top
    baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.drawImage(offBg, 0, 0);
    baseCtx.drawImage(cachedSubjectCutout, 0, 0, baseCanvas.width, baseCanvas.height);
  }

  bgBlurDensityInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    let desc = 'Medium Bokeh';
    if (val <= 10) desc = 'Soft Bokeh';
    else if (val >= 35) desc = 'Dreamy Bokeh';
    bgBlurDensityVal.textContent = `${val}px (${desc})`;

    renderLiveBokeh();
  });

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
      bgBlurDensityInput.value = 20;
      bgBlurDensityVal.textContent = '20px (Medium Bokeh)';
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
    const R = skinSmoothRadius;
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

    // 3. Composite feathered dab onto base canvas with progressive smooth flow
    baseCtx.save();
    baseCtx.globalAlpha = 0.22; // Delicate buildable flow for flawless skin blending
    baseCtx.drawImage(dabCanvas, x - R, y - R);
    baseCtx.restore();
  }

  function drawSkinSmoothStroke(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(2, skinSmoothRadius * 0.18);
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
  });

  skinSmoothStrengthInput.addEventListener('input', (e) => {
    skinSmoothStrength = parseInt(e.target.value, 10);
    let desc = 'Silk';
    if (skinSmoothStrength <= 8) desc = 'Light';
    else if (skinSmoothStrength >= 20) desc = 'Ultra Smooth';
    skinSmoothStrengthVal.textContent = `${skinSmoothStrength}px (${desc})`;
    prepareSmoothSource();
  });

  skinSmoothFeatherInput.addEventListener('input', (e) => {
    skinSmoothFeather = parseInt(e.target.value, 10);
    let desc = 'Natural';
    if (skinSmoothFeather <= 40) desc = 'Crisp';
    else if (skinSmoothFeather >= 85) desc = 'Ultra Soft';
    skinSmoothFeatherVal.textContent = `${skinSmoothFeather}% (${desc})`;
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
  // 6. Undo State Management
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

      const response = await fetch('/api/inpaint', {
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
