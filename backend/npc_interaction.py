from flask import Flask, request, jsonify
from character_db import update_npc_memory, get_npc_memory
from dnd_api import query_llama

app = Flask(__name__)

NPCS = {
    "Gandor the Wizard": "A wise old wizard who remembers past encounters.",
    "Thorn the Rogue": "A sneaky thief who holds grudges.",
}

@app.route('/talk', methods=['POST'])
def talk_to_npc():
    data = request.json
    npc_name = data.get("npc", "Unknown NPC")
    user_message = data.get("message", "")

    if npc_name not in NPCS:
        return jsonify({"error": "NPC not found"}), 404

    past_interactions = get_npc_memory(npc_name)
    
    prompt = f"""
    [Character]: {npc_name}
    [Personality]: {NPCS[npc_name]}
    [Memory]: {past_interactions}
    [Player Says]: {user_message}
    
    [Response]: Reply in character and acknowledge past interactions.
    """

    response = query_llama(prompt)
    update_npc_memory(npc_name, user_message)  # Save player's message

    return jsonify({"npc_response": response.get("generated_text", "Error")})

if __name__ == '__main__':
    app.run(debug=True)
