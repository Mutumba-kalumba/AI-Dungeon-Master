import requests
import os

# Set your API key here
LLAMA_API_KEY = "LLAMA key"


# Set your model
MODEL_NAME = "meta-llama/Meta-Llama-3-8B"

def query_llama(prompt, max_tokens=300):
    url = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"
    headers = {"Authorization": f"Bearer {LLAMA_API_KEY}"}
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": max_tokens}}

    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        return response.json()[0]  # Return generated text
    else:
        return {"error": response.json()}

