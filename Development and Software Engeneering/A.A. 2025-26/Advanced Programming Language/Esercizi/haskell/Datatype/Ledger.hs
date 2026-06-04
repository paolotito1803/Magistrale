module Ledger (Transaction(..), Ledger, fee, gasCost, isValid, describe, totalFees, filterByAddress, txInRange, groupByKind) where
data Transaction = Transfer { from :: String, to :: String, amount :: Double, timestamp :: Int }
                | ContractDeploy { owner :: String, bytecode :: String, gasLimit :: Int, timestamp :: Int }
                | ContractCall   { caller :: String, contract :: String, function :: String, gasLimit :: Int, timestamp :: Int }
  deriving Show
type Ledger = [Transaction]

fee :: Transaction -> Double
fee (Transfer{_ _ amount = a _}) = a * 0.01
fee (ContractDeploy{_ _ gasLimit = gl _}) = fromIntegral gl * 0.000001
fee (ContractCall{_ _ _ gasLimit = gl _}) = fromIntegral gl * 0.000001

gasCost :: Transaction -> Int
gasCost (Transfer{_ _ _ _}) = 21000
gasCost (ContractDeploy{_ bytecode = bc _ _}) = 32000 + 200 * length bc
gasCost (ContractCall{_ _ function = f _ _}) = 50000 + 100 * length f

isValid :: Transaction -> Bool
isValid (Transfer{from = f to = t amount = a _}) = a > 0 && f /= t
isValid (ContractDeploy{_ bytecode = bc gasLimit = gl}) = length bc /= 0 && gl >= gasCost (ContractDeploy{_ bytecode = bc gasLimit = gl})
isValid (ContractCall {_ _ function = f gasLimit = gl _}) = length f /= 0 && gl > gasCost (ContractCall {_ _ function = f gasLimit = gl _})

describe :: Transaction -> String
describe (Transfer{from = f to = t amount =  a timestamp = tm}) = "Transfer" ++ show f ++ "->" ++ show t ++ show a ++ "@" ++ show tm
describe (ContractDeploy {owner = o bytecode = bc gasLimit = gl timestamp = tm}) = "ContractDeploy" ++ show o ++ "deploys contract (" ++ show gl ++ "gas )" ++ "@" ++ show tm
describe (ConstractCall {caller = c contract = ct function = f gasLimit = gl timestamp = tm}) = "Call" ++ show c ++ "calls" ++ show f ++ "on" ++ show ct ++ "(" ++ show gl ++ "gas )" ++ "@" ++ show tm 
 
totalFees :: Ledger -> Double
totalFees [] = 0
totalFees (t:ts) = fee t + totalFees ts -- equal version totalFees = sum . map fee

filterByAddress :: String -> Ledger -> Ledger
filterByAddress _ [] = []
filterByAddress addr (t:ts) =
    case t of
        Transfer{from = f to = to} -> if f == addr || to == addr then t : filterByAddress addr ts else filterByAddress addr ts
        ContractDeploy{owner = o} -> if o == addr then t : filterByAddress addr ts else filterByAddress addr ts
        ContractCall{caller = c} -> if c == addr then t : filterByAddress addr ts else filterByAddress addr ts

txInRange :: Int -> Int -> Ledger -> Ledger
txInRange _ _ [] = []
txInRange start end (t:ts) = 
    case t of
        Transfer{timestamp =tm} -> if tm >= start && tm <= end then t : txInRange start end ts else txInRange start end ts
        ContractDeploy{timestamp = tm} -> if tm >= start && tm <= end then t : txInRange start end ts else txInRange start end ts
        ContractCall{timestamp = tm} -> if tm >= start && tm <= end then t : txInRange start end ts else txInRange start end ts

groupByKind :: Ledger -> ([Transaction], [Transaction], [Transaction])
groupByKind [] = ([]. [], [])
groupByKind (t:ts) =
    case t of
        Transfer{} -> let (tr, cd, cc) = groupByKind ts in (t:tr, cd, cc)
        ContractDeploy{} -> let (tr, cd, cc) = groupByKind ts in (tr, t:cd, cc)
        ContractCall{} -> let (tr, cd, cc) = groupByKind ts in (tr, cd, t:cc)