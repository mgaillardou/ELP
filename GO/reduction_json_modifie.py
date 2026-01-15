#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jan 15 15:07:33 2026

@author: gaillardou
"""
import json

with open("sortie.json", 'r', encoding='utf-8') as f:
    dico = json.load(f)
    
# Définition du rectangle géographique
lat_min, lat_max = 45.7550, 45.7575
lon_min, lon_max = 4.835, 4.842

# 1) Filtrage des noeuds par coordonnées
dico_filtre = {
    node_id: data for node_id, data in dico.items()
    if lat_min <= data["lat"] <= lat_max and lon_min <= data["lon"] <= lon_max
}

# 2) Nettoyage des voisins pour enlever les noeuds filtrés
for node_id, data in dico_filtre.items():
    nouveaux_voisins = {
        v: dist for v, dist in data["voisins"].items()
        if v in dico_filtre
    }
    data["voisins"] = nouveaux_voisins

# 3) Remplacer le dictionnaire de base
dico = dico_filtre

print(len(dico))

with open("json_reduit.json", 'w', encoding='utf-8') as f:
    json.dump(dico, f, ensure_ascii=False, indent=4)

print("Copie terminée avec succès.")
