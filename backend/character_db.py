import json

MEMORY_FILE = "npc_memory.json"

def load_memory():
    try:
        with open(MEMORY_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

def save_memory(memory):
    with open(MEMORY_FILE, "w") as file:
        json.dump(memory, file, indent=4)

def update_npc_memory(npc, player_interaction):
    memory = load_memory()
    if npc not in memory:
        memory[npc] = []
    
    memory[npc].append(player_interaction)
    save_memory(memory)

def get_npc_memory(npc):
    memory = load_memory()
    return memory.get(npc, [])
