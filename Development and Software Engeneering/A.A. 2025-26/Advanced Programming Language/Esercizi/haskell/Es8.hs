module Es8 where
takeWhile' :: (Int -> Bool) -> [Int] -> [Int] 
takeWhile' p [] = []
makeWhile' p (x:xs)
    | p x       = x : takeWhile' p xs
    | otherwise = [] 