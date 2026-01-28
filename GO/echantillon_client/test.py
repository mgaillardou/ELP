import json

def compter_cles_fichier_json(chemin_fichier):
    try:
        # Ouverture du fichier en mode lecture ('r')
        with open(chemin_fichier, 'r', encoding='utf-8') as fichier:
            # json.load() transforme le contenu du fichier en dictionnaire Python
            data = json.load(fichier)
            
        # On vérifie que le JSON contient bien un dictionnaire (objet)
        if isinstance(data, dict):
            return len(data)
        else:
            return "Erreur : Le fichier JSON contient une liste, pas un objet avec des clés."

    except FileNotFoundError:
        return f"Erreur : Le fichier '{chemin_fichier}' est introuvable."
    except json.JSONDecodeError:
        return "Erreur : Le contenu du fichier n'est pas un JSON valide."
    except Exception as e:
        return f"Une erreur est survenue : {e}"

# --- Utilisation ---
nom_fichier = 'json_reduit_4.json'
resultat = compter_cles_fichier_json(nom_fichier)

print(f"Nombre de clés dans le fichier : {resultat}")