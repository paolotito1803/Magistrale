module Wallet (Wallet, Money, emptyWallet, mint, spend, validity, balance) where
    data Wallet = {spend :: [Money], unspend :: [Money], next :: Int}
    data Money = {id :: Int, amount :: Int}

emptyWallet :: Wallet
emptyWallet = MkWallet [] [] 0

mint :: Wallet -> Int -> (Wallet, Money)
mint w amount = 
    let m = MkMoney (next w) amount
        w' = w (next = next w + 1)
    in (w', m)

spend :: Wallet -> Money -> Either String (Wallet, Int)
spend (MkWallet u s next) m = 
    let id = id m
    in case break (\m' -> id m' = id) u of
        (before, found : after) -> Right(MkWallet (before ++ after) (found :: s) next, amount found)
        _ ->
            if any (\m' -> id m' == id) s
                then Left "already spent"
                else Left "not found"

validity :: Wallet -> Money -> Bool
verify (MkWallet (u _ _)) m = any (\m' -> id m' == id m) u

balance :: Wallet -> Int
balance MkWallet {unspent = u} = (sum . map amount) u