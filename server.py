import http.server
import socketserver
import os
import socket
import json
import base64
import io
import time
import numpy as np
from PIL import Image
import cv2
import onnxruntime as ort

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
LAMA_MODEL_PATH = os.path.join(DIRECTORY, "lama.onnx")
REAL_ESRGAN_PATH = os.path.join(DIRECTORY, "realesrgan_x2.onnx")
GFPGAN_PATH = os.path.join(DIRECTORY, "gfpgan.onnx")
YUNET_PATH = os.path.join(DIRECTORY, "yunet.onnx")

print("=" * 60)
print("Loading Studio-Grade LaMa Neural Engine...")
session = ort.InferenceSession(LAMA_MODEL_PATH, providers=['CPUExecutionProvider'])
print("Studio LaMa AI Active & Ready!")
print("=" * 60)

rmbg_session = None
esrgan_session = None
gfpgan_session = None
yunet_detector = None

def get_rmbg_session():
    global rmbg_session
    if rmbg_session is None:
        import rembg
        print("Loading BRIA-RMBG Portrait Subject Engine...")
        rmbg_session = rembg.new_session('bria-rmbg')
        print("BRIA-RMBG Engine Active & Ready!")
    return rmbg_session

def get_esrgan_session():
    global esrgan_session
    if esrgan_session is None and os.path.exists(REAL_ESRGAN_PATH):
        print("Loading Real-ESRGAN 2x Super-Resolution Engine...")
        esrgan_session = ort.InferenceSession(REAL_ESRGAN_PATH, providers=['CPUExecutionProvider'])
        print("Real-ESRGAN Engine Active & Ready!")
    return esrgan_session

def get_gfpgan_session():
    global gfpgan_session
    if gfpgan_session is None and os.path.exists(GFPGAN_PATH):
        print("Loading GFPGAN v1.4 Face Restoration Engine...")
        gfpgan_session = ort.InferenceSession(GFPGAN_PATH, providers=['CPUExecutionProvider'])
        print("GFPGAN Face Engine Active & Ready!")
    return gfpgan_session

def get_yunet_detector():
    global yunet_detector
    if yunet_detector is None and os.path.exists(YUNET_PATH):
        yunet_detector = cv2.FaceDetectorYN.create(YUNET_PATH, '', (320, 320), score_threshold=0.6)
    return yunet_detector

# Pre-warm RMBG, Real-ESRGAN & GFPGAN into RAM
get_rmbg_session()
get_esrgan_session()
get_gfpgan_session()
get_yunet_detector()

def upscale_real_esrgan_tiled(img_bgr, tile_size=512, tile_pad=16):
    """
    Memory-efficient tiled 2x Super-Resolution with Real-ESRGAN:
    Processes in overlapping tiles to prevent RAM spikes on mobile photos.
    """
    sess = get_esrgan_session()
    if sess is None:
        return cv2.resize(img_bgr, (img_bgr.shape[1] * 2, img_bgr.shape[0] * 2), interpolation=cv2.INTER_LANCZOS4)

    h, w, c = img_bgr.shape
    scale = 2
    out_h, out_w = h * scale, w * scale
    out_img = np.zeros((out_h, out_w, c), dtype=np.uint8)

    tiles_x = int(np.ceil(w / tile_size))
    tiles_y = int(np.ceil(h / tile_size))

    for y in range(tiles_y):
        for x in range(tiles_x):
            x1 = x * tile_size
            x2 = min(x1 + tile_size, w)
            y1 = y * tile_size
            y2 = min(y1 + tile_size, h)

            px1 = max(0, x1 - tile_pad)
            px2 = min(w, x2 + tile_pad)
            py1 = max(0, y1 - tile_pad)
            py2 = min(h, y2 + tile_pad)

            tile = img_bgr[py1:py2, px1:px2]
            tile_rgb = cv2.cvtColor(tile, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            tile_tensor = np.transpose(tile_rgb, (2, 0, 1))[np.newaxis, ...]

            out_tile = sess.run(None, {'input': tile_tensor})[0][0]
            out_tile = np.clip(np.transpose(out_tile, (1, 2, 0)) * 255.0, 0, 255).astype(np.uint8)
            out_tile_bgr = cv2.cvtColor(out_tile, cv2.COLOR_RGB2BGR)

            out_x1 = (x1 - px1) * scale
            out_x2 = out_x1 + (x2 - x1) * scale
            out_y1 = (y1 - py1) * scale
            out_y2 = out_y1 + (y2 - y1) * scale

            out_img[y1*scale:y2*scale, x1*scale:x2*scale] = out_tile_bgr[out_y1:out_y2, out_x1:out_x2]

    return out_img

def restore_faces_gfpgan(img_bgr):
    """
    GFPGAN v1.4 Facial Feature & Texture Restoration:
    Detects faces using neural YuNet, enhances facial features with GFPGAN,
    and blends smoothly back into the upscaled photo.
    """
    sess_gfp = get_gfpgan_session()
    detector = get_yunet_detector()
    if sess_gfp is None or detector is None:
        return img_bgr

    h, w = img_bgr.shape[:2]
    detector.setInputSize((w, h))
    try:
        _, faces = detector.detect(img_bgr)
    except Exception:
        faces = None

    if faces is None or len(faces) == 0:
        return img_bgr

    out = img_bgr.copy()
    for face in faces:
        fx, fy, fw, fh = int(face[0]), int(face[1]), int(face[2]), int(face[3])
        if fw < 20 or fh < 20:
            continue

        mx, my = int(fw * 0.35), int(fh * 0.35)
        x1 = max(0, fx - mx)
        y1 = max(0, fy - my)
        x2 = min(w, fx + fw + mx)
        y2 = min(h, fy + fh + my)

        crop = img_bgr[y1:y2, x1:x2]
        ch, cw = crop.shape[:2]
        if ch < 32 or cw < 32:
            continue

        resized = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_LANCZOS4)
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        tensor = ((rgb - 0.5) / 0.5).transpose(2, 0, 1)[np.newaxis, ...]

        try:
            gfp_out = sess_gfp.run(None, {'input': tensor})[0][0]
            gfp_out = np.clip((gfp_out * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
            restored_rgb = gfp_out.transpose(1, 2, 0)
            restored_bgr = cv2.cvtColor(restored_rgb, cv2.COLOR_RGB2BGR)

            restored_crop = cv2.resize(restored_bgr, (cw, ch), interpolation=cv2.INTER_LANCZOS4)

            # Smooth elliptical blend mask
            mask = np.zeros((ch, cw), dtype=np.float32)
            cv2.ellipse(mask, (cw // 2, ch // 2), (int(cw * 0.42), int(ch * 0.42)), 0, 0, 360, 1.0, -1)
            k_w = max(3, int(cw * 0.25) | 1)
            k_h = max(3, int(ch * 0.25) | 1)
            mask = cv2.GaussianBlur(mask, (k_w, k_h), 0)[:, :, np.newaxis]

            out[y1:y2, x1:x2] = (restored_crop * mask + crop * (1.0 - mask)).astype(np.uint8)
        except Exception as err:
            print("[GFPGAN] Warning on face restoration crop:", err)

    return out

def full_ai_upscale_pipeline(img_bgr, face_enhance=True):
    """
    Combined Real-ESRGAN 2x Super-Resolution + GFPGAN Face Restoration Pipeline
    """
    print(f"[AI Upscale] Input image size: {img_bgr.shape[1]}x{img_bgr.shape[0]}")
    t0 = time.time()
    upscaled = upscale_real_esrgan_tiled(img_bgr, tile_size=512, tile_pad=16)
    print(f"[AI Upscale] Real-ESRGAN complete: {upscaled.shape[1]}x{upscaled.shape[0]} in {time.time() - t0:.2f}s")

    if face_enhance:
        t1 = time.time()
        upscaled = restore_faces_gfpgan(upscaled)
        print(f"[AI Upscale] GFPGAN complete in {time.time() - t1:.2f}s")

    return upscaled


def apply_portrait_blur(orig_np, mask_np, blur_density=25):
    """
    Studio Portrait Depth-of-Field Blur with Zero Halo Bleed:
    orig_np: (H, W, 3) RGB uint8
    mask_np: (H, W) uint8 where 255=foreground subject, 0=background
    blur_density: 1 to 50
    """
    # 1. Subtle subpixel anti-aliased edge matting (prevents blurry halos around subject)
    feathered_mask = cv2.GaussianBlur(mask_np.astype(np.float32), (5, 5), 1.2) / 255.0
    alpha = np.clip(feathered_mask, 0.0, 1.0)[:, :, np.newaxis]

    ksize = int(blur_density * 2 + 1)
    if ksize % 2 == 0:
        ksize += 1
    ksize = max(3, min(101, ksize))

    # 2. Push background colors into subject area before blurring to eliminate subject halo bleeding
    dilated_subj = cv2.dilate((mask_np > 128).astype(np.uint8) * 255, np.ones((11, 11), np.uint8))
    try:
        bg_plate = cv2.inpaint(orig_np, dilated_subj, 5, cv2.INPAINT_TELEA)
    except Exception:
        bg_plate = orig_np

    blurred_bg = cv2.GaussianBlur(bg_plate, (ksize, ksize), 0)
    composite = (orig_np * alpha + blurred_bg * (1.0 - alpha)).astype(np.uint8)
    return composite

def smart_ink_snap(crop_img, user_mask):
    """
    Adaptive Tattoo Ink Auto-Edge Expansion:
    Samples outer surrounding skin brightness, finds ink border pixels,
    and dilates the mask 2-5px outward to swallow needle borders cleanly.
    """
    gray = cv2.cvtColor(crop_img, cv2.COLOR_RGB2GRAY)
    outer_skin_mask = (cv2.dilate(user_mask, np.ones((19, 19), np.uint8)) == 0)
    skin_pixels = gray[outer_skin_mask]

    if len(skin_pixels) > 50:
        skin_median = float(np.median(skin_pixels))
        skin_p20 = float(np.percentile(skin_pixels, 20))
        ink_threshold = max(20.0, min(skin_p20 - 6.0, skin_median * 0.83))
    else:
        ink_threshold = 120.0

    border_zone = cv2.dilate(user_mask, np.ones((9, 9), np.uint8), iterations=1) - user_mask
    ink_detected = (gray < ink_threshold) & (border_zone > 0)

    enhanced_mask = user_mask.copy()
    enhanced_mask[ink_detected] = 255
    final_mask = cv2.dilate(enhanced_mask, np.ones((5, 5), np.uint8), iterations=1)
    return final_mask

def match_skin_grain(inpainted_crop, crop_img, binary_mask):
    """
    Micro-Skin Texture & Grain Matching:
    Samples high-frequency camera sensor noise and skin pores from the surrounding unmasked
    skin and blends it onto the inpainted skin patch to eliminate plastic blur.
    """
    unmasked = (binary_mask == 0)
    if np.sum(unmasked) < 100:
        return inpainted_crop

    blurred_orig = cv2.GaussianBlur(crop_img, (3, 3), 0.75)
    hp_orig = cv2.subtract(crop_img, blurred_orig)

    skin_noise = hp_orig[unmasked]
    grain_std = float(np.std(skin_noise))

    if grain_std > 0.8:
        target_std = min(grain_std * 0.52, 3.6)
        grain_noise = np.random.normal(0, target_std, inpainted_crop.shape)
        enhanced = np.clip(inpainted_crop.astype(np.float32) + grain_noise, 0, 255).astype(np.uint8)
        return enhanced

    return inpainted_crop

def run_lama_inpainting_island(crop_img, raw_crop_mask):
    ch, cw = crop_img.shape[:2]
    snapped_mask = smart_ink_snap(crop_img, raw_crop_mask)

    img_512 = cv2.resize(crop_img, (512, 512), interpolation=cv2.INTER_LINEAR)
    mask_512 = cv2.resize(snapped_mask, (512, 512), interpolation=cv2.INTER_NEAREST)

    img_in = (img_512.astype(np.float32) / 255.0).transpose(2, 0, 1)
    img_in = np.expand_dims(img_in, 0)
    mask_in = (mask_512 > 10).astype(np.float32)
    mask_in = np.expand_dims(np.expand_dims(mask_in, 0), 0)

    out = session.run(['output'], {'image': img_in, 'mask': mask_in})[0]
    out_512 = np.clip(out[0].transpose(1, 2, 0), 0, 255).astype(np.uint8)
    inpainted_crop = cv2.resize(out_512, (cw, ch), interpolation=cv2.INTER_LANCZOS4)

    grain_matched_crop = match_skin_grain(inpainted_crop, crop_img, snapped_mask)

    feather = cv2.GaussianBlur(snapped_mask.astype(np.float32) / 255.0, (15, 15), 0)
    feather = np.clip(feather * 1.3, 0.0, 1.0)[:, :, np.newaxis]

    blended = (grain_matched_crop * feather + crop_img * (1.0 - feather)).astype(np.uint8)
    return blended

def process_image_with_islands(orig_np, mask_np):
    orig_h, orig_w = orig_np.shape[:2]
    if mask_np.shape[:2] != (orig_h, orig_w):
        mask_np = cv2.resize(mask_np, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
    _, binary_mask = cv2.threshold(mask_np, 20, 255, cv2.THRESH_BINARY)

    # Merge nearby strokes (within 35px) into unified limb clusters
    cluster_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
    clustered_mask = cv2.dilate(binary_mask, cluster_kernel, iterations=1)
    contours, _ = cv2.findContours(clustered_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return orig_np

    working_img = orig_np.copy()
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w < 2 and h < 2:
            continue

        pad_x = max(35, int(w * 0.40))
        pad_y = max(35, int(h * 0.40))

        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(orig_w, x + w + pad_x)
        y2 = min(orig_h, y + h + pad_y)

        crop_img = working_img[y1:y2, x1:x2]
        crop_mask = binary_mask[y1:y2, x1:x2]

        if np.sum(crop_mask > 20) == 0:
            continue

        inpainted_crop = run_lama_inpainting_island(crop_img, crop_mask)
        working_img[y1:y2, x1:x2] = inpainted_crop

    return working_img

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok","ai":"ready"}')
            return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/inpaint':
            try:
                # Single Image Inpaint with Clustered Multi-Island Engine
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))

                img_b64 = data['image'].split(',')[-1]
                mask_b64 = data['mask'].split(',')[-1]

                orig_img = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")
                mask_img = Image.open(io.BytesIO(base64.b64decode(mask_b64))).convert("L")

                result_np = process_image_with_islands(np.array(orig_img), np.array(mask_img))
                result_img = Image.fromarray(result_np)

                buf = io.BytesIO()
                result_img.save(buf, format='JPEG', quality=98)
                res_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

                resp = json.dumps({'success': True, 'result': res_b64}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(resp)
            except Exception as e:
                import traceback
                traceback.print_exc()
                err_resp = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(err_resp)
            return

        elif self.path == '/api/segment_subject':
            # Extract high-resolution foreground alpha cutout using BRIA-RMBG
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            img_b64 = data['image'].split(',')[-1]
            orig_img = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")

            # Fast 640-capped inference: runs in ~2 seconds with stellar silhouette accuracy
            w, h = orig_img.size
            max_dim = 640
            if max(w, h) > max_dim:
                scale = max_dim / float(max(w, h))
                target_w, target_h = int(w * scale), int(h * scale)
                infer_img = orig_img.resize((target_w, target_h), Image.BILINEAR)
            else:
                infer_img = orig_img

            import rembg
            session_rmbg = get_rmbg_session()
            cutout_small = rembg.remove(infer_img, session=session_rmbg)

            # Isolate alpha channel to eliminate black edge premultiplication artifacts:
            alpha_small = cutout_small.split()[-1]
            if alpha_small.size != (w, h):
                alpha_pil = alpha_small.resize((w, h), Image.BILINEAR)
            else:
                alpha_pil = alpha_small

            # Re-bind genuine camera pixels with the alpha matte (100% natural edges, zero dark halo)
            cutout_pil = orig_img.copy()
            cutout_pil.putalpha(alpha_pil)

            # Fast PNG compression (compress_level=1 is ~6x faster than level 6 with zero quality loss)
            buf = io.BytesIO()
            cutout_pil.save(buf, format='PNG', compress_level=1)
            cutout_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

            resp = json.dumps({'success': True, 'cutout': cutout_b64}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(resp)
            return

        elif self.path == '/api/portrait_blur':
            # Apply portrait background blur with specified density
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            img_b64 = data['image'].split(',')[-1]
            mask_b64 = data['mask'].split(',')[-1]
            blur_density = int(data.get('blur_density', 25))

            orig_img = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")
            mask_img = Image.open(io.BytesIO(base64.b64decode(mask_b64))).convert("L")

            result_np = apply_portrait_blur(np.array(orig_img), np.array(mask_img), blur_density)
            result_img = Image.fromarray(result_np)

            buf = io.BytesIO()
            result_img.save(buf, format='JPEG', quality=98)
            res_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

            resp = json.dumps({'success': True, 'result': res_b64}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(resp)
            return

        elif self.path == '/api/upscale':
            try:
                # Real-ESRGAN 2x + GFPGAN Face Enhancement
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))

                img_b64 = data['image'].split(',')[-1]
                face_enhance = bool(data.get('face_enhance', True))

                pil_img = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")
                img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

                upscaled_bgr = full_ai_upscale_pipeline(img_bgr, face_enhance=face_enhance)
                result_img = Image.fromarray(cv2.cvtColor(upscaled_bgr, cv2.COLOR_BGR2RGB))

                buf = io.BytesIO()
                result_img.save(buf, format='JPEG', quality=98)
                res_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

                resp = json.dumps({'success': True, 'result': res_b64}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(resp)
            except Exception as e:
                import traceback
                traceback.print_exc()
                err_resp = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(err_resp)
            return

        self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '86400')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == '__main__':
    ip = get_ip()
    print("=" * 60)
    print(">>> InkErase AI - Studio Single Inpainting Active!")
    print(f"[*] Access URL: http://{ip}:{PORT}")
    print("=" * 60)

    class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True

    with ThreadingServer(("0.0.0.0", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
