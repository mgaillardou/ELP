module Main exposing (..)

import Browser
import Html exposing (Html, div, input, text, h1)
import Html.Attributes exposing (style, value, placeholder)
import Html.Events exposing (onInput)
import Parser exposing (..)
import Svg exposing (Svg, svg, polyline, image) 
import Svg.Attributes as SvgAttr
import Time 

-- 1. TYPES
type Command 
    = Forward Int 
    | Left Int 
    | Right Int 
    | Repeat Int (List Command)

-- 2. PARSER (Tes commentaires conservés)
descriptionCommandes : Parser Command 
descriptionCommandes =
    oneOf
        [ succeed Forward |. keyword "forward" |. spaces |= int 
        , succeed Left |. keyword "left" |. spaces |= int 
        , succeed Right |. keyword "right" |. spaces |= int 
        , succeed Repeat
            |. keyword "repeat" |. spaces |= int |. spaces 
            |. symbol "[" |. spaces
            |= lazy (\_ -> nettoieCommandes)
            |. spaces |. symbol "]"
        ]

nettoieCommandes : Parser (List Command) 
nettoieCommandes =
    succeed identity
        |. spaces
        |= Parser.loop [] recupereCommandes 

recupereCommandes : List Command -> Parser (Step (List Command) (List Command)) 
recupereCommandes acc =
    oneOf
        [ succeed (\cmd -> Loop (cmd :: acc)) |= descriptionCommandes |. spaces 
        , succeed (Done (List.reverse acc)) 
        ]

compareCommandes : String -> Result (List DeadEnd) (List Command) 
compareCommandes input =
    Parser.run nettoieCommandes (String.toLower input) 

-- 3. LOGIQUE DE CALCUL (Modifiée pour inclure l'angle)
type alias PointAxe = { x : Float, y : Float, angle : Float }

type alias Etat_Tortue = 
    { x : Float
    , y : Float
    , angle : Float
    , chemin : List PointAxe -- On stocke x, y ET angle maintenant
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
                    { state | x = newX, y = newY, chemin = state.chemin ++ [ { x = newX, y = newY, angle = state.angle } ] } 

                Left angle ->
                    { state | angle = state.angle - toFloat angle } 

                Right angle ->
                    { state | angle = state.angle + toFloat angle } 

                Repeat n subCmds ->
                    List.foldl (\_ s -> List.foldl nouveau_etat s subCmds) state (List.range 1 n) 
    in
    (List.foldl nouveau_etat etat_initial commands).chemin 

-- 4. MODEL ET UPDATE
type alias Model = 
    { input : String
    , allSteps : List PointAxe 
    , visibleSteps : Int    
    , error : Bool
    }

type Msg 
    = UserTyped String 
    | Tick Time.Posix  

init : () -> ( Model, Cmd Msg )
init _ = ( { input = "", allSteps = [ { x = 0, y = 0, angle = 0 } ], visibleSteps = 1, error = False }, Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model = 
    case msg of
        UserTyped txt ->
            case compareCommandes txt of
                Ok cmds -> 
                    ( { model | input = txt, allSteps = conversions_commandes_points cmds, visibleSteps = 1, error = False }, Cmd.none )
                Err _ -> 
                    ( { model | input = txt, error = True }, Cmd.none )

        Tick _ -> 
            if model.visibleSteps < List.length model.allSteps then
                ( { model | visibleSteps = model.visibleSteps + 1 }, Cmd.none )
            else
                ( model, Cmd.none )

-- 5. AFFICHAGE
display : Model -> Html msg
display model = 
    let
        etapesAffichées = List.take model.visibleSteps model.allSteps
        
        -- On récupère la dernière étape pour positionner ET orienter la tortue
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
        [ SvgAttr.width "500", SvgAttr.height "500", SvgAttr.viewBox "-250 -250 500 500" 
        , style "border" "1px solid #df0b75", style "background" "#eceee8"
        ]
        [ polyline
            [ SvgAttr.points conversions_points_strings
            , SvgAttr.fill "none"
            , SvgAttr.stroke "#f5150a" 
            , SvgAttr.strokeWidth "3" 
            , SvgAttr.strokeLinecap "round" 
            , SvgAttr.stroke "#fb03b0"
            , SvgAttr.strokeWidth "3"
            , SvgAttr.strokeLinecap "round"
            , SvgAttr.strokeLinejoin "round"
            ] []
        , image
            [ SvgAttr.x (String.fromFloat (derniereEtape.x - 15))
            , SvgAttr.y (String.fromFloat (derniereEtape.y - 15))
            , SvgAttr.width "30"
            , SvgAttr.height "30"
            , SvgAttr.xlinkHref "tortue.png"
            -- On applique la rotation ici
            , SvgAttr.transform rotationImage
            ] []
        ]

-- 6. VUE ET MAIN
view : Model -> Html Msg
view model = 
    div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center", style "padding" "40px", style "font-family" "sans-serif" ]
        [ h1 [] [ text "Mini-projet TcTurtle" ] 
        , input 
            [ placeholder "Ex: repeat 36 [ forward 10 left 10 ]" 
            , value model.input
            , onInput UserTyped
            , style "width" "480px", style "padding" "12px", style "font-size" "18px"
            , style "border" (if model.error && model.input /= "" then "2px solid red" else "2px solid #dc1faa")
            , style "outline" "none", style "border-radius" "8px"
            ] []
        , div [ style "margin-top" "20px" ] [ display model ]
        , if model.error && model.input /= "" then
            div [ style "color" "red", style "margin-top" "10px" ] [ text "Syntaxe invalide" ] 
          else
            text ""
        ]

subscriptions : Model -> Sub Msg
subscriptions model =
    Time.every 100 Tick

main = 
    Browser.element 
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions 
        }
