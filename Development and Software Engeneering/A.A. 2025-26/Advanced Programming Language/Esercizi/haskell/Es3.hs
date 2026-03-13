module Es3 where
myMax :: [Int] -> Int
myMax [x] = x
myMax (x:xs) = max x (myMax xs)