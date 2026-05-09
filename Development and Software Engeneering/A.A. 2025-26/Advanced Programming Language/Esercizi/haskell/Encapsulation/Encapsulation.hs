module Wallet (Wallet, Money, emptyWallet, mint, spend, validity, balance) where
    data Wallet = MkWallet {spent :: [Money], unspent :: [Money], next :: Int}
    data Money = MkMoney {id :: Int, amount :: Int}

emptyWallet :: Wallet
emptyWallet = MkWallet [] [] 0

mint :: Wallet -> Int -> (Money, Wallet)
mint w amount = 
    let m = MkMoney (next w) amount 
        newWallet = w {next = next w + 1}
in (m, newWallet)

spend :: Wallet -> Money -> Either String (Int, Wallet)
spend w m = 
    if (id m) `elem` (spent w) then
        Left "Money already spent"
    else
        let newWallet = w {spent = (id m) : (spent w)}
    in Right (amount m, newWallet)

validity :: Wallet -> Money -> Bool
validity w m =
    if (id m) `elem` (spent w) then
        False
    else
        True

balance :: Wallet -> Int
balance w = sum (map amount (unspent w))