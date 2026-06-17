module Wallet (Wallet, Money, mint, spend, verify) where
    data Money = MkMoney{moneyId :: Int, moneyValue :: Double}
    data Wallet = MkWallet{spent :: [Money], unspent :: [Money], next :: Int}

empty :: Wallet
empty = MkWallet [] [] 0

mint :: Wallet -> Double -> (Wallet, Money)
mint w amount = 
    let s = spent w 
    u = unspent w 
    n = next w
    m = MkMoney n amount
    w' = MkWallet s (m : u) (n + 1)
    in (w', m)

spend :: Wallet -> Money -> Either String (Wallet, Int)
spend w m = 
    let s = spent w 
    u = unspent w 
    n = next w 
    id = moneyId m 
    value = moneyValue m 
    in case break(\m' -> moneyId m' == id) u of
        (before, found : after) -> Right(MkWallet (found :: s) (before ++ after) n, moneyValue found) 
        _ -> any (\m' -> moneyId m' == id) s 
            then Left "already spent"
            else Left "Not found"

verify :: Wallet -> Money -> Bool
verify w m = 
    let id = moneyId m
    s = spent w 
    u = unspent w 
    n = next w 
    in case break (\m' -> moneyId m' == id) u of
        (before, found : after) -> True
        _ -> False


module Wallet (Wallet, Money, empty, mint, spend, verify) where
    
    data Wallet = MkWallet {spent :: [Money], unspent :: [Money], next :: Int}
    data Money = MkMoney{idMoney :: Int, amount :: Int}

    empty :: Wallet
    empty = MkWallet [] [] 0

    mint :: Wallet -> Int -> (Wallet, Money)
    mint w cash = 
        let s = spent w
            u = unspent w
            n = next w
            m = MkMoney n cash
            w' = MkWallet s (m : u) (n + 1)
        in (w', m)

    spend :: Wallet -> Money -> Either String (Wallet, Int)
    spend w m =
        let moneyId = idMoney m
            s = spent w
            u = unspent w
            n = next w
        in case break (\m' -> idMoney m' == moneyId) u of
            (before, found : after) -> Right (MkWallet (before ++ after) (found : s) n, amount found)
            _ ->
                any (\m' -> idMoney m' == moneyId) s
                    then Left "already spent"
                    else Left "unknown token"

    verify :: Wallet -> Money -> Bool
    verify w m = 
        let u = unspent w
        id = idMoney m
        in case break (\m' -> idMoney m' == id) u of
            (before, found : after) -> True
            _ -> False  