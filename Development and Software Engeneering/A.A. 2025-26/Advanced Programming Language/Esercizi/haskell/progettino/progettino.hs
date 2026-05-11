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