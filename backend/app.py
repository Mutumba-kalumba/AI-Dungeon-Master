from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import requests
import re
import json

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = "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"

NPCs = [
    "Gandor the Wizard", "Elara the Elf", "Thorn the Warrior",
    "Zyra the Sorceress", "Kael the Barbarian", "Vex the Warlock",
    "Sophia the Princess"
]

def clean_text(text):
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    text = re.sub(r"(>: )+", "", text)

    unwanted_phrases = [
        "After choosing", "continue the story", "Choose your response",
        "respond with the letter", "What will you choose?",
        "The fate of the mystical realm", "Choose one", "Let's start again",
        "Please let me know", "Let me know when", "Each choice will lead"
    ]

    filtered_text = "\n".join([
        line for line in text.split("\n")
        if not any(phrase.lower() in line.lower() for phrase in unwanted_phrases)
    ]).strip()

    return filtered_text

def query_ai(prompt):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a fantasy Dungeon Master who narrates thrilling, immersive adventures."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "max_tokens": 1024,
        "top_p": 1.0,
        "stop": None
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions",
                                 headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        generated_text = data["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as e:
        print("🔥 Groq API HTTP error:", response.status_code, response.text)
        return None, None
    except Exception as e:
        print("❌ Groq API general error:", str(e))
        return None, None

    story_parts = generated_text.split("\n")
    story = []
    choices = []

    for line in story_parts:
        if line.strip().startswith(("A)", "B)", "C)")):
            choices.append(line.strip())
        else:
            story.append(line.strip())

    if len(choices) < 2:
        choices = [
            "A) Continue forward cautiously.",
            "B) Make a decision.",
            "C) Prepare for battle."
        ]

    return clean_text("\n".join(story)), choices

@app.route("/tell_story", methods=["POST"])
def tell_story():
    npc = random.choice(NPCs)
    story_prompt = (
        f"Tell a short fantasy adventure story about {npc}. "
        "Keep it brief (under 3 sentences). Then provide exactly 3 short choices for what happens next, labeled 'A)', 'B)', and 'C)'."
    )

    story, choices = query_ai(story_prompt)

    if story:
        return jsonify({"story": story, "choices": choices, "npc": npc})
    else:
        return jsonify({
            "story": "⚠️ Model is loading or unavailable. Please wait a moment and try again.",
            "choices": [],
            "npc": "AI"
        }), 200

@app.route("/story_from_prompt", methods=["POST"])
def story_from_prompt():
    data = request.get_json()
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"story": "No prompt provided."})

    ai_prompt = (
        f"You are a fantasy storyteller AI. Based on the following prompt, write a short, immersive story with an ending in under 1500 words:\n\n"
        f"Prompt: {prompt}\n\n"
        "Do not include summaries, reviews, or editing comments. Only return the story."
    )

    story, _ = query_ai(ai_prompt)

    if story:
        return jsonify({"story": story})
    else:
        return jsonify({"story": "⚠️ The model is unavailable. Please try again shortly."}), 200

@app.route("/generate_story", methods=["POST"])
def generate_story():
    data = request.json
    recent_choice = data.get("recent_choice", "Continue the adventure")
    npc = data.get("npc", "Zyra the Sorceress")
    previous_story = data.get("previous_story", "")

    ai_prompt = (
        f"Story so far:\n{previous_story.strip()}\n\n"
        f"The player chose: {recent_choice.strip()}\n\n"
        "Continue the story in a cinematic, immersive fantasy style. "
        "Keep it under 3-5 sentences and include suspense or action. "
        "At the end, provide exactly 3 options for what the player can do next, labeled 'A)', 'B)', and 'C)'. "
        "Do not explain how to choose or repeat instructions to the player."
    )

    story, choices = query_ai(ai_prompt)

    if story:
        return jsonify({"narrative": story, "choices": choices, "npc": npc})
    else:
        return jsonify({"error": "Failed to generate continuation"}), 500

