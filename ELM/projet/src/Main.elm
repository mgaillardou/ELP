module Main exposing (..)

import Browser
import Html exposing (Html, div, input, text, h1)
import Html.Attributes exposing (style, value, placeholder)
import Html.Events exposing (onInput)
import Parser exposing (..)
import Svg exposing (Svg, svg, polyline, image) 
import Svg.Attributes as SvgAttr
import Time 

-- TYPES
type Command -- Commandes que l'utilisateur peut faire 
    = Forward Int -- Avancer
    | Left Int -- Tourner gauche
    | Right Int -- Tourner droite
    | Repeat Int (List Command) -- Repeter une action

-- On définit un type unique pour éviter les erreurs de "Mismatch"
type alias PointAxe = { x : Float, y : Float, angle : Float }

-- PARSER
descriptionCommandes : Parser Command 
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

nettoieCommandes : Parser (List Command) 
nettoieCommandes =
    succeed identity
        |. spaces
        |= Parser.loop [] recupereCommandes -- prend la liste finale et la nettoie

recupereCommandes : List Command -> Parser (Step (List Command) (List Command)) 
recupereCommandes acc =
    oneOf
        [ succeed (\cmd -> Loop (cmd :: acc)) |= descriptionCommandes |. spaces -- ajoute au début si correct
        , succeed (Done (List.reverse acc)) -- sinon renvoie la liste inversée (bon ordre)
        ]

compareCommandes : String -> Result (List DeadEnd) (List Command) -- parseTurtle
compareCommandes input =
    Parser.run nettoieCommandes (String.toLower input) -- compare et convertit en minuscule

-- CALCULS
type alias Etat_Tortue = -- Etat de la tortue, position (x,y), orientation et chemin parcouru
    { x : Float
    , y : Float
    , angle : Float
    , chemin : List PointAxe 
    }

conversions_commandes_points : List Command -> List PointAxe
conversions_commandes_points commands =
    let
        etat_initial = { x = 0, y = 0, angle = 0, chemin = [ { x = 0, y = 0, angle = 0 } ] }
        
        nouveau_etat : Command -> Etat_Tortue -> Etat_Tortue
        nouveau_etat cmd state =
            case cmd of
                Forward dist ->
                    let
                        rad = degrees state.angle
                        newX = state.x + toFloat dist * cos rad
                        newY = state.y + toFloat dist * sin rad
                    in
                    { state | x = newX, y = newY, chemin = state.chemin ++ [ { x = newX, y = newY, angle = state.angle } ] } -- calcule la nouvelle position 

                Left angle ->
                    { state | angle = state.angle - toFloat angle } -- modifie l'angle vers la gauche

                Right angle ->
                    { state | angle = state.angle + toFloat angle } -- modifie l'angle vers la droite

                Repeat n subCmds ->
                    List.foldl (\_ s -> List.foldl nouveau_etat s subCmds) state (List.range 1 n) 
    in
    (List.foldl nouveau_etat etat_initial commands).chemin -- renvoie la liste des points à parcourir

-- UPDATE
type alias Model = -- elements pour que la page fonctionne
    { input : String
    , allSteps : List PointAxe 
    , visibleSteps : Int    
    , error : Bool
    }

type Msg 
    = UserTyped String -- texte que l'utilisateur rentre 
    | Tick Time.Posix 

init : () -> ( Model, Cmd Msg )
init _ = ( { input = "", allSteps = [ { x = 0, y = 0, angle = 0 } ], visibleSteps = 1, error = False }, Cmd.none ) -- on initialise le model

update : Msg -> Model -> ( Model, Cmd Msg ) -- Correction : renvoie un tuple (Model, Cmd)
update msg model = -- permet de changer en temps réel le model
    case msg of
        UserTyped txt ->
            case compareCommandes txt of
                Ok cmds -> 
                    ( { model | input = txt, allSteps = conversions_commandes_points cmds, visibleSteps = 1, error = False }, Cmd.none ) -- mise à jour si correct
                Err _ -> 
                    ( { model | input = txt, error = True }, Cmd.none ) -- erreur si syntaxe fausse

        Tick _ -> 
            if model.visibleSteps < List.length model.allSteps then -- augmente le nombre de points affichés pour l'animation
                ( { model | visibleSteps = model.visibleSteps + 1 }, Cmd.none )
            else
                ( model, Cmd.none )

-- AFFICHAGE
display : Model -> Html msg
-- convertit l'état actuel en éléments SVG pour l'affichage
display model = 
    let
        etapesAffichées = List.take model.visibleSteps model.allSteps
        
        -- récupère la dernière étape pour positionner ET orienter la tortue
        derniereEtape = List.reverse etapesAffichées |> List.head |> Maybe.withDefault { x = 0, y = 0, angle = 0 }

        conversions_points_strings =
            etapesAffichées
                |> List.map (\p -> String.fromFloat p.x ++ "," ++ String.fromFloat p.y)
                |> String.join " " 
                
        -- Calcul de la rotation : rotate(angle, centreX, centreY)
        rotationImage = 
            "rotate(" ++ String.fromFloat derniereEtape.angle ++ " " ++ String.fromFloat derniereEtape.x ++ " " ++ String.fromFloat derniereEtape.y ++ ")"
    in
    svg
        [ SvgAttr.width "500", SvgAttr.height "500", SvgAttr.viewBox "-250 -250 500 500" -- taille de la zone de dessin
        , style "border" "1px solid #df0b75", style "background" "#eceee8"
        ]
        [ polyline
            [ SvgAttr.points conversions_points_strings
            , SvgAttr.fill "none"
            , SvgAttr.stroke "#fb03b0" -- couleur trait
            , SvgAttr.strokeWidth "3" -- epaisseur trait
            , SvgAttr.strokeLinecap "round" -- bout des traits arrondis
            , SvgAttr.strokeLinejoin "round"
            ] []
        , image
            [ SvgAttr.x (String.fromFloat (derniereEtape.x - 15))
            , SvgAttr.y (String.fromFloat (derniereEtape.y - 15))
            , SvgAttr.width "30"
            , SvgAttr.height "30"
            , SvgAttr.xlinkHref "tortue.png"
            , SvgAttr.transform rotationImage -- n applique la rotation ici
            ] []
        ]

-- VUE
view : Model -> Html Msg
view model = -- convertit en format html
    div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center", style "padding" "40px", style "font-family" "sans-serif" ]
        [ h1 [] [ text "Mini-projet TcTurtle" ] -- titre
        , input 
            [ placeholder "Ex: repeat 360 [ forward 10 left 10 ]" -- texte transparent en fond
            , value model.input
            , onInput UserTyped
            , style "width" "480px", style "padding" "12px", style "font-size" "18px"
            , style "border" (if model.error && model.input /= "" then "2px solid red" else "2px solid #dc1faa")
            , style "outline" "none", style "border-radius" "8px"
            ] []
        , div [ style "margin-top" "20px" ] [ display model ] -- Correction : on passe le model entier
        , if model.error && model.input /= "" then
            div [ style "color" "red", style "margin-top" "10px" ] [ text "Syntaxe invalide" ] -- message d'erreur
          else
            text ""
        ]

subscriptions : Model -> Sub Msg
subscriptions model =
    Time.every 100 Tick -- Signal du timer pour l'animation

main = 
    Browser.element 
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions 
        }