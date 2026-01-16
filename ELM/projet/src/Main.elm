module Main exposing (main)

import Browser
import Html exposing (Html, div, input, text, h1, button, label)
import Html.Attributes exposing (style, value, type_)
import Html.Events exposing (onInput, onClick)
import Parser exposing (..)
import Svg exposing (Svg, svg, polyline)
import Svg.Attributes as SvgAttr
import Svg.Events
import Json.Decode as Decode

-- 1. MODÈLE DE DONNÉES
type Shape = Carre | Triangle | Cercle | Rectangle

type Command
    = Avancer Int 
    | Gauche Int 
    | Droite Int 
    | Repeter Int (List Command)
    | Teleporter Float Float -- Déplacement sans dessiner

type alias Point = ( Float, Float )

type alias Model =
    { taille : Int
    , formeSelectionnee : Shape
    , historique : List (List Command) -- Liste de toutes les formes placées
    }

-- 2. LOGIQUE DES FORMES (Génère le code Turtle selon la forme)
genererForme : Shape -> Int -> List Command
genererForme forme dim =
    let
        code = case forme of
            Carre -> "repeat 4 [ forward " ++ String.fromInt dim ++ " left 90 ]"
            Triangle -> "repeat 3 [ forward " ++ String.fromInt dim ++ " left 120 ]"
            Cercle -> "repeat 36 [ forward " ++ String.fromInt (max 1 (dim // 10)) ++ " left 10 ]"
            Rectangle -> "forward " ++ String.fromInt dim ++ " left 90 forward " ++ String.fromInt (dim // 2) ++ " left 90 forward " ++ String.fromInt dim ++ " left 90 forward " ++ String.fromInt (dim // 2) ++ " left 90"
    in
    -- On utilise notre parser pour transformer le texte en commandes
    Parser.run (loop [] (\acc -> oneOf [ succeed (\c -> Loop (c :: acc)) |= commandParser |. spaces, succeed (Done (List.reverse acc)) ])) (String.toLower code)
        |> Result.withDefault []

-- 3. PARSER DE BASE
commandParser : Parser Command
commandParser =
    oneOf
        [ succeed Avancer |. keyword "forward" |. spaces |= int
        , succeed Gauche |. keyword "left" |. spaces |= int
        , succeed Droite |. keyword "right" |. spaces |= int
        , succeed Repeter |. keyword "repeat" |. spaces |= int |. spaces 
          |. symbol "[" |. spaces |= lazy (\_ -> succeed identity |= (loop [] (\acc -> oneOf [ succeed (\c -> Loop (c :: acc)) |= commandParser |. spaces, succeed (Done (List.reverse acc)) ]))) |. spaces |. symbol "]"
        ]

-- 4. INTERPRÉTEUR (Transforme les commandes en coordonnées SVG)
interpreter : List (List Command) -> List (List Point)
interpreter historique =
    let
        executer cmd state =
            case cmd of
                Teleporter tx ty -> 
                    { state | x = tx, y = ty, tout = state.actuel :: state.tout, actuel = [ (tx, ty) ] }
                Avancer d ->
                    let 
                        nx = state.x + toFloat d * cos (degrees state.angle)
                        ny = state.y + toFloat d * sin (degrees state.angle)
                    in { state | x = nx, y = ny, actuel = state.actuel ++ [ (nx, ny) ] }
                Gauche a -> { state | angle = state.angle - toFloat a }
                Droite a -> { state | angle = state.angle + toFloat a }
                Repeter n cmds -> List.foldl (\_ s -> List.foldl executer s cmds) state (List.range 1 n)

        initS = { x = 0, y = 0, angle = 0, actuel = [], tout = [] }
        finalS = List.foldl (\cmds s -> List.foldl executer s cmds) initS historique
    in
    finalS.actuel :: finalS.tout

-- 5. UPDATE
type Msg = ChoisirForme Shape | ChangerTaille String | Cliquer Ecran | Reset

type alias Ecran = { x : Float, y : Float }

update : Msg -> Model -> Model
update msg model =
    case msg of
        ChoisirForme f -> { model | formeSelectionnee = f }
        ChangerTaille t -> { model | taille = String.toInt t |> Maybe.withDefault 0 }
        Reset -> { model | historique = [] }
        Cliquer pos ->
            let
                nouvelleForme = [ Teleporter pos.x pos.y ] ++ genererForme model.formeSelectionnee model.taille
            in
            { model | historique = model.historique ++ [ nouvelleForme ] }

-- 6. VUE
view : Model -> Html Msg
view model =
    div [ style "text-align" "center", style "padding" "20px", style "font-family" "sans-serif" ]
        [ h1 [] [ text "Turtle Interactive" ]
        , div [ style "margin-bottom" "20px" ]
            [ boutonForme Carre "Carré" model
            , boutonForme Triangle "Triangle" model
            , boutonForme Cercle "Cercle" model
            , boutonForme Rectangle "Rectangle" model
            , label [ style "margin" "0 10px" ] [ text "Taille : " ]
            , input [ type_ "number", value (String.fromInt model.taille), onInput ChangerTaille, style "width" "50px" ] []
            , button [ onClick Reset, style "margin-left" "10px", style "background" "red", style "color" "white" ] [ text "Effacer" ]
            ]
        , div [ style "color" "#888", style "font-size" "12px" ] [ text "Cliquez dans le cadre pour dessiner" ]
        , svg
            [ SvgAttr.width "600", SvgAttr.height "400", style "border" "2px solid black", style "background" "white"
            , Svg.Events.on "mousedown" (Decode.map Cliquer (Decode.map2 Ecran (Decode.field "offsetX" Decode.float) (Decode.field "offsetY" Decode.float)))
            ]
            (interpreter model.historique |> List.map (\pts -> polyline [ SvgAttr.points (pointsToStr pts), SvgAttr.fill "none", SvgAttr.stroke "blue", SvgAttr.strokeWidth "2" ] []))
        ]

boutonForme : Shape -> String -> Model -> Html Msg
boutonForme f label model =
    button 
        [ onClick (ChoisirForme f)
        , style "padding" "10px", style "margin" "2px"
        , style "background" (if model.formeSelectionnee == f then "blue" else "#ddd")
        , style "color" (if model.formeSelectionnee == f then "white" else "black")
        ] [ text label ]

pointsToStr : List Point -> String
pointsToStr = List.map (\(x,y) -> String.fromFloat x ++ "," ++ String.fromFloat y) >> String.join " "

main = Browser.sandbox { init = { taille = 50, formeSelectionnee = Carre, historique = [] }, update = update, view = view }