@app.route("/talk_to_npc", methods=["POST"])
def talk_to_npc():
    data = request.get_json()
    player_input = data.get("player_input", "")
    npc = data.get("npc", "a mysterious figure")
    previous_story = data.get("previous_story", "")

    if not player_input.strip():
        return jsonify({"reply": "You must say something to get a response!"})

    ai_prompt = (
        f"Story so far:\n{previous_story.strip()}\n\n"
        f"The player says to {npc}: \"{player_input.strip()}\"\n\n"
        f"Now, respond in-character as {npc}. Keep the reply short and immersive, like a dialogue in a fantasy novel. "
        f"Don't repeat the player's message. Only return the NPC's response.\n\n"
        f"After the dialogue, provide 3 new options labeled A), B), and C) for the player."
    )

    full_reply, choices = query_ai(ai_prompt)

    if full_reply:
        cleaned_reply = clean_text(full_reply.split("\n")[0])  # Only keep NPC reply (first line)
        return jsonify({
            "reply": cleaned_reply,
            "choices": choices
        })
    else:
        return jsonify({
            "reply": f"{npc} remains silent, as if lost in thought.",
            "choices": []
        })

@app.route('/generate_custom_story', methods=['POST'])
def generate_custom_story():
    data = request.get_json()
    character = data.get("character", {})

    name = character.get("name", "A Nameless Hero")
    char_class = character.get("charClass", "Adventurer")
    background = character.get("background", "")
    traits = character.get("traits", "")

    story_prompt = (
        f"Create an immersive fantasy story opening for a character named {name}, "
        f"a {char_class}. Background: {background}. Traits: {traits}. "
        f"Include a magical NPC they meet at the beginning, and offer 3 choices."
    )

    story_text, choices = query_ai(story_prompt)
    npc_name = random.choice(NPCs)
    npc_image = ""  # Placeholder for now

    return jsonify({
        "story": story_text,
        "choices": choices,
        "npc": npc_name,
        "npc_image": npc_image
    })
@app.route("/side_quest", methods=["POST"])
def side_quest():
    data = request.get_json()
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"reply": "⚠️ No prompt provided."}), 400

    full_story, _ = query_ai(prompt)

    if full_story:
        cleaned_story = clean_text(full_story)
        return jsonify({ "reply": cleaned_story })
    else:
        return jsonify({ "reply": "⚠️ Failed to generate quest story." }), 500

@app.route("/side_quest_reply", methods=["POST"])
def side_quest_reply():
    data = request.get_json()
    prompt = data.get("prompt", "")
    user_input = data.get("user_input", "")
    previous_log = data.get("previous_log", "")

    if not prompt or not user_input:
        return jsonify({"reply": "Missing prompt or input."}), 400

    dialogue_prompt = (
        f"{prompt}\n\n"
        f"Here is the ongoing conversation:\n{previous_log}\n\n"
        f"The player replies: \"{user_input}\"\n"
        f"Now respond in-character. Keep it short, precise, and interactive. Remind the player of rules, consequences, or rewards if needed."
    )

    full_reply, _ = query_ai(dialogue_prompt)

    return jsonify({"reply": clean_text(full_reply or "..." )})

@app.route("/end_story", methods=["POST"])
def end_story():
    data = request.json
    previous_story = data.get("previous_story", "")
    npc = data.get("npc", "an unknown companion")

    prompt = (
        f"Story so far:\n{previous_story.strip()}\n\n"
        f"Write a fantasy-style ending to conclude this story involving {npc}. "
        "The ending should feel complete, satisfying, and reflective. "
        "No choices or further actions. Just end the story like an epilogue."
    )

    story, _ = query_ai(prompt)

    if story:
        return jsonify({"ending": story})
    else:
        return jsonify({"error": "Failed to generate ending"}), 500

@app.route("/roll_dice", methods=["GET"])
def roll_dice():
    return jsonify({"dice_roll": random.randint(1, 6)})

if __name__ == "__main__":
    app.run(debug=True)
