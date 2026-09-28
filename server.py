import http.server
import socketserver
import os
import socket
import json
import base64
import io
import numpy as np
from PIL import Image
import cv2
import onnxruntime as ort

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
LAMA_MODEL_PATH = os.path.join(DIRECTORY, "lama.onnx")

print("=" * 60)
print("Loading Studio-Grade LaMa Neural Engine...")
session = ort.InferenceSession(LAMA_MODEL_PATH, providers=['CPUExecutionProvider'])
print("Studio LaMa AI Active & Ready!")
print("=" * 60)

rmbg_session = None

def get_rmbg_session():
    global rmbg_session
    if rmbg_session is None:
        import rembg
        print("Loading BRIA-RMBG Portrait Subject Engine...")
        rmbg_session = rembg.new_session('bria-rmbg')
        print("BRIA-RMBG Engine Active & Ready!")
    return rmbg_session

# Pre-warm RMBG into RAM to eliminate first-click cold start
get_rmbg_session()

def apply_portrait_blur(orig_np, mask_np, blur_density=25):
    """
    Studio Portrait Depth-of-Field Blur:
    orig_np: (H, W, 3) RGB uint8
    mask_np: (H, W) uint8 where 255=foreground subject, 0=background
    blur_density: 1 to 50
    """
    # Feather mask slightly for smooth hair and body contours
    feathered_mask = cv2.GaussianBlur(mask_np, (7, 7), 2.0)
    alpha = (feathered_mask.astype(np.float32) / 255.0)[:, :, np.newaxis]

    ksize = int(blur_density * 2 + 1)
    if ksize % 2 == 0:
        ksize += 1
    ksize = max(3, min(101, ksize))

    blurred_bg = cv2.GaussianBlur(orig_np, (ksize, ksize), 0)
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

    def do_POST(self):
        if self.path == '/api/inpaint':
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
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp)
            return

        elif self.path == '/api/segment_subject':
            # Extract high-resolution foreground alpha cutout using BRIA-RMBG
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            img_b64 = data['image'].split(',')[-1]
            orig_img = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")

            # Fast 1024-capped inference: BRIA-RMBG native resolution is 1024x1024
            w, h = orig_img.size
            max_dim = 1024
            if max(w, h) > max_dim:
                scale = max_dim / float(max(w, h))
                target_w, target_h = int(w * scale), int(h * scale)
                infer_img = orig_img.resize((target_w, target_h), Image.BILINEAR)
            else:
                infer_img = orig_img

            import rembg
            session_rmbg = get_rmbg_session()
            cutout_pil = rembg.remove(infer_img, session=session_rmbg)

            # Fast PNG compression (compress_level=1 is ~6x faster than level 6 with zero quality loss)
            buf = io.BytesIO()
            cutout_pil.save(buf, format='PNG', compress_level=1)
            cutout_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

            resp = json.dumps({'success': True, 'cutout': cutout_b64}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
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
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp)
            return

        self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
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
