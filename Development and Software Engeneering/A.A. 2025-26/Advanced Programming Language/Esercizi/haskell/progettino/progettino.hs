-- Haskell eccelle nel trasformare e manipolare dati grazie al Pattern Matching e alla ricorsione.
--Obiettivo: Creare un programma che prenda una lista di operazioni (es. ["add", "5", "mul", "2"]) e calcoli il risultato.
--Cosa impari: Tipi di dato algebrici (data), funzioni pure e come gestire lo stato senza variabili mutabili.

trasfcalc :: [String] -> Int
trasfcal [] = 0
trasfcalc [n] = read n :: Int --caso base: se c'è solo un numero, lo converto in Int
tranfcalc (op : n1 : rest) = case op of --prendo più elementi dalla lista
    "add" -> (read n1 :: Int) + tranfcalc resst --chiamata ricorsiva perchè non so quanti elementi ci sono dopo
    "mul" -> (read :: Int) n1 * tranfcalc rest
    "sub" -> (read n1 :: Int) - tranfcalc rest
    "div" -> (read n1 :: Int) `div` tranfcalc rest
    _ -> error "Operazione sconosciuta"

-- Valutatore di Espressioni Matematiche (Calcolatrice Avanzata) 🧮:
--L'obiettivo è prendere una stringa come "3 + (4 * 2)", analizzarla, trasformarla in una struttura dati ad albero e poi calcolarne il risultato matematico.
--Cosa imparerai: Imparerai a creare tipi di dati personalizzati (gli Algebraic Data Types, ad esempio data Expr = ...), a usare il pattern matching su strutture complesse e a sfruttare la ricorsione in modo elegante.

data Tree = val Int | add Tree Tree | mul Tree Tree | sub Tree Tree | div Tree Tree

parse :: String -> (Tree, String)
parse "" = error "Input vuoto"
parse s =
    let (num, rest) = span isDigit s
    node1 = val (read num :: Int)
    in calculate node1 rest

eval :: Tree -> Int
eval (val n) = n
eval (add e1 e2) = eval e1 + eval e2
eval (mul e1 e2) = eval e1 * eval e2
eval (sub e1 e2) = eval e1 - eval e2
eval (div e1 e2) = eval e1 `div` eval e2

calculate :: Tree -> String -> (Tree, String)
calculate node "" = (node, "")
calculate node (op:cs) =
    let (nextNode, rest) = span isDigit cs
    node2 = val (read nextNode :: Int)
    in case op of
        '+' -> add node node2
        '*' -> mul node node2
        '-' -> sub node node2
        '/' -> div node node2
        _ -> error "Operazione sconosciuta"

 

--Gestore di Todo-List da Terminale (CLI) ✅:
--Un'applicazione a riga di comando in cui l'utente digita comandi per aggiungere compiti, segnarli come completati o eliminarli, salvando lo stato in un file di testo.
--Cosa imparerai: La gestione degli effetti collaterali e dell'Input/Output. Scoprirai come Haskell usa la Monade IO per separare in modo netto e sicuro il codice puro (la logica che aggiorna la lista) dal codice "impuro" (che scrive sul file o legge i comandi della tastiera).