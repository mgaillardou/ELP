module Main exposing (..)

import Browser
import Html exposing (Html, div, input, text, h1)
import Html.Attributes exposing (style, value, placeholder)
import Html.Events exposing (onInput)
import Parser exposing (..)
import Svg exposing (Svg, svg, polyline)
import Svg.Attributes as SvgAttr

-- 1. TYPES DU LANGAGE TURTLE
type Command
    = Forward Int
    | Left Int
    | Right Int
    | Repeat Int (List Command)

-- 2. PARSER
commandParser : Parser Command
commandParser =
    oneOf
        [ succeed Forward |. keyword "forward" |. spaces |= int
        , succeed Left |. keyword "left" |. spaces |= int
        , succeed Right |. keyword "right" |. spaces |= int
        , succeed Repeat
            |. keyword "repeat" |. spaces |= int |. spaces
            |. symbol "[" |. spaces
            |= lazy (\_ -> commandsParser)
            |. spaces |. symbol "]"
        ]

commandsParser : Parser (List Command)
commandsParser =
    succeed identity
        |. spaces
        |= Parser.loop [] commandsStep

commandsStep : List Command -> Parser (Step (List Command) (List Command))
commandsStep acc =
    oneOf
        [ succeed (\cmd -> Loop (cmd :: acc)) |= commandParser |. spaces
        , succeed (Done (List.reverse acc))
        ]

parseTurtle : String -> Result (List DeadEnd) (List Command)
parseTurtle input =
    Parser.run commandsParser (String.toLower input)

-- 3. LOGIQUE DE LA TORTUE (INTERPRÉTEUR)
type alias Point = ( Float, Float )

type alias TurtleState =
    { x : Float
    , y : Float
    , angle : Float
    , path : List Point
    }

commandsToPoints : List Command -> List Point
commandsToPoints commands =
    let
        initialState = { x = 0, y = 0, angle = 0, path = [ ( 0, 0 ) ] }
        
        updateState : Command -> TurtleState -> TurtleState
        updateState cmd state =
            case cmd of
                Forward dist ->
                    let
                        rad = degrees state.angle
                        newX = state.x + toFloat dist * cos rad
                        newY = state.y + toFloat dist * sin rad
                    in
                    { state | x = newX, y = newY, path = state.path ++ [ ( newX, newY ) ] }

                Left angle ->
                    { state | angle = state.angle - toFloat angle }

                Right angle ->
                    { state | angle = state.angle + toFloat angle }

                Repeat n subCmds ->
                    List.foldl (\_ s -> List.foldl updateState s subCmds) state (List.range 1 n)
    in
    (List.foldl updateState initialState commands).path

-- 4. ARCHITECTURE ELM (MVU)
type alias Model =
    { input : String
    , commands : List Command
    , error : Bool
    }

type Msg = UserTyped String

init : Model
init = { input = "", commands = [], error = False }

update : Msg -> Model -> Model
update msg model =
    case msg of
        UserTyped txt ->
            case parseTurtle txt of
                Ok cmds -> { model | input = txt, commands = cmds, error = False }
                Err _ -> { model | input = txt, error = True }

-- 5. VUE ET DESSIN SVG
display : List Command -> Html msg
display cmds =
    let
        pts = commandsToPoints cmds
        pointsString =
            pts
                |> List.map (\( x, y ) -> String.fromFloat x ++ "," ++ String.fromFloat y)
                |> String.join " "
    in
    svg
        [ SvgAttr.width "500", SvgAttr.height "500", SvgAttr.viewBox "-250 -250 500 500"
        , style "border" "1px solid #ccc", style "background" "#f9f9f9"
        ]
        [ polyline
            [ SvgAttr.points pointsString
            , SvgAttr.fill "none"
            , SvgAttr.stroke "#2ecc71"
            , SvgAttr.strokeWidth "3"
            , SvgAttr.strokeLinecap "round"
            , SvgAttr.strokeLinejoin "round"
            ] []
        ]

view : Model -> Html Msg
view model =
    div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center", style "padding" "40px", style "font-family" "sans-serif" ]
        [ h1 [] [ text "Elm Turtle Graphics" ]
        , input 
            [ placeholder "Ex: repeat 36 [ forward 10 left 10 ]"
            , value model.input
            , onInput UserTyped
            , style "width" "480px", style "padding" "12px", style "font-size" "18px"
            , style "border" (if model.error && model.input /= "" then "2px solid red" else "2px solid #3498db")
            , style "outline" "none", style "border-radius" "8px"
            ] []
        , div [ style "margin-top" "20px" ] [ display model.commands ]
        , if model.error && model.input /= "" then
            div [ style "color" "red", style "margin-top" "10px" ] [ text "Syntaxe invalide..." ]
          else
            text ""
        ]

main = Browser.sandbox { init = init, update = update, view = view }