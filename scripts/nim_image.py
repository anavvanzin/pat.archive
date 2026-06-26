#!/usr/bin/env python3
"""Generate an image using NVIDIA NIM API (DiffusionGemma)."""
import os, sys, base64, argparse, json, urllib.request, urllib.error

NIM_BASE = "https://integrate.api.nvidia.com/v1"

def generate(prompt, output):
    api_key = os.environ.get("NIM_API_KEY")
    if not api_key:
        print("❌ NIM_API_KEY not set", file=sys.stderr)
        sys.exit(1)
    
    payload = json.dumps({
        "model": "google/diffusiongemma-26b-a4b-it",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 4096,
    }).encode()
    
    req = urllib.request.Request(
        f"{NIM_BASE}/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
    )
    
    print(f"🧠 Generating with DiffusionGemma via NVIDIA NIM...", file=sys.stderr)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"❌ HTTP {e.code}: {body[:500]}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
    
    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not content:
        print(f"❌ No content in response: {json.dumps(result, indent=2)[:500]}", file=sys.stderr)
        sys.exit(1)
    
    # Check if it's a base64 image (DiffusionGemma returns images as base64 in content)
    if "base64," in content:
        b64 = content.split("base64,")[1].strip()
        img_data = base64.b64decode(b64)
    else:
        # Check for image_url format
        try:
            parsed = json.loads(content)
            if isinstance(parsed, list) and len(parsed) > 0:
                img_data = base64.b64decode(parsed[0].get("image", ""))
            else:
                print(f"❌ Unexpected format. Content: {content[:300]}", file=sys.stderr)
                sys.exit(1)
        except json.JSONDecodeError:
            print(f"❌ Not JSON. Content: {content[:300]}", file=sys.stderr)
            sys.exit(1)
    
    out_path = output or "generated.png"
    with open(out_path, "wb") as f:
        f.write(img_data)
    print(f"✅ Saved {out_path} ({len(img_data)/1024:.0f} KB)", file=sys.stderr)
    return out_path

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("prompt")
    p.add_argument("--output", "-o", default=None)
    args = p.parse_args()
    generate(args.prompt, args.output)
