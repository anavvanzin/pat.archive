#!/usr/bin/env python3
"""Generate an image using Gemini 2.0 Flash (image generation)."""
import os, sys, base64, argparse
from google import genai
from google.genai import types

def generate(prompt, output, model="gemini-2.0-flash-exp-image-generation"):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not set", file=sys.stderr)
        sys.exit(1)
    client = genai.Client(api_key=api_key)
    print(f"🧠 Generating with {model}...", file=sys.stderr)
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["Text", "Image"]
            )
        )
        for part in response.candidates[0].content.parts:
            if part.text:
                print(f"  {part.text[:200]}", file=sys.stderr)
            if part.inline_data:
                mime = part.inline_data.mime_type
                ext = mime.split("/")[-1]
                if ext == "jpeg": ext = "jpg"
                out_path = output or f"generated.{ext}"
                with open(out_path, "wb") as f:
                    f.write(part.inline_data.data)
                print(f"✅ Saved {out_path} ({len(part.inline_data.data)/1024:.0f} KB)", file=sys.stderr)
                return out_path
        print("❌ No image data in response", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("prompt")
    p.add_argument("--output", "-o", default=None)
    p.add_argument("--model", "-m", default="gemini-2.0-flash-exp-image-generation")
    args = p.parse_args()
    generate(args.prompt, args.output, args.model)
