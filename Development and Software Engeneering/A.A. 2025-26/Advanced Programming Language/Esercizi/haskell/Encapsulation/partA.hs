module Wallet(Wallet, Money, empty, mint, spend, verify, balance) where -- Wallet is the module, Money is another type inside the module and all are seen externally
data Money = MkMoney {moneyId :: Int, moneyAmount :: Int} -- type definition construct in only one way Different type of Money
data Wallet = MkWallet {unspent :: [Money], 
                        spent :: [Money], 
                        nextId:: Int -- counter for generating fresh ids
                        } -- type definition construct in only one way. Wallet with different kinds of money


empty :: Wallet -- a fresh, empty wallet produced from nothing
empty = MkWallet [] [] 0 -- original syntax would be MkWallet {unspent = [], spent = [], nextId = 0}

mint :: Wallet -> Int -> (Wallet, Money) -- create a Money with the given amount
mint (MkWallet u s next)  amount =  -- MkWallet u s next uses pattern matching to bind the variables to construct the new wallet
    let m = MkMoney next amount
        w' = MkWallet(m : u) s (next + 1) -- also here we have pattern matching
    in (w', m) 

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
balance MkWallet{unspent = u} = (sum . map moneyAmount) u