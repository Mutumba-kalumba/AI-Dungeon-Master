import random

# Sample NPC names and types
npc_names = ["Gandor", "Elara", "Thrain", "Seraphina", "Orion"]
npc_roles = ["Wizard", "Rogue", "Knight", "Priest", "Merchant"]

def generate_random_npc():
    """Generate a random NPC with a name, role, and backstory."""
    name = random.choice(npc_names)
    role = random.choice(npc_roles)
    backstory = f"{name} the {role} has a mysterious past filled with adventures and secrets."
    return {"name": name, "role": role, "backstory": backstory}

def generate_story(npc, choice=None):
    """Generate a story based on NPC and user choices."""
    if choice is None:
        return {
            "narrative": f"You encounter {npc['name']} the {npc['role']}. {npc['backstory']}",
            "choices": [
                "Ask about their past",
                "Challenge them to a duel",
                "Offer them a quest"
            ]
        }
    elif choice == "Ask about their past":
        return {
            "narrative": f"{npc['name']} shares a tale of lost treasure and betrayal.",
            "choices": ["Search for the treasure", "Ignore the tale", "Report it to the guild"]
        }
    elif choice == "Challenge them to a duel":
        return {
            "narrative": f"{npc['name']} draws their weapon, ready for battle!",
            "choices": ["Attack", "Defend", "Try to negotiate"]
        }
    elif choice == "Offer them a quest":
        return {
            "narrative": f"{npc['name']} eagerly accepts and asks for details.",
            "choices": ["Send them to retrieve an artifact", "Test their loyalty", "Tell them a fake quest"]
        }
    else:
        return {"narrative": "The path is unclear.", "choices": []}
