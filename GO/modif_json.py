#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Dec 26 14:38:54 2025

@author: gaillardou
"""

import json
import matplotlib.pyplot as plt
import math
import heapq

with open("lyon.json", 'r', encoding='utf-8') as f:
    dictionnaire = json.load(f)

dico = {}


def dijkstra(dico, start, end):
    # Distance minimale depuis start
    distances = {node: float('inf') for node in dico}
    distances[start] = 0

    # Pour reconstruire le chemin
    precedent = {}

    # File de priorité (distance, noeud)
    heap = [(0, start)]

    while heap:
        dist_actuelle, courant = heapq.heappop(heap)

        # Si on atteint la destination
        if courant == end:
            break

        # Si on a déjà trouvé mieux
        if dist_actuelle > distances[courant]:
            continue

        for voisin, poids in dico[courant]["voisins"].items():
            nouvelle_dist = dist_actuelle + poids

            if nouvelle_dist < distances[voisin]:
                distances[voisin] = nouvelle_dist
                precedent[voisin] = courant
                heapq.heappush(heap, (nouvelle_dist, voisin))

    # Reconstruction du chemin
    chemin = []
    node = end
    while node != start:
        chemin.append(node)
        node = precedent.get(node)
        if node is None:
            return None, float('inf')  # Pas de chemin

    chemin.append(start)
    chemin.reverse()

    return chemin, distances[end]


def distance(lat1, lon1, lat2, lon2):
    R = 6371000  # rayon de la Terre en mètres

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def composantes_connexes(dico):
    visites = set()
    composantes = []

    for node_id in dico:
        if node_id not in visites:
            stack = [node_id]
            composante = set()

            while stack:
                current = stack.pop()
                if current not in visites:
                    visites.add(current)
                    composante.add(current)
                    stack.extend(dico[current]["voisins"].keys())

            composantes.append(composante)

    return composantes

# Initialisation des noeuds
for i in dictionnaire["elements"]:
    if i["type"] == "node" and i["id"] not in dico:
        dico[i["id"]] = {
            "type": i["type"],
            "lat": i["lat"],
            "lon": i["lon"],
            "voisins": {}   # ⬅ dictionnaire maintenant
        }

# Construction des voisins avec distance
for elem in dictionnaire["elements"]:
    if elem["type"] == "way":
        nodes = elem["nodes"]

        for i in range(len(nodes) - 1):
            n1 = nodes[i]
            n2 = nodes[i + 1]

            if n1 in dico and n2 in dico:
                lat1, lon1 = dico[n1]["lat"], dico[n1]["lon"]
                lat2, lon2 = dico[n2]["lat"], dico[n2]["lon"]

                dist = distance(lat1, lon1, lat2, lon2)

                # Ajout bidirectionnel
                dico[n1]["voisins"][n2] = dist
                dico[n2]["voisins"][n1] = dist

# Calcul des composantes 
composantes = composantes_connexes(dico) 
# Garder la plus grande 
plus_grande = max(composantes, key=len) 
# Filtrage du dictionnaire 
dico = { node_id: node for node_id, node in dico.items() if node_id in plus_grande }


with open("sortie.json", 'w', encoding='utf-8') as f:
    json.dump(dico, f, ensure_ascii=False, indent=4)

print("Copie terminée avec succès.")


start_id = 26053251
end_id   = 838347904

chemin, distance_totale = dijkstra(dico, start_id, end_id)
print("Chemin :", chemin)
print("Distance totale (m) :", distance_totale)

plt.figure(figsize=(6,6))

# 2️⃣ Tracé de tous les points du graphe
lats = [v["lat"] for v in dico.values()]
lons = [v["lon"] for v in dico.values()]
plt.scatter(lons, lats, s=10, color='blue', label='Noeuds')

# 3️⃣ Tracé du plus court chemin (en rouge)
if chemin:
    path_lats = [dico[n]["lat"] for n in chemin]
    path_lons = [dico[n]["lon"] for n in chemin]
    plt.plot(path_lons, path_lats, color='red', linewidth=3, label='Plus court chemin')
    plt.scatter(path_lons, path_lats, color='red', s=20)

plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.title("Graphe routier avec plus court chemin")
plt.grid()
plt.legend()
plt.show()


# # Tracé des routes (liaisons entre voisins)
# for node_id, node in dico.items():
#     lat1 = node["lat"]
#     lon1 = node["lon"]

#     for voisin_id in node["voisins"]:
#         # Pour éviter les doublons
#         if voisin_id > node_id:
#             voisin = dico[voisin_id]
#             lat2 = voisin["lat"]
#             lon2 = voisin["lon"]

#             plt.plot([lon1, lon2], [lat1, lat2])

# plt.xlabel("Longitude")
# plt.ylabel("Latitude")
# plt.title("Graphe routier")
# plt.grid()
# plt.show()