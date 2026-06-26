#!/usr/bin/env python3
"""Local image generation with Diffusers + MPS (Apple Silicon GPU)."""

import torch
from diffusers import StableDiffusionPipeline
import os

MODEL_ID = "runwayml/stable-diffusion-v1-5"
DEVICE = "mps"
DTYPE = torch.float32  # MPS doesn't fully support fp16

print(f"Loading {MODEL_ID} on {DEVICE}...")
pipe = StableDiffusionPipeline.from_pretrained(
    MODEL_ID,
    torch_dtype=DTYPE,
    safety_checker=None,  # disable NSFW filter for local use
    requires_safety_checker=False,
)
pipe = pipe.to(DEVICE)
pipe.enable_attention_slicing()  # helps with memory

# Enable memory efficient attention if available (MPS-friendly)
try:
    pipe.enable_xformers_memory_efficient_attention()
except Exception:
    pass

prompt = "woodcut xilogravura style, punk serigrafia, black ink on cream paper, tarot card illustration, brazilian folk art, high contrast, bold lines, printing black and paper cream palette, dark red accents, burned yellow details"

print(f"Generating: {prompt[:80]}...")
image = pipe(
    prompt,
    num_inference_steps=30,
    guidance_scale=7.5,
    negative_prompt="photorealistic, smooth gradients, corporate, digital art, 3d render, pastel colors",
).images[0]

out_dir = "/Users/ana/Documents/GitHub/pat.archive/site/assets/gen"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "test_xilogravura.png")
image.save(out_path)
print(f"Saved: {out_path} ({os.path.getsize(out_path) / 1024:.0f} KB)")
