module Main exposing (..)

import Browser
import Html exposing (Html, div, input, text, h1)
import Html.Attributes exposing (style, value, placeholder)
import Html.Events exposing (onInput)
import Parser exposing (..)
import Svg exposing (Svg, svg, polyline)
import Svg.Attributes as SvgAttr


type Command -- Commandes que l'utilisateur peut faire 
    = Forward Int -- Avancer
    | Left Int -- Tourner gauche
    | Right Int -- Tourner droite
    | Repeat Int (List Command) -- Repeter une action

descriptionCommandes : Parser Command -- commandParser
descriptionCommandes =
    oneOf
        [ succeed Forward |. keyword "forward" |. spaces |= int -- forward int 
        , succeed Left |. keyword "left" |. spaces |= int -- left int
        , succeed Right |. keyword "right" |. spaces |= int -- right int
        , succeed Repeat
            |. keyword "repeat" |. spaces |= int |. spaces -- repeat int [ forward int ]
            |. symbol "[" |. spaces
            |= lazy (\_ -> nettoieCommandes)
            |. spaces |. symbol "]"
        ]

nettoieCommandes : Parser (List Command) -- commandsParser
nettoieCommandes =
    succeed identity
        |. spaces
        |= Parser.loop [] recupereCommandes -- prend la liste finale de recupereCommandes et la nettoie s'il y a des espaces en debut de liste

recupereCommandes : List Command -> Parser (Step (List Command) (List Command)) -- commandsStep
recupereCommandes acc =
    oneOf
        [ succeed (\cmd -> Loop (cmd :: acc)) |= descriptionCommandes |. spaces -- Recupere commandes rentrees et les ajoute au debut de la liste acc si correctes
        , succeed (Done (List.reverse acc)) -- si commandes non correctes ou fin, renvoie la liste et l'inverse pour que les elements soient dans le bon ordre
        ]

compareCommandes : String -> Result (List DeadEnd) (List Command) -- parseTurtle
compareCommandes input =
    Parser.run nettoieCommandes (String.toLower input) -- compare ce qui a ete ecrit par l'utilisateur avec les commandes disponibles definies avant + convertie en minuscule pour eviter des conflits avec des majuscules


type alias Point = ( Float, Float )

type alias Etat_Tortue = -- Etat de la tortue, position (x,y), orientaion et chemin parcouru
    { x : Float
    , y : Float
    , angle : Float
    , chemin : List Point
    }

conversions_commandes_points : List Command -> List Point
conversions_commandes_points commands =
    let
        etat_initial = { x = 0, y = 0, angle = 0, chemin = [ ( 0, 0 ) ] }
        
        nouveau_etat : Command -> Etat_Tortue -> Etat_Tortue
        nouveau_etat cmd state =
            case cmd of
                Forward dist ->
                    let
                        rad = degrees state.angle
                        newX = state.x + toFloat dist * cos rad
                        newY = state.y + toFloat dist * sin rad
                    in
                    { state | x = newX, y = newY, chemin = state.chemin ++ [ ( newX, newY ) ] } -- calcule la nouvelle position 

                Left angle ->
                    { state | angle = state.angle - toFloat angle } -- modifie la valeur de l'angle pour tourner vers la gauche

                Right angle ->
                    { state | angle = state.angle + toFloat angle } -- modifie la valeur de l'angle pour tourner vers la droite

                Repeat n subCmds ->
                    List.foldl (\_ s -> List.foldl nouveau_etat s subCmds) state (List.range 1 n) 
    in
    (List.foldl nouveau_etat etat_initial commands).chemin -- renvoie la liste des points a parcourir avec la tourtue

type alias Model = -- elements que l'on a besoin pour que la page fonctionne bien,le texte que l'utilisateur inscrit, la liste des commandes diponibles et un erreur sir le message n'est pas bon
    { input : String
    , commands : List Command
    , error : Bool
    }

type Msg = UserTyped String -- texte que l'utilisateur rentre 

init : Model
init = { input = "", commands = [], error = False } -- on initialise le model

update : Msg -> Model -> Model
update msg model = -- permet de changer en temps reel le model
    case msg of
        UserTyped txt ->
            case compareCommandes txt of
                Ok cmds -> { model | input = txt, commands = cmds, error = False } -- si la commande est bonne on l'ajoute dans model
                Err _ -> { model | input = txt, error = True } -- si elle n'est pas bonne, on met error a True


display : List Command -> Html msg
display cmds = -- convertie lsite des points en traits
    let
        pts = conversions_commandes_points cmds -- récupere la liste des points en fonction des commandes
        conversions_points_strings =
            pts
                |> List.map (\( x, y ) -> String.fromFloat x ++ "," ++ String.fromFloat y) -- [(x,y),(x',y')] => "x,y x',y'"
                |> String.join " " -- pour avoir le bon format comprehensible par le navigateur
    in
    svg
        [ SvgAttr.width "500", SvgAttr.height "500", SvgAttr.viewBox "-250 -250 500 500" -- taille de la zone de dessin
        , style "border" "1px solid #df0b75", style "background" "#eceee8"
        ]
        [ polyline
            [ SvgAttr.points conversions_points_strings
            , SvgAttr.fill "none"
            , SvgAttr.stroke "#f5150a" -- couleur trait
            , SvgAttr.strokeWidth "3" -- epaisseur trait
            , SvgAttr.strokeLinecap "round" -- bout des traits arrondis
            , SvgAttr.strokeLinejoin "round"
            ] []
        ]

view : Model -> Html Msg
view model = -- convertie en format html
    div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center", style "padding" "40px", style "font-family" "sans-serif" ]
        [ h1 [] [ text "Mini-projet TcTurtle" ] -- titre
        , input 
            [ placeholder "Ex: repeat 36 [ forward 10 left 10 ]" -- texte transparent en fond
            , value model.input
            , onInput UserTyped
            , style "width" "480px", style "padding" "12px", style "font-size" "18px"
            , style "border" (if model.error && model.input /= "" then "2px solid red" else "2px solid #dc1faa")
            , style "outline" "none", style "border-radius" "8px"
            ] []
        , div [ style "margin-top" "20px" ] [ display model.commands ]
        , if model.error && model.input /= "" then
            div [ style "color" "red", style "margin-top" "10px" ] [ text "Syntaxe invalide" ] -- si une erreur de syntaxe on ecrit Syntaxe invalide
          else
            text ""
        ]

main = Browser.sandbox { init = init, update = update, view = view }