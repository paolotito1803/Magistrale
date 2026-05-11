module Wallet (Wallet, Money, emptyWallet, mint, spend, validity, balancee, balance, verify) where
    data Wallet = MkWallet {spent :: [Money], unspent :: [Money], next :: Int}
    data Money = MkMoney {id :: Int, amount :: Int}

emptyWallet :: Wallet
emptyWallet = MkWallet [] [] 0

mint :: Wallet -> Int -> (Money, Wallet)
mint w amount = 
    let m = MkMoney (next w) amount 
        newWallet = w {next = next w + 1}
in (m, newWallet)

spend :: Wallet -> Money -> Either String (Wallet, Int) -- returns new balance, or an error if already spent
spend (MkWallet u s next) m = 
    let i = moneyId m
    in case break (\m' -> moneyId m' == i) u of
        (before, found : after) -> Right(MkWallet (before ++ after) (found : s) next, moneyAmount found)
        _ -> 
            if any (\m' -> moneyId m' == i) s
                then Left "already spent"
                else Left "unknown token"

verify :: Wallet -> Money -> Bool -- is the money still spendable
verify (MkWallet u _ _) m = any (\m' -> moneyId m' == moneyId m) u

balance :: Wallet -> Int -- total amount of unspent money
balance MkWallet{unspent = u} = (sum . map amount) u

validity :: Wallet -> Money -> Bool
validity w m =
    if (id m) `elem` (spent w) then
        False
    else
        True

balancee :: Wallet -> Int
balance w = sum (map amount (unspent w))