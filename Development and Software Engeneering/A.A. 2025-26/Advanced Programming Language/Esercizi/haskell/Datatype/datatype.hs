module Ledger (Transaction (..), Ledger, fee, gasCost, isValid, describe, totalFees, filterByAddress, txInRange, groupByKind) where
data Transaction
    = Transfer { from :: String, to :: String, amount :: Double, timestamp :: Int }
    | ContractDeploy { owner :: String, byteCode :: String, gasLimit :: Int, timestamp :: Int }
    | ContractCall { caller :: String, contract :: String, function :: String, gasLimit :: Int, timestamp :: Int }
    deriving Show

type Ledger = [Transaction]

fee :: Transaction -> Double
fee (Transfer {amount = a}) = a * 0.01
fee (ContractDeploy {gasLimit = g1}) = fromIntegral g1 * 0.000001
fee (ContractCall {gasLimit = g2}) = fromIntegral g2 * 0.000001

gasCost :: Transaction -> Int
gasCost (Transfer {timestamp = t}) = 21000
gasCost (ContractDeploy {byteCode = bc}) = 32000 + 200 * length bc
gasCost (ContractCall {function = f}) = 5000 + 100 * length f

isValid :: Transaction -> Bool
isValid (Transfer {from = f, to = t, amount = a}) = a > 0 && f /= t
isValid tx@(ContractDeploy {byteCode = b, gasLimit = g}) = (length b > 0) && (g >= gasCost tx)   
isValid tx@(ContractCall {function = f, gasLimit = g}) = (length f > 0) && (g >= gasCost tx) 

describe :: Transaction -> String
describe (Transfer {from = f, to = t, amount = a, timestamp = ti}) = "Transfer of " ++ show a ++ " from " ++ f ++ " to " ++ t
describe (ContractDeploy {owner = o, byteCode = b, gasLimit = g, timestamp = t}) = "Contract deployed by " ++ o ++ " with bytecode of length " ++ show (length b)
describe (ContractCall {caller = c, contract = ct, function = f, gasLimit = g, timestamp = t}) = "Contract call by " ++ c ++ " to " ++ ct ++ " calling function " ++ f

totalFees :: Ledger -> Double
-- for each fee we map to have each value and then sum the values
totalFees [] = 0
totalFees (t:ts) = fee t + totalFees ts
-- same version not recursive
--totalFees = sum . map fee
--totalFees ts = foldr ((\x acc -> fee x + acc)) 0 ts
--totalFees ts = foldl ((\acc x -> acc + fee x)) 0 ts

filterByAddress :: String -> Ledger -> Ledger
filterByAddress addr [] = []
filterByAddress addr (tx:ts) =
    case tx of
        Transfer {from = f, to = t} | f == addr || t == addr -> tx : filterByAddress addr ts
        ContractDeploy {owner = o} | o == addr -> tx : filterByAddress addr ts
        ContractCall {caller = c} | c == addr -> tx : filterByAddress addr ts

txInRange :: Int -> Int -> Ledger -> Ledger
txInRange start end [] = []
txInRange start end _ | start > end = []
txInRange start end (t:ts) = 
    case t of
        Transfer {timestamp = x} | x >= start && x <= end -> t : txInRange start end ts
        ContractDeploy {timestamp = x} | x >= start && x <= end -> t : txInRange start end ts
        ContractCall {timestamp = x} | x >= start && x <= end -> t : txInRange start end ts

groupByKind :: Ledger -> ([Transaction], [Transaction], [Transaction])
groupByKind [] = ([], [], [])
groupByKind (t:ts) =
    case t of
        Transfer {} -> let (tr, cd, cc) = groupByKind ts in (t:tr, cd, cc)
        ContractDeploy {} -> let (tr, cd, cc) = groupByKind ts in (tr, t:cd, cc)
        ContractCall {} -> let (tr, cd, cc) = groupByKind ts in (tr, cd, t:cc)