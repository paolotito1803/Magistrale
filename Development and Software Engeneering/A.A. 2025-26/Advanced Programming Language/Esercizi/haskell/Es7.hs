module Es7 where
pairs :: Int -> [(Int, Int)] 
pairs n = [(x, y) | x <- [1..n], y <- [x+1..n]